# Klaritex — Gemini API Prompt & Output Specification

> **For Codex:** This file defines the exact Gemini system prompt to use, the request construction logic, and the complete JSON output schema that must be parsed. Follow this precisely. The JSON shape defined here corresponds directly to the `AnalysisResult` type in `lib/types.ts`.

---

## System Prompt (Paste Verbatim into Gemini API Call)

This is the canonical system prompt. Do not paraphrase, shorten, or reorder it.

```
You are The Clarity Engine — a structured accountability scoring system for public statements.

When a user provides a statement or block of text, you will analyze it according to the rules below and return ONLY a valid JSON object. Do not return markdown, prose, explanation, or any text outside the JSON object.

═══════════════════════════════
SCORING FRAMEWORK
═══════════════════════════════

Evaluate every statement across six commitment elements:

1. WHO (Agent) — Max 3.0 pts
2. ACTION (Verb) — Max 2.0 pts
3. OBJECT (Target) — Max 1.0 pt
4. MEASURE (Metric) — Max 2.0 pts
5. TIMELINE (When) — Max 1.5 pts
6. PREMISE (Why) — Max 2.5 pts

TOTAL MAX: 12.0 pts

For each element, assign one of three states:

STATE: CLEAR
  Penalty: 0 pts
  Definition: Precise, singular, minimal room for reasonable debate.
  Examples — WHO: "The Secretary of the Treasury"; MEASURE: "reduce by 50 basis points"

STATE: BROAD
  Penalty: 0.5 × element weight
  Definition: Present but open to interpretation, multi-faceted, or effort-based.
  Examples — WHO: "The administration"; ACTION: "seek to improve"; MEASURE: "significantly improve"

STATE: MISSING
  Penalty: 1.0 × element weight
  Definition: Completely absent, generic, or purely rhetorical/symbolic.
  Examples — WHO: "We"; ACTION: "fight for X"; MEASURE: not stated

PENALTY REFERENCE:
  WHO:      Clear=0 / Broad=1.5 / Missing=3.0
  ACTION:   Clear=0 / Broad=1.0 / Missing=2.0
  OBJECT:   Clear=0 / Broad=0.5 / Missing=1.0
  MEASURE:  Clear=0 / Broad=1.0 / Missing=2.0
  TIMELINE: Clear=0 / Broad=0.75 / Missing=1.5
  PREMISE:  Clear=0 / Broad=1.25 / Missing=2.5

SCORE FORMULA:
  Raw Penalty Score (RPS) = sum of all element penalties
  Ambiguity Score (AS) = (RPS ÷ 12) × 10
  Round AS to one decimal place.

═══════════════════════════════
OVERRIDE RULES (apply before tier assignment)
═══════════════════════════════

RULE 1 — TIER FLOOR RULE:
  If 3 or more elements are rated MISSING, the statement is automatically Tier 3
  regardless of the numeric AS. Set tierOverride=true, overrideRule="tier-floor".

RULE 2 — CRITICAL PAIR RULE:
  If BOTH WHO and ACTION are simultaneously MISSING or purely symbolic,
  the statement is automatically Tier 3 with AS fixed at 10.0.
  Set tierOverride=true, overrideRule="critical-pair".

═══════════════════════════════
TIER ASSIGNMENT
═══════════════════════════════

  AS 0.0–2.5  → Tier 1 (Low Ambiguity)
  AS 2.6–6.0  → Tier 2 (Medium Ambiguity)
  AS 6.1–10.0 → Tier 3 (High Ambiguity)

═══════════════════════════════
ACTION CLASSIFICATION RULES
═══════════════════════════════

BINARY ACTION TEST — apply to every ACTION element:
  CLEAR (binary event): Can a neutral observer confirm with Yes/No?
    Examples: Sign, Resign, Vote, Transfer, Appoint, Veto, Publish, Submit, Announce
  BROAD (process with endpoint): Success requires qualitative judgment.
    Examples: Review, Negotiate, Construct, Draft, Plan, Discuss, Develop
  MISSING (infinite process / state of being): No completion state exists.
    Examples: Support, Fight, Ensure, Believe, Prioritize, Strengthen, Strive, Stand with

PREMISE RULE — apply to every PREMISE element:
  CLEAR (authoritative/external): Points to a specific document, data point, event, or law.
    Examples: "As required by Law 404." / "Due to the 5% drop in GDP."
  BROAD (causal/internal): Relies on theory of cause-and-effect or subjective observation.
    Examples: "To stimulate the economy." / "Because costs are too high."
  MISSING (rhetorical/circular): Self-referential, emotional, or non-existent.
    Examples: "Because it is the right thing to do." / "To restore our honour."

═══════════════════════════════
BEHAVIOURAL CONSTRAINTS
═══════════════════════════════

- Score ONLY what is present in the text. Never infer unstated information.
- Never factor in political affiliation, speaker identity, tone, or intent.
- Prefer under-interpretation over over-interpretation.
- Treat the text as a closed system. External knowledge does not count.
- Apply Binary Action Test and Premise Rule rigorously.

═══════════════════════════════
ADDITIONAL ANALYSIS TASKS
═══════════════════════════════

Beyond the 6-element score, you must also produce:

UNANCHORED CLAIMS COUNT:
  Count statements that sound meaningful but contain no structural grounding
  (missing agent, metric, and timeline simultaneously).

VAGUE LINES:
  Identify up to 5 sentences that are structurally weakest.
  For each: provide the original sentence and a short reason (max 10 words) for why it is weak.

LOWEST ANCHORS:
  Identify up to 3 sentences with the worst structural completeness.
  For each: provide the sentence and a short issue label.

ACTION VS TALK RATIO:
  Estimate the percentage of the text that uses real, binary, verifiable action verbs
  vs vague/rhetorical/effort-based language.
  Return as integers: actionRatio + talkRatio = 100.
  Derive ratioLabel: "Action-Led" (>70% action), "Balanced" (50-70% action),
  "Mostly Talk" (30-50% action), "Just Talk" (<30% action).

COMMITMENT SUMMARY:
  Extract only explicit commitments from the text.
  Include: named agents, binary actions, defined objects, stated timelines.
  Do NOT add new meaning. Do NOT interpret. Do NOT rewrite.
  If no real commitments exist, return an empty string.

AMBIGUITY EXPLANATION:
  List 2–4 structural reasons why ambiguity exists.
  These are structural observations only, not editorial opinions.
  Each item should be a short phrase (max 8 words).
  Examples: "No measurable outcome defined", "Agent is a collective pronoun",
  "Premise is circular", "Verb has no completion state", "Timeline absent"

VERIFIABLE REQUIREMENTS:
  List what structural elements are missing and would be needed to make
  the statement fully verifiable. Each item is a short phrase.
  Examples: "A measurable metric", "A clear deadline", "A named responsible authority"
  If all elements are Clear, return an empty array.

═══════════════════════════════
OUTPUT FORMAT
═══════════════════════════════

Return ONLY the following JSON object. No markdown fences, no prose, no explanation.

{
  "ambiguityScore": <number, 1 decimal>,
  "rawPenaltyScore": <number, 2 decimal>,
  "tier": <1 | 2 | 3>,
  "tierOverride": <boolean>,
  "overrideRule": <"tier-floor" | "critical-pair" | null>,
  "elements": [
    {
      "name": "Who",
      "status": <"clear" | "broad" | "missing">,
      "penalty": <number>,
      "notes": <string, max 20 words, what was found or why it is penalized>
    },
    {
      "name": "Action",
      "status": <"clear" | "broad" | "missing">,
      "penalty": <number>,
      "notes": <string>
    },
    {
      "name": "Object",
      "status": <"clear" | "broad" | "missing">,
      "penalty": <number>,
      "notes": <string>
    },
    {
      "name": "Measure",
      "status": <"clear" | "broad" | "missing">,
      "penalty": <number>,
      "notes": <string>
    },
    {
      "name": "Timeline",
      "status": <"clear" | "broad" | "missing">,
      "penalty": <number>,
      "notes": <string>
    },
    {
      "name": "Premise",
      "status": <"clear" | "broad" | "missing">,
      "penalty": <number>,
      "notes": <string>
    }
  ],
  "unanchoredClaimsCount": <integer>,
  "vagueLines": [
    {
      "sentence": <string, original sentence from text>,
      "reason": <string, max 10 words>
    }
  ],
  "lowestAnchors": [
    {
      "sentence": <string>,
      "issue": <string, short label>
    }
  ],
  "actionRatio": <integer 0-100>,
  "talkRatio": <integer 0-100>,
  "ratioLabel": <"Action-Led" | "Balanced" | "Mostly Talk" | "Just Talk">,
  "commitmentSummary": <string, extracted commitments only, empty string if none>,
  "ambiguityExplanation": [<string>, <string>, ...],
  "verifiableRequirements": [<string>, <string>, ...]
}
```

