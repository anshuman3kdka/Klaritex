# Klaritex — Features & UI Specification

> **For Codex:** This file defines every feature, UI component, and output module. Build exactly what is described. Respect the behavioral constraints listed under each section. The UI behavior rules at the end apply globally.

---

## Page Layout Overview

The app is a **single-page application** (Next.js, App Router, `app/page.tsx`).

Layout structure:
```
Header (branding + tagline)
├── Input Section
│   ├── Input Mode Tabs (Text / PDF / URL)
│   ├── Input Area (context-dependent)
│   ├── Processing Mode Toggle (Quick / Deep)
│   └── Analyze Button
└── Results Section (only shown after analysis completes)
    ├── Score Summary Bar
    └── Output Modules (11 modules, arranged in cards)
```

---

## Header

- **Product name:** Klaritex
- **Tagline:** *"Language Exposed. Accountability Scored."*
- Clean, minimal. No navigation links needed at launch.

---

## Section 1: Input

### Input Mode Tabs

Three tab options the user can switch between:

| Tab | Label | Icon suggestion |
|---|---|---|
| Text | Paste Text | Document/text icon |
| PDF | Upload PDF | Upload icon |
| URL | Analyze URL | Link icon |

Only one input mode is active at a time. Switching tabs clears the current input.

---

### 1A. Text Input Mode

- Large textarea for pasting text
- Character limit: **10,000 characters**
- Show live character count (e.g., "1,240 / 10,000")
- Show warning at 90% of limit
- Placeholder: *"Paste a political statement, policy claim, corporate announcement, or any text you want analyzed..."*

---

### 1B. PDF Upload Mode

- Drag-and-drop zone or file picker
- Accept: `.pdf` only
- Max file size: **5MB**
- On upload, show filename and a "Ready to analyze" state
- Server extracts text from PDF; first 10,000 characters are analyzed
- If PDF has no extractable text: show error — *"This PDF doesn't contain readable text. Try a different file."*

---

### 1C. URL Mode

- Single input field for a URL
- Basic URL validation before submission
- Placeholder: *"https://..."*
- On analysis, the server fetches and strips the page content
- If URL is unreachable: *"Could not fetch content from this URL. Check the address and try again."*
- Note displayed below input: *"Klaritex analyzes the article's text only. It does not search the web or fact-check claims."*

---

### Processing Mode Toggle

Two options displayed as a toggle or segmented control:

| Mode | Label | Description shown to user |
|---|---|---|
| `quick` | Quick | Faster analysis. Good for a first pass. |
| `deep` | Deep | Thorough analysis. Recommended for serious evaluation. |

Default: `quick`

---

### Analyze Button

- Label: **"Analyze"**
- Disabled if input is empty
- While analysis is running: show spinner + *"Analyzing..."* text
- Clicking again during analysis: disabled (no duplicate requests)

---

## Section 2: Results

Results appear below the input section after analysis completes. All 11 output modules are shown together. Each module is a distinct card.

Show a non-blocking **loading skeleton** while results are being fetched — do not replace the entire page.

---

### Score Summary Bar (Top of Results)

This is the first thing visible after analysis. It contains:

1. **Ambiguity Score** — large numeric display (e.g., `7.4`) with one decimal place
2. **Tier Badge** — colored badge:
   - Tier 1: green — "Tier 1 · Low Ambiguity"
   - Tier 2: amber/yellow — "Tier 2 · Medium Ambiguity"
   - Tier 3: red — "Tier 3 · High Ambiguity"
3. **Override Notice** (only if an override rule was triggered):
   - Tier Floor Rule: *"Override: 3+ elements missing — forced Tier 3"*
   - Critical Pair Rule: *"Override: Both Agent and Action are symbolic — AS fixed at 10.0"*

---

## Output Modules (11 Total)

---

### Module 1 — Ambiguity Score

**Component:** `AmbiguityScore.tsx`

