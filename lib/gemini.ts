import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

import { SYSTEM_PROMPT } from "@/lib/prompts";
import type { AnalysisMode } from "@/lib/types";
import { getProviderForMode } from "@/lib/ai-config";

// ─── Input sanitization ──────────────────────────────────────────────────────

export function sanitizeInput(text: string): string {
  return text
    .slice(0, 10000)
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

// ─── Error classification ─────────────────────────────────────────────────────

/** @deprecated Use isProviderUnavailableError for provider-agnostic classification. */
export function isGeminiUnavailableErrorMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("missing gemini api key") ||
    m.includes("unavailable") ||
    m.includes("quota") ||
    m.includes("429")
  );
}

export function isProviderUnavailableError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("missing gemini api key") ||
    m.includes("missing groq api key") ||
    m.includes("missing api key") ||
    m.includes("unavailable") ||
    m.includes("service unavailable") ||
    m.includes("model not found") ||
    m.includes("model does not exist") ||
    m.includes("decommissioned model") ||
    m.includes("is decommissioned") ||
    m.includes("unsupported model") ||
    m.includes("quota") ||
    m.includes("429") ||
    m.includes("rate_limit") ||
    m.includes("rate limit")
  );
}

// ─── Gemini provider ──────────────────────────────────────────────────────────

const GEMINI_KEY_NAMES = ["Klaritex", "KLARITEX", "GEMINI_API_KEY"] as const;

function getGeminiKey(): string {
  for (const name of GEMINI_KEY_NAMES) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  throw new Error("Missing Gemini API key. Configure KLARITEX on the server.");
}

let _geminiClient: GoogleGenerativeAI | undefined;
function getGeminiClient(): GoogleGenerativeAI {
  if (!_geminiClient) {
    _geminiClient = new GoogleGenerativeAI(getGeminiKey());
  }
  return _geminiClient;
}

async function analyzeWithGemini(text: string, mode: AnalysisMode): Promise<string> {
  const model = getGeminiClient().getGenerativeModel({
    model: mode === "deep" ? "gemini-3-flash-preview" : "gemini-3.1-flash-lite-preview",
  });
  const promptText =
    mode === "deep"
      ? `Use high reasoning effort internally. Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Use high reasoning effort internally. Analyze the following text (quick mode — be concise):\n\n${text}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0,
      topP: 0.5,
      maxOutputTokens: mode === "deep" ? 8192 : 2048,
      responseMimeType: "application/json",
    },
  });
  return result.response.text();
}

// ─── Groq provider ────────────────────────────────────────────────────────────

const GROQ_KEY_NAMES = ["Klaritex_groq", "KLARITEX_GROQ", "GROQ_API_KEY"] as const;

function getGroqKey(): string {
  for (const name of GROQ_KEY_NAMES) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  throw new Error(
    "Missing Groq API key. Configure one of: Klaritex_groq, KLARITEX_GROQ, GROQ_API_KEY."
  );
}

let _groqClient: Groq | undefined;
function getGroqClient(): Groq {
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: getGroqKey() });
  }
  return _groqClient;
}

// ─── Lightweight provider prewarm ────────────────────────────────────────────

let _providersPrewarmed = false;

function prewarmProviderClients(): void {
  if (_providersPrewarmed) return;
  _providersPrewarmed = true;

  // Validate env keys and initialize SDK clients only; no analysis/API requests.
  try {
    getGeminiClient();
  } catch {
    // Keep existing runtime fallback behavior unchanged.
  }

  try {
    getGroqClient();
  } catch {
    // Keep existing runtime fallback behavior unchanged.
  }
}

// Best-effort module-load prewarm for server environments.
prewarmProviderClients();

async function analyzeWithGroq(text: string, mode: AnalysisMode): Promise<string> {
  const modelCandidates =
    mode === "deep"
      ? ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile", "moonshotai/kimi-k2-0905"]
      : ["qwen/qwen3-32b", "llama-3.1-8b-instant", "gemma2-9b-it"];
  const modelCapabilities: Record<
    string,
    { supports_reasoning_effort: boolean; supports_json_response_format: boolean }
  > = {
    "openai/gpt-oss-120b": { supports_reasoning_effort: true, supports_json_response_format: true },
    "openai/gpt-oss-20b": { supports_reasoning_effort: true, supports_json_response_format: true },
    "llama-3.3-70b-versatile": {
      supports_reasoning_effort: false,
      supports_json_response_format: true,
    },
    "moonshotai/kimi-k2-0905": {
      supports_reasoning_effort: false,
      supports_json_response_format: true,
    },
    "qwen/qwen3-32b": { supports_reasoning_effort: false, supports_json_response_format: true },
    "llama-3.1-8b-instant": {
      supports_reasoning_effort: false,
      supports_json_response_format: true,
    },
    "gemma2-9b-it": { supports_reasoning_effort: false, supports_json_response_format: true },
  };

  // Some Groq models reject unsupported request fields with hard API errors, so we only send per-model supported options to preserve fallback behavior.
  const sharedRequestOptions = {
    temperature: 0,
    top_p: 0.5,
    max_tokens: mode === "deep" ? 8192 : 2048,
  };
  const promptText =
    mode === "deep"
      ? `Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Analyze the following text (quick mode — be concise):\n\n${text}`;

  let lastError: unknown;

  for (const model of modelCandidates) {
    try {
      const capabilities = modelCapabilities[model] ?? {
        supports_reasoning_effort: false,
        supports_json_response_format: false,
      };
      const completion = await getGroqClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: promptText },
        ],
        ...sharedRequestOptions,
        ...(capabilities.supports_json_response_format
          ? { response_format: { type: "json_object" as const } }
          : {}),
        ...(capabilities.supports_reasoning_effort ? { reasoning_effort: "high" as const } : {}),
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      const shouldTryNextModel =
        isProviderUnavailableError(message) && model !== modelCandidates.at(-1);

      if (!shouldTryNextModel) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Groq ${mode} models unavailable.`);
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function analyzeText(text: string, mode: AnalysisMode): Promise<string> {
  // Ensure first boot cycle also attempts prewarm in runtimes that defer module init.
  prewarmProviderClients();

  const primary = getProviderForMode(mode);
  const fallback = primary === "gemini" ? "groq" : "gemini";

  try {
    return await (primary === "gemini" ? analyzeWithGemini(text, mode) : analyzeWithGroq(text, mode));
  } catch (primaryErr) {
    const msg = primaryErr instanceof Error ? primaryErr.message.toLowerCase() : "";
    if (isProviderUnavailableError(msg)) {
      try {
        return await (fallback === "gemini"
          ? analyzeWithGemini(text, mode)
          : analyzeWithGroq(text, mode));
      } catch {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}
