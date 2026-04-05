import fs from "node:fs";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.Klaritex;

if (!apiKey) {
  throw new Error(
    "Missing environment variable 'Klaritex'. Set it before using Gemini."
  );
}

const systemInstruction = fs.readFileSync(
  path.join(process.cwd(), "lib", "KlaritexEngine.prompt.txt"),
  "utf8"
);

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0,
    topP: 0,
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