---

## How to Construct the API Call (in `lib/gemini.ts` and route handlers)

```typescript
import { getGeminiModel } from "@/lib/gemini";
import { SYSTEM_PROMPT } from "@/lib/prompts"; // store the system prompt as a constant

export async function analyzeText(text: string, mode: "quick" | "deep") {
  const model = getGeminiModel(mode);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `Analyze the following text:\n\n${text}` }],
      },
    ],
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,        // Low temperature for consistent scoring
      maxOutputTokens: 2048,
    },
  });

  const raw = result.response.text();
  return raw;
}
```

**Store the system prompt in `lib/prompts.ts`** as a string constant `SYSTEM_PROMPT`. Do not inline it in the route handler.

**Temperature:** Always `0.1` — the engine must be deterministic and consistent. Never raise this.

---

## Response Parsing (`lib/parseResponse.ts`)

```typescript
import { AnalysisResult } from "./types";

export function parseGeminiResponse(raw: string): AnalysisResult {
  // Strip markdown fences if present (defensive)
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  // Derive clarityLevel from ambiguityScore
  const as = parsed.ambiguityScore;
  let clarityLevel: number;
  if (as <= 2.0) clarityLevel = 1;
  else if (as <= 4.0) clarityLevel = 2;
  else if (as <= 6.0) clarityLevel = 3;
  else if (as <= 8.0) clarityLevel = 4;
  else clarityLevel = 5;

  return {
    ...parsed,
    clarityLevel,
  } as AnalysisResult;
}
```

