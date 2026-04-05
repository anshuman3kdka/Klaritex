import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../systemPrompt.js";

const apiKey = process.env.Klaritex;

if (!apiKey) {
  throw new Error(
    "Missing environment variable 'Klaritex'. Set it before using Gemini."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export async function analyzeText(userInput: string) {
  const result = await model.generateContent(userInput);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(cleaned);
  }
}
