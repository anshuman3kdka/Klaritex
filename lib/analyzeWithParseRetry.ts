import { analyzeText, verifyAnalysis } from "./gemini";
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
      const initialParsed = parseGeminiResponse(rawResponse);

      try {
        const verifiedResponse = await verifyAnalysis(sanitizedText, rawResponse, mode, attempt);
        return parseGeminiResponse(verifiedResponse);
      } catch {
        // If verification fails, still return the first valid parsed result.
        return initialParsed;
      }
    } catch (error) {
      lastParseError = error;
    }
  }

  throw new Error("Analysis parsing failed.", { cause: lastParseError });
}
