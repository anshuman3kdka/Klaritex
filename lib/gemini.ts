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
  const modelUnavailable =
    m.includes("model") &&
    (m.includes("not found") ||
      m.includes("does not exist") ||
      m.includes("unsupported") ||
      m.includes("decommissioned"));
  return (
    m.includes("missing gemini api key") ||
    m.includes("missing groq api key") ||
    m.includes("missing api key") ||
    m.includes("unavailable") ||
    m.includes("service unavailable") ||
    modelUnavailable ||
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
      ? `Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Analyze the following text (quick mode — be concise):\n\n${text}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0,
      ...(mode === "deep" ? { topP: 0.5 } : {}),
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

async function analyzeWithGroq(text: string, mode: AnalysisMode): Promise<string> {
  const modelCandidates =
    mode === "deep"
      ? ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "moonshotai/kimi-k2-0905"]
      : ["qwen/qwen3-32b", "llama-3.1-8b-instant", "gemma2-9b-it"];
  const promptText =
    mode === "deep"
      ? `Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Analyze the following text (quick mode — be concise):\n\n${text}`;

  for (const model of modelCandidates) {
    try {
      const completion = await getGroqClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: promptText },
        ],
        response_format: { type: "json_object" },
        ...(mode === "deep" ? ({ reasoning_effort: "high", top_p: 0.5 } as const) : {}),
        temperature: 0,
        max_tokens: mode === "deep" ? 8192 : 2048,
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const shouldTryNextModel =
        isProviderUnavailableError(message) && model !== modelCandidates.at(-1);

      if (shouldTryNextModel) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Groq models unavailable.");
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function analyzeText(text: string, mode: AnalysisMode): Promise<string> {
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
