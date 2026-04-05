import type { AnalysisResult } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseGeminiResponse(raw: string): AnalysisResult {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    if (!isObject(parsed)) {
      throw new Error("Invalid Gemini response shape.");
    }

    if (typeof parsed.ambiguityScore !== "number") {
      throw new Error("Missing or invalid ambiguityScore.");
    }

    const as = parsed.ambiguityScore;
    let clarityLevel = 5;

    if (as <= 2.0) clarityLevel = 1;
    else if (as <= 4.0) clarityLevel = 2;
    else if (as <= 6.0) clarityLevel = 3;
    else if (as <= 8.0) clarityLevel = 4;

    return {
      ...parsed,
      clarityLevel
    } as AnalysisResult;
  } catch (error) {
    throw new Error("Analysis parsing failed.", { cause: error });
  }
}