Display:
- The numeric AS value prominently (e.g., `7.4 / 10`)
- A horizontal progress bar filled to the score level
- Color the bar: green (0–2.5), amber (2.6–6.0), red (6.1–10.0)
- The Raw Penalty Score beneath in smaller text (e.g., "Raw Penalty Score: 8.9 / 12.0")
- Tier badge (Tier 1 / 2 / 3)

---

### Module 2 — Clarity Level

**Component:** `ClarityLevel.tsx`

Derive a Clarity Level (1–5) from the Ambiguity Score:

| AS Range | Level | Label |
|---|---|---|
| 0.0 – 2.0 | Level 1 | Solid |
| 2.1 – 4.0 | Level 2 | Workable |
| 4.1 – 6.0 | Level 3 | Fragmented |
| 6.1 – 8.0 | Level 4 | Hollow |
| 8.1 – 10.0 | Level 5 | Rhetorical |

Display:
- Level number + label as a tag/badge (e.g., "Level 4 · Hollow")
- One-line description of what that level means:
  - Level 1: "Statement is clear and structurally complete. High accountability."
  - Level 2: "Statement has real content but some gaps. Can be verified with effort."
  - Level 3: "Key elements are missing. Accountability requires significant inference."
  - Level 4: "Statement is mostly structural noise. Minimal real commitment."
  - Level 5: "Statement is rhetorical. Contains no verifiable accountability."

---

### Module 3 — Exposure Check

**Component:** `ExposureCheck.tsx`

Shows how well the text defines consequences and commitments.

For each of the 6 commitment elements, show its status:
- **Locked In** → element is Clear
- **Unclear** → element is Broad
- **Missing** → element is Missing/Symbolic

Display:
- A list of all 6 elements with their status labels
- A distribution bar showing the breakdown (e.g., "3 Locked In · 2 Unclear · 1 Missing")
- Color code: green = Locked In, amber = Unclear, red = Missing

---

### Module 4 — Unanchored Claims

**Component:** `UnanchoredClaims.tsx`

An "unanchored claim" is a statement that sounds meaningful but lacks structural grounding (no agent, no metric, no timeline — the full rhetorical package with no real commitment).

Display:
- A count: *"X unanchored claims detected"*
- If count is 0: *"No unanchored claims found."* in a success state

No list of sentences here — that's covered by Vague Lines (Module 5).

---

### Module 5 — Identify Vague Lines

**Component:** `VagueLines.tsx`

Display:
- Initial state: a button — **"Identify Vague Lines"**
- On click (or if analysis already returned vague lines): expand to show each flagged sentence
- Each item shows:
  - The original sentence (quoted, visually distinct)
  - A short explanation of why it is weak (e.g., "No action defined", "No measurable outcome", "No responsible entity")
- If no vague lines: *"No vague lines detected."*

**Constraint:** Do not rewrite the sentence. Only explain what is missing.

---

### Module 6 — Lowest Structural Anchors

**Component:** `LowestAnchors.tsx`

Shows the weakest parts of the text — the sentences that scored worst on structural completeness.

Display (up to 3 items):
- Original sentence
- Short explanation of the structural failure

Examples of failure types:
- "No action defined"
- "No measurable outcome"
- "No responsible entity"
- "No timeline"
- "Premise is self-referential"
- "Object is abstract"

---

### Module 7 — Action vs Talk Ratio

**Component:** `ActionTalkRatio.tsx`

Measures how much of the text is:
- **Action** — real, verifiable, binary verbs (sign, transfer, publish, appoint...)
- **Talk** — vague, rhetorical, or filler language (fight for, ensure, believe, strive...)

Display:
- A percentage split (e.g., "28% Action / 72% Talk")
- A horizontal segmented bar (green for Action, red for Talk)
- A label derived from the ratio:
  - >70% Action: "Action-Led"
  - 50–70% Action: "Balanced"
  - 30–50% Action: "Mostly Talk"
  - <30% Action: "Just Talk"

---

### Module 8 — Summary of Commitments

