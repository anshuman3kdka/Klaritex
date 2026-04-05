# Klaritex — The Clarity Engine (Scoring Doctrine)

> **For Codex:** This file is the canonical definition of The Clarity Engine. It defines how every statement is scored. The scoring logic in this file is embedded verbatim into the Gemini system prompt (see `README_Prompts.md`). Do NOT modify this logic. Do NOT simplify it. Implement it exactly as written.

---

## Overview

The Clarity Engine scores any public statement by analyzing its **structural completeness across 6 commitment elements**. It produces an **Ambiguity Score (AS)** from 0 (Perfect Clarity) to 10 (Maximum Ambiguity).

The engine is **not** a fact-checker. It does not evaluate whether claims are true. It only evaluates whether claims are **structurally complete enough to be verified**.

---

## The Six Commitment Elements

Every statement is evaluated across these six elements:

| # | Element | Max Penalty (pts) | Rationale |
|---|---|---|---|
| 1 | **Who is Responsible? (Agent)** | 3.0 | The single most critical factor. Without a named agent, accountability is politically null. |
| 2 | **What Action is Being Taken? (Verb)** | 2.0 | Determines if the commitment can close. Verifiable act vs. infinite effort. |
| 3 | **On What / For Whom? (Object/Target)** | 1.0 | Scope of the action. Less critical than Agent, Measure, or Timeline. |
| 4 | **By What Measure? (Metric)** | 2.0 | Defines how success is measured. Essential for post-facto evaluation. |
| 5 | **By When? (Timeline)** | 1.5 | The evaluation window. A missing timeline makes even clear statements unjudgeable. |
| 6 | **Stated Premise / Justification (Why?)** | 2.5 | The stated reason the action is necessary. Missing premise removes all grounding. |
| | **TOTAL** | **12.0** | Maximum possible Raw Penalty Score (RPS). |

---

## Scoring States

Each element is assigned one of three states. The penalty is the state multiplier × the element's max weight.

| State | Definition | Penalty Multiplier |
|---|---|---|
| **Clearly Specified (Clear)** | Precise, singular, leaves minimal room for reasonable debate. e.g., "The Secretary of the Treasury"; "reduce by 50 basis points" | **0 × Weight = 0 pts** |
| **Broadly Specified (Broad)** | Present but open to interpretation, multi-faceted, or effort-based. e.g., "The administration"; "seek to improve"; "significantly improve" | **0.5 × Weight** |
| **Missing / Symbolic** | Completely absent, generic, or purely rhetorical/symbolic. e.g., "We"; "fight for X"; metric not stated | **1.0 × Weight** |

---

## Score Calculation

```
Step 1: Sum all element penalties → Raw Penalty Score (RPS)
Step 2: AS = (RPS ÷ 12) × 10
Step 3: Apply Override Rules (see below)
Step 4: Classify into Tier
```

---

## Ambiguity Tiers

| Ambiguity Score (AS) | Tier | Interpretation |
|---|---|---|
| 0.0 – 2.5 | **Tier 1 — Low Ambiguity** | Specific enough to verify later with minimal interpretation. Highly accountable. |
| 2.6 – 6.0 | **Tier 2 — Medium Ambiguity** | Contains real commitments but leaves key details open. Requires gap-filling. |
| 6.1 – 10.0 | **Tier 3 — High Ambiguity** | Heavily symbolic or expressive. Lacks multiple critical elements. Accountability is functionally zero. |

---

## Override Rules (Applied Before Tier Assignment)

Override rules supersede the numeric score. Apply them after calculating AS, before assigning tier.

### Rule 1: The Tier Floor Rule ("3 Strikes")

> If a statement contains **3 or more elements rated as Missing**, the statement is automatically **Tier 3 (High Ambiguity)** regardless of the numeric AS.

**Rationale:** If half or more of the accountability structure is absent, any remaining specific details are likely misleading or decorative. The structure has collapsed.

### Rule 2: The Critical Pair Rule

> If **both Who (Agent) AND Action (Verb) are simultaneously Missing or purely symbolic**, the statement is automatically **Tier 3 with a fixed AS of 10.0**.

**Example trigger:** *"We believe in a better future"* — Who is "We" (Missing/symbolic) and Action is "believe" (Missing/symbolic). Both absent. → AS = 10.0

---

## Rule 3: The Binary Action Test

Apply this test to determine the status of the **Action (Verb)** element. This is the most consequential scoring decision.

**Rule:** Can a neutral observer confirm the action was completed with a simple Yes/No, without needing a qualitative judgment?

| Status | Definition | Test | Examples |
|---|---|---|---|
| **Clear** | Binary Event. Done or not done. No quality judgment required. | "Did they sign it? Yes or No." | Sign, Resign, Vote, Transfer, Appoint, Veto, Publish, Announce, Submit, Commence |
| **Broad** | Process with an endpoint. Success requires qualitative judgment. | "Did they review it? (Yes, but how well?)" | Review, Negotiate, Construct, Draft, Plan, Discuss, Develop, Implement (when open-ended) |
| **Missing** | State of Being / Infinite Process. No completion state exists. | "Did they support it? (You can always support more.)" | Support, Fight, Ensure, Believe, Prioritize, Strengthen, Stand with, Strive, Pursue |

---

## Rule 4: The Premise Rule

Apply this rule to determine the status of the **Premise / Justification (Why?)** element.

**Rule:** Does the justification point to an External Reality (Data/Law/Event) or Internal Logic (Opinion/Theory)?

