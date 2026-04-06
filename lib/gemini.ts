import { GoogleGenerativeAI } from "@google/generative-ai";

import { SYSTEM_PROMPT } from "@/lib/prompts";
import type { AnalysisMode } from "@/lib/types";

const GEMINI_API_KEY_ENV_NAMES = ["Klaritex", "KLARITEX", "GEMINI_API_KEY"] as const;

export function sanitizeInput(text: string): string {
  return text
    .trim()
    .slice(0, 10000)
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

function getConfiguredGeminiApiKey(): string {
  for (const envName of GEMINI_API_KEY_ENV_NAMES) {
    const value = process.env[envName]?.trim();

    if (value) {
      return value;
    }
  }

  throw new Error("Missing Gemini API key. Configure KLARITEX (or GEMINI_API_KEY) on the server.");
}

export function isGeminiUnavailableErrorMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes("missing gemini api key") ||
    lowerMessage.includes("unavailable") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("429")
  );
}

export function getGeminiModel(mode: AnalysisMode) {
  const apiKey = getConfiguredGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: mode === "deep" ? "gemini-3-flash-preview" : "gemini-3.1-flash-lite-preview"
  });
}

export async function analyzeText(text: string, mode: AnalysisMode): Promise<string> {
  const model = getGeminiModel(mode);
  const promptText =
    mode === "deep"
      ? `Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n${text}`
      : `Analyze the following text (quick mode — be concise):\n\n${text}`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048
    }
  });

  return result.response.text();
}
