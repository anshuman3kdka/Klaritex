import { analyzeText } from "./gemini";
import { parseGeminiResponse } from "./parseResponse";
import type { AnalysisMode, AnalysisResult } from "./types";

export async function analyzeWithParseRetry(
  sanitizedText: string,
  mode: AnalysisMode
): Promise<AnalysisResult> {
  let rawResponse = await analyzeText(sanitizedText, mode);

  try {
    return parseGeminiResponse(rawResponse);
  } catch {
    // One retry helps recover from occasional truncated model JSON payloads.
    rawResponse = await analyzeText(sanitizedText, mode);
    return parseGeminiResponse(rawResponse);
  }
}