**Component:** `CommitmentSummary.tsx`

Extracts only the actual commitments from the text — defined actions, named agents, and timelines if present.

Display:
- A clean prose summary
- If no real commitments exist: *"No extractable commitments found. The text contains no verifiable accountability statements."*

**Constraints:**
- Do NOT add new meaning
- Do NOT interpret or infer
- Do NOT rewrite — only extract what is explicitly present
- Do NOT include rhetorical statements

---

### Module 9 — Structural Ambiguity Explanation

**Component:** `AmbiguityExplanation.tsx`

Explains *why* ambiguity exists in the text — the structural patterns that cause the score to be what it is.

Display:
- 2–4 short bullet points (not a paragraph)

Examples of explanations:
- "Process verb used instead of result verb"
- "No measurable outcome defined"
- "Timeline is absent — commitment cannot be evaluated"
- "Agent is a collective pronoun with no institutional specificity"
- "Premise is circular — justification repeats the claim"

**Constraint:** These are structural observations, not editorial opinions.

---

### Module 10 — Commitment Breakdown

**Component:** `CommitmentBreakdown.tsx`

Breaks the main claim into its 6 accountability components and shows the status of each.

Display as a table or structured card list:

| Component | Question | Extracted Value | Status |
|---|---|---|---|
| Who | Who is doing it? | e.g., "The Ministry of Finance" | Locked In / Unclear / Missing |
| Action | What happens? | e.g., "will transfer" | Locked In / Unclear / Missing |
| Object | Who is affected? | e.g., "$500M to education" | Locked In / Unclear / Missing |
| Measure | How do we know? | e.g., "$500 million" | Locked In / Unclear / Missing |
| Timeline | When? | e.g., "by December 31st" | Locked In / Unclear / Missing |
| Premise | Why? | e.g., "audit confirmed surplus" | Locked In / Unclear / Missing |

Where "Extracted Value" is what was actually found in the text. If Missing, show "—".

---

### Module 11 — Verifiable Requirements

**Component:** `VerifiableRequirements.tsx`

Shows what would be required to make the statement fully verifiable and accountable.

Display:
- A list of missing requirements

Examples:
- "A measurable metric (e.g., reduce X by Y%)"
- "A clear deadline"
- "A named responsible authority"
- "An external, verifiable premise"

If all elements are Clear: *"No additional requirements — this statement is fully verifiable."*

**Constraint:** These are structural gap observations only. Do not frame as suggestions or advice.

---

## UI Behavior Rules (Global)

1. **Keep outputs structured and clean.** No long paragraphs in output modules.
2. **Use cards/sections for each module.** Each module is visually separate.
3. **Highlight weak areas clearly.** Missing elements should be visually distinct (red/orange).
4. **Make important issues visually stand out.** Tier 3 should feel alarming.
5. **No spinner-blocking the whole page.** Use skeleton loaders for results section.
6. **Graceful degradation.** If one module's data is missing from the API response, show that module as "—" instead of crashing.
7. **Mobile-responsive.** Single-column layout on mobile. Cards stack vertically.
8. **No tooltips required at launch.** Keep UI clean.
9. **Dark mode support optional** — light mode is the default.
10. **Copy button on Commitment Summary.** Allow the user to copy the extracted summary.

---

## Error States

| Situation | Message |
|---|---|
| Input is empty | Disable the Analyze button |
| Input exceeds 10,000 characters | "Input is too long. Maximum is 10,000 characters." |
| PDF has no text | "This PDF doesn't contain readable text." |
| URL unreachable | "Could not fetch content from this URL." |
| Gemini API error | "Analysis failed. Please try again in a moment." |
| Response parsing error | "Something went wrong reading the analysis. Please retry." |

---

## Tone & Copy Rules

- All UI copy is direct, minimal, and technical. No marketing fluff in the interface.
- Error messages are plain and specific — explain what happened, not what Klaritex is.
- Module labels match the names in this spec exactly.
- No exclamation marks in UI copy.
