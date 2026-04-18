import { GoogleGenerativeAI } from "@google/generative-ai";

import { SYSTEM_PROMPT, VERIFICATION_PROMPT } from "@/lib/prompts";
import type { AnalysisMode } from "@/lib/types";

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

function getThinkingBudget(mode: AnalysisMode): number {
  // "deep" gets effectively unlimited reasoning budget (-1), "quick" gets none.
  return mode === "deep" ? -1 : 0;
}

function getMaxOutputTokens(mode: AnalysisMode, attempt: number): number {
  if (mode === "deep") {
    // Retry attempts progressively increase token room to reduce truncation risk.
    return attempt === 1 ? 12288 : attempt === 2 ? 16384 : 24576;
  }

  return attempt === 1 ? 2048 : 3072;
}

async function generateWithGemini(
  userText: string,
  mode: AnalysisMode,
  attempt: number,
  systemInstruction: string
): Promise<string> {
  const model = getGeminiClient().getGenerativeModel({
    model: mode === "deep" ? "gemini-3-flash-preview" : "gemini-3.1-flash-lite-preview",
  });
  const generationConfig: Record<string, unknown> = {
    temperature: 0,
    topP: 0.5,
    maxOutputTokens: getMaxOutputTokens(mode, attempt),
    responseMimeType: "application/json",
    // Supported by newer Gemini APIs; passed through as-is by the SDK.
    thinkingConfig: {
      thinkingBudget: getThinkingBudget(mode),
    },
  };

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userText }] }],
    systemInstruction,
    generationConfig,
  });
  return result.response.text();
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
    // Keep existing runtime behavior unchanged.
  }
}

// Best-effort module-load prewarm for server environments.
prewarmProviderClients();

// ─── Public entry point ───────────────────────────────────────────────────────

export async function analyzeText(text: string, mode: AnalysisMode, attempt = 1): Promise<string> {
  // Ensure first boot cycle also attempts prewarm in runtimes that defer module init.
  prewarmProviderClients();

  const promptText =
    mode === "deep"
      ? `Use maximum internal reasoning budget. Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Use minimal internal reasoning budget. Analyze the following text (quick mode — be concise):\n\n${text}`;

  return generateWithGemini(promptText, mode, attempt, SYSTEM_PROMPT);
}

export async function verifyAnalysis(
  originalText: string,
  draftJson: string,
  mode: AnalysisMode,
  attempt = 1
): Promise<string> {
  prewarmProviderClients();

  const verifierInput = [
    "ORIGINAL_TEXT:",
    originalText,
    "",
    "DRAFT_JSON:",
    draftJson,
    "",
    "Return corrected final JSON only.",
  ].join("\n");

  return generateWithGemini(verifierInput, mode, attempt, VERIFICATION_PROMPT);
}