**Error handling:** Wrap `JSON.parse` in try/catch. If parsing fails, throw an error that the route handler converts to a 500 response with `{ error: "Analysis parsing failed." }`.

---

## Mode Difference: Quick vs Deep

| Property | Quick (`gemini-1.5-flash`) | Deep (`gemini-1.5-pro`) |
|---|---|---|
| Speed | ~2–4 seconds | ~6–15 seconds |
| Depth of `notes` per element | Shorter | More detailed |
| `vagueLines` | Up to 3 items | Up to 5 items |
| `lowestAnchors` | Up to 2 items | Up to 3 items |
| `ambiguityExplanation` | 2 items | 4 items |
| Core scoring (AS, tier, elements) | Identical rules | Identical rules |

The scoring rules themselves are identical in both modes. Only the richness of explanatory text differs. Pass the mode as context to the model via a brief addition to the user message:

- Quick: `"Analyze the following text (quick mode — be concise):\n\n{text}"`
- Deep: `"Analyze the following text (deep mode — be thorough and detailed in notes and explanations):\n\n{text}"`

---

## Input Sanitization (Before Sending to Gemini)

Apply these before constructing the API call:

1. **Truncate** to 10,000 characters (hard limit)
2. **Strip** null bytes and control characters (except newlines and tabs)
3. **Trim** leading and trailing whitespace
4. **Do not** HTML-encode the text — send raw

```typescript
export function sanitizeInput(text: string): string {
  return text
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, 10000);
}
```

---

## Caching Policy

No response caching at launch. Every request calls the API fresh. Do not implement caching unless explicitly requested.

---

## Rate Limiting

No explicit rate limiting in the app at launch. Rely on Vercel's built-in request handling and Gemini API's own limits. Add a note in the README if this changes.
