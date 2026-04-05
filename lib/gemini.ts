import { GoogleGenerativeAI } from "@google/generative-ai";

import { SYSTEM_PROMPT } from "@/lib/prompts";
import type { AnalysisMode } from "@/lib/types";

export function sanitizeInput(text: string): string {
  return text
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, 10000);
}

export function getGeminiModel(mode: AnalysisMode) {
  const apiKey = process.env.KLARITEX;

  if (!apiKey) {
    throw new Error("Missing KLARITEX environment variable.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: mode === "deep" ? "gemini-1.5-pro" : "gemini-1.5-flash"
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
      temperature: 0.1,
      maxOutputTokens: 2048
    }
  });

  return result.response.text();
}
