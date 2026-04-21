import type { AnalysisResult } from "./types";
import type { CommitmentElement, ElementStatus } from "./types";

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

function extractFirstBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  const regex = /[{}"\\]/g;
  regex.lastIndex = start;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const char = match[0];
    const i = match.index;

    if (inString) {
      if (char === "\"") {
        inString = false;
      } else if (char === "\\") {
        // Skip the next character as it's escaped
        regex.lastIndex += 1;
      }
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    } else if (char === "\"") {
      inString = true;
    }
  }

  return null;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const candidate = extractFirstBalancedJsonObject(text);
    if (candidate !== null) {
      return JSON.parse(candidate);
    }
    throw new Error("JSON payload not found in model response.");
  }
}

const ELEMENT_ORDER = ["Who", "Action", "Object", "Measure", "Timeline", "Premise"] as const;
const ELEMENT_MAX_PENALTIES: Record<(typeof ELEMENT_ORDER)[number], number> = {
  Who: 3,
  Action: 2,
  Object: 1,
  Measure: 2,
  Timeline: 1.5,
  Premise: 2.5,
};

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toElementStatus(value: unknown): ElementStatus {
  return value === "clear" || value === "broad" || value === "missing" ? value : "missing";
}

function buildFallbackPenalty(name: (typeof ELEMENT_ORDER)[number], status: ElementStatus): number {
  if (status === "clear") return 0;
  if (status === "broad") return ELEMENT_MAX_PENALTIES[name] * 0.5;
  return ELEMENT_MAX_PENALTIES[name];
}

function normalizeElements(rawElements: unknown): CommitmentElement[] {
  const source = Array.isArray(rawElements) ? rawElements : [];
  const byName = new Map<string, Record<string, unknown>>();

  for (const item of source) {
    if (!isObject(item) || typeof item.name !== "string") continue;
    byName.set(item.name.toLowerCase(), item);
  }

  return ELEMENT_ORDER.map((name) => {
    const raw = byName.get(name.toLowerCase());
    const status = toElementStatus(raw?.status);
    const penalty = toFiniteNumber(raw?.penalty, buildFallbackPenalty(name, status));
    const notes = typeof raw?.notes === "string" && raw.notes.trim() ? raw.notes.trim() : "Not specified.";

    return {
      name,
      status,
      penalty: clamp(penalty, 0, ELEMENT_MAX_PENALTIES[name]),
      notes,
    };
  });
}

function normalizeStringArray(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
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

    const ambiguityScore = clamp(toFiniteNumber(parsed.ambiguityScore, 10), 0, 10);
    let clarityLevel = 5;

    if (ambiguityScore <= 2.0) clarityLevel = 1;
    else if (ambiguityScore <= 4.0) clarityLevel = 2;
    else if (ambiguityScore <= 6.0) clarityLevel = 3;
    else if (ambiguityScore <= 8.0) clarityLevel = 4;

    const elements = normalizeElements(parsed.elements);

    const rawPenaltyFromElements = Number(
      elements.reduce((sum, element) => sum + toFiniteNumber(element.penalty, 0), 0).toFixed(2)
    );
    const rawPenaltyScore = clamp(
      toFiniteNumber(parsed.rawPenaltyScore, rawPenaltyFromElements),
      0,
      12
    );

    const inferredTier = ambiguityScore <= 2.5 ? 1 : ambiguityScore <= 6.0 ? 2 : 3;
    const tier = parsed.tier === 1 || parsed.tier === 2 || parsed.tier === 3 ? parsed.tier : inferredTier;
    const tierOverride = typeof parsed.tierOverride === "boolean" ? parsed.tierOverride : false;
    const overrideRule =
      parsed.overrideRule === "tier-floor" || parsed.overrideRule === "critical-pair"
        ? parsed.overrideRule
        : null;

    const unanchoredClaimsCount = Math.max(0, Math.trunc(toFiniteNumber(parsed.unanchoredClaimsCount, 0)));

    const vagueLines = Array.isArray(parsed.vagueLines)
      ? parsed.vagueLines
          .filter((item): item is Record<string, unknown> => isObject(item))
          .map((item) => ({
            sentence: typeof item.sentence === "string" ? item.sentence.trim() : "",
            reason: typeof item.reason === "string" ? item.reason.trim() : "",
          }))
          .filter((item) => item.sentence.length > 0 && item.reason.length > 0)
          .slice(0, 5)
      : [];

    const lowestAnchors = Array.isArray(parsed.lowestAnchors)
      ? parsed.lowestAnchors
          .filter((item): item is Record<string, unknown> => isObject(item))
          .map((item) => ({
            sentence: typeof item.sentence === "string" ? item.sentence.trim() : "",
            issue: typeof item.issue === "string" ? item.issue.trim() : "",
          }))
          .filter((item) => item.sentence.length > 0 && item.issue.length > 0)
          .slice(0, 3)
      : [];

    const actionRatio = clamp(Math.round(toFiniteNumber(parsed.actionRatio, 0)), 0, 100);
    const talkRatio = clamp(Math.round(toFiniteNumber(parsed.talkRatio, 100 - actionRatio)), 0, 100);
    const ratioLabel =
      parsed.ratioLabel === "Action-Led" ||
      parsed.ratioLabel === "Balanced" ||
      parsed.ratioLabel === "Mostly Talk" ||
      parsed.ratioLabel === "Just Talk"
        ? parsed.ratioLabel
        : actionRatio > 70
          ? "Action-Led"
          : actionRatio >= 50
            ? "Balanced"
            : actionRatio >= 30
              ? "Mostly Talk"
              : "Just Talk";

    return {
      ambiguityScore: Number(ambiguityScore.toFixed(1)),
      rawPenaltyScore: Number(rawPenaltyScore.toFixed(2)),
      tier,
      tierOverride,
      overrideRule,
      clarityLevel,
      elements,
      unanchoredClaimsCount,
      vagueLines,
      lowestAnchors,
      actionRatio,
      talkRatio,
      ratioLabel,
      commitmentSummary: typeof parsed.commitmentSummary === "string" ? parsed.commitmentSummary.trim() : "",
      ambiguityExplanation: normalizeStringArray(parsed.ambiguityExplanation, 4),
      verifiableRequirements: normalizeStringArray(parsed.verifiableRequirements, 8),
    };
  } catch (error) {
    throw new Error("Analysis parsing failed.", { cause: error });
  }
}
