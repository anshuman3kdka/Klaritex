import type { AnalysisResult } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanModelResponse(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error("JSON payload not found in model response.");
  }
}

export function parseGeminiResponse(raw: string): AnalysisResult {
  try {
    if (!raw || raw.trim() === "") {
      throw new Error("Model response was empty.");
    }

    const cleaned = cleanModelResponse(raw);
    const parsed: unknown = tryParseJson(cleaned);

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
