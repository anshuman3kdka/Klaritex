# Klaritex — Features README (Core Module)

## Overview

This document defines all features of the **Klaritex (formerly Klarilens)** module.

Klaritex is the **core analysis engine** of the app. It takes text (or documents) and evaluates how structurally clear and complete the statements are.

It does **not**:
- fact-check
- interpret intent
- add missing information

It only evaluates **what is present vs what is missing** in the text.

---

## AI Engine Connection

- The scoring and analysis logic is handled by the AI engine.
- Connect all analysis requests to the **Gemini API**.
- Use the environment variable:

Klaritex

- This key is already stored in **Vercel environment variables**.
- All analysis outputs (scores, breakdowns, flags) must come from this AI layer.

---

## Scoring System Reference

- The ambiguity scoring logic and rules are defined in:

KlaritexEngine.docx

- The AI must strictly follow that rubric when generating:
  - ambiguity scores
  - structural classifications
  - breakdown outputs

---

## Input System

### 1. Text Input
- User can paste text directly
- Character limit: 10,000
- Real-time or button-triggered analysis

### 2. PDF Upload
- Accept PDF files
- Extract text
- Send extracted text to the same Klaritex engine

### 3. URL Mode
- Accept a single URL
- Fetch article content
- Analyze only the extracted content
- Do NOT perform external searches or fact-checking

---

## Processing Modes

### Quick Thinking
- Faster response
- Lower depth
- Used for casual checks

### Deep Thinking
- Slower but more detailed
- Full structural analysis
- Used for serious evaluation

---

## Output: Klaritex Result

### 1. Ambiguity Score
- Numeric score displayed clearly
- Lower = better clarity
- Higher = more ambiguity

---

### 2. Clarity Level

Display a level tag based on score:

- Level 1 → Solid (clear and structured)
- Higher levels → increasing ambiguity

---

### 3. Exposure Check

Show how well the text defines consequences and commitments.

Categories:
- **Locked In** → clear and actionable
- **Unclear** → vague or incomplete
- **Missing** → not present

Also show:
- number of items checked
- distribution bar (visual)

---

### 4. Unanchored Claims

- Count statements that sound meaningful but lack structure
- Display total number

---

### 5. Identify Vague Lines

- Button: “Identify Vague Lines”
- On click:
  - highlight weak sentences
  - show why they are weak

---

### 6. Lowest Structural Anchors

Show the weakest parts of the text.

Each item should include:
- original sentence
- short explanation of what is missing

Example issues:
- no action defined
- no measurable outcome
- no responsible entity

---

### 7. Action vs Talk Ratio

Measure how much of the text is:

- **Action** → real, verifiable verbs
- **Talk** → vague or filler language

Display:
- percentage split
- label (e.g. “Just Talk”)

---

### 8. Summary of Commitments

Generate a clean summary containing only:

- actual commitments
- defined actions
- timelines (if present)

Rules:
- do NOT add new meaning
- do NOT interpret
- only extract what exists

---

### 9. Structural Ambiguity Explanation

Explain *why* ambiguity exists.

Examples:
- “process instead of result”
- “no measurable outcome”
- “timeline missing”

Keep explanations short and clear.

---

### 10. Commitment Breakdown

Break the main claim into components:

- Who is doing it?
- What happens?
- Who is affected?
- How do we know?
- When?
- Why?

Each should be marked as:
- Locked In
- Unclear
- Missing

---

### 11. Verifiable Requirements

Show what is required to make the statement fully valid.

Examples:
- measurable metric
- clear deadline
- defined responsibility

---

## UI Behavior Rules

- Keep outputs structured and clean
- Avoid long paragraphs
- Use cards / sections for each feature
- Highlight weak areas clearly
- Make important issues visually stand out

---

## System Constraints

Klaritex must always follow:

- No assumptions
- No external knowledge
- No rewriting beyond summary
- No judgment (only structure)

---

## Summary

Klaritex converts language into structure.

It helps users see:
- what is clearly defined
- what is vague
- what is missing

Everything must be generated through the Gemini-powered Klaritex engine using the defined scoring rubric.
