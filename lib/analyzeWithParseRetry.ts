import { analyzeText } from "./gemini";
import { parseGeminiResponse } from "./parseResponse";
import type { AnalysisMode, AnalysisResult } from "./types";

export async function analyzeWithParseRetry(
  sanitizedText: string,
  mode: AnalysisMode
): Promise<AnalysisResult> {
  let lastParseError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const rawResponse = await analyzeText(sanitizedText, mode, attempt);

    try {
      return parseGeminiResponse(rawResponse);
    } catch (error) {
      lastParseError = error;
    }
  }

  throw new Error("Analysis parsing failed.", { cause: lastParseError });
}