| Status | Definition | Examples |
|---|---|---|
| **Clear** | Authoritative/External. Points to a specific document, data point, event, or law that exists outside the speaker's mind. | "As required by Law 404." / "Due to the 5% drop in GDP." / "Following the flood event on Tuesday." |
| **Broad** | Causal/Internal. Relies on a theory of cause-and-effect or a subjective observation. May be true, but is debatable. | "To stimulate the economy." / "Because costs are too high." / "In order to improve safety." |
| **Missing** | Rhetorical/Circular. Self-referential, emotional, or non-existent. | "Because it is the right thing to do." / "To restore our honour." / "Because we must." |

---

## Detailed Element Assessment Guide

### Element 1 — Who is Responsible? (Agent) — Max 3.0 pts

| State | Example | Penalty |
|---|---|---|
| Clear | "The Federal Reserve's Board of Governors will..." | 0 pts |
| Broad | "The Administration will..." (multiple agencies, no single point of failure) | 1.5 pts |
| Missing | "We will..." / "Inflation will be reduced..." (passive voice or generic collective) | 3.0 pts |

### Element 2 — What Action is Being Taken? (Verb) — Max 2.0 pts

| State | Example | Penalty |
|---|---|---|
| Clear | "...implement the Housing First protocol across all agencies..." (verifiable, specific, binary) | 0 pts |
| Broad | "...dedicate more resources to combat..." (effort-based; resources are fungible) | 1.0 pt |
| Missing | "...fight homelessness..." (purely rhetorical/symbolic, no completion state) | 2.0 pts |

### Element 3 — On What / For Whom? (Object/Target) — Max 1.0 pt

| State | Example | Penalty |
|---|---|---|
| Clear | "...target the national debt's interest payments." | 0 pts |
| Broad | "...address the national debt and fiscal responsibility." (too wide a scope) | 0.5 pts |
| Missing | "...fix the finances." (generic, abstract noun) | 1.0 pt |

### Element 4 — By What Measure? (Metric) — Max 2.0 pts

| State | Example | Penalty |
|---|---|---|
| Clear | "...increase 3rd-grade literacy rates by 15% on the national standardised test." | 0 pts |
| Broad | "...ensure high standards of academic excellence." (subjective, non-quantitative) | 1.0 pt |
| Missing | "...improve education for our children." (no metric provided) | 2.0 pts |

### Element 5 — By When? (Timeline) — Max 1.5 pts

| State | Example | Penalty |
|---|---|---|
| Clear | "...by Q3 of the next fiscal year." | 0 pts |
| Broad | "...in the near future." / "...during this term." (too vague, can shift) | 0.75 pts |
| Missing | "...at an appropriate time." / no timeline stated | 1.5 pts |

### Element 6 — Stated Premise / Justification (Why?) — Max 2.5 pts

| State | Example | Penalty |
|---|---|---|
| Clear | "...because internal data shows a 10% decline in output over the last quarter." (specific, verifiable data) | 0 pts |
| Broad | "...because the economy is weak and consumer confidence is low." (general, subjective descriptors) | 1.25 pts |
| Missing | "...to secure the future." / "...because we believe." (purely aspirational, no grounding) | 2.5 pts |

---

## Behavioural Constraints (Engine Rules)

The Clarity Engine must always:

1. **Score only what is present in the text.** Do not infer unstated information.
2. **Apply the Binary Action Test rigorously.** An action is Clear only if a neutral observer can verify it with Yes/No.
3. **Apply the Premise Rule rigorously.** A premise is Clear only if it references an external, verifiable fact, law, or data point.
4. **Never factor in political affiliation, tone, speaker identity, or intent.**
5. **Never add commentary, opinion, or recommendations outside the output format.**
6. **Prefer under-interpretation over over-interpretation.** If ambiguous, score higher (more penalized).
7. **Treat the text as a closed system.** External knowledge about what a statement might mean does not count.
8. **Apply Override Rules before tier assignment.** Numeric scores are superseded by structural collapse rules.

---

## Worked Example — Maximum Ambiguity (AS 10.0)

**Statement:** *"We will fight for a better tomorrow for all our citizens, because we believe in hope and change."*

| # | Element | State | Penalty |
|---|---|---|---|
| 1 | Who? ("We") | Missing/Symbolic | 3.0 |
| 2 | Action? ("will fight for") | Missing/Symbolic | 2.0 |
| 3 | Object? ("a better tomorrow for all") | Missing/Symbolic | 1.0 |
| 4 | Measure? | Missing | 2.0 |
| 5 | When? | Missing | 1.5 |
| 6 | Premise? ("we believe in hope and change") | Missing/Symbolic | 2.5 |
| | **Total RPS** | | **12.0** |

**AS = (12.0 ÷ 12) × 10 = 10.0**  
**Override:** Critical Pair Rule triggered (both WHO and ACTION are Missing/Symbolic) → Tier 3, AS = 10.0

---

## Worked Example — Low Ambiguity (AS 0.0)

**Statement:** *"The Ministry of Finance will transfer $500 million from the stabilization fund to the public education budget by December 31st, 2024, as confirmed by last month's audit of surplus revenue."*

| # | Element | State | Penalty |
|---|---|---|---|
| 1 | Who? (Ministry of Finance) | Clear | 0 |
| 2 | Action? (transfer) | Clear | 0 |
| 3 | Object? ($500M to education budget) | Clear | 0 |
| 4 | Measure? ($500 million) | Clear | 0 |
| 5 | When? (December 31st, 2024) | Clear | 0 |
| 6 | Premise? (last month's audit confirming surplus) | Clear | 0 |
| | **Total RPS** | | **0.0** |

**AS = 0.0 → Tier 1 (Low Ambiguity)**
