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

export function isGeminiUnavailableErrorMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("missing gemini api key") ||
    m.includes("missing groq api key") ||
    m.includes("missing api key") ||
    m.includes("unavailable") ||
    m.includes("quota") ||
    m.includes("429") ||
    m.includes("rate_limit")
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

async function analyzeWithGemini(text: string, mode: AnalysisMode): Promise<string> {
  const genAI = new GoogleGenerativeAI(getGeminiKey());
  const model = genAI.getGenerativeModel({
    model: mode === "deep" ? "gemini-1.5-pro" : "gemini-1.5-flash",
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
      maxOutputTokens: mode === "deep" ? 8192 : 2048,
    },
  });
  return result.response.text();
}

// ─── Groq provider ────────────────────────────────────────────────────────────

function getGroqKey(): string {
  const v = process.env["Klaritex_groq"]?.trim();
  if (!v) throw new Error("Missing Groq API key. Configure Klaritex_groq on the server.");
  return v;
}

async function analyzeWithGroq(text: string, mode: AnalysisMode): Promise<string> {
  const client = new Groq({ apiKey: getGroqKey() });
  const model = mode === "deep" ? "openai/gpt-oss-120b" : "qwen/qwen3-32b";
  const promptText =
    mode === "deep"
      ? `Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Analyze the following text (quick mode — be concise):\n\n${text}`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: promptText },
    ],
    temperature: 0,
    max_tokens: mode === "deep" ? 8192 : 2048,
  });
  return completion.choices[0]?.message?.content ?? "";
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function analyzeText(text: string, mode: AnalysisMode): Promise<string> {
  const provider = getProviderForMode(mode);
  return provider === "gemini"
    ? analyzeWithGemini(text, mode)
    : analyzeWithGroq(text, mode);
}
