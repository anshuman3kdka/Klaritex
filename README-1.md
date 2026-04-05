# Klaritex — Structural Clarity Engine

> **For Codex / AI Build Agent:** This repository contains a complete technical specification split across multiple README files. Read ALL of them before writing a single line of code. They are the source of truth. Do not infer, invent, or fill gaps — if something is unspecified, ask before proceeding.

---

## What Klaritex Is

Klaritex is a **language analysis web application** that detects ambiguity, structural weakness, and accountability gaps in public statements, documents, and any text input.

It is powered by **The Clarity Engine** — a structured scoring rubric that breaks any statement into 6 commitment elements and assigns an **Ambiguity Score (AS)** from 0 (Perfect Clarity) to 10 (Maximum Ambiguity).

Klaritex is **not** a rewriting tool. It does **not** fix language, guess intent, or fill in what is missing. It only **exposes** where meaning breaks down.

---

## Core Positioning

| What Klaritex Does | What Klaritex Does NOT Do |
|---|---|
| Detects structural gaps in statements | Rewrite or improve text |
| Scores ambiguity on a 0–10 scale | Guess intent or fill missing information |
| Identifies vague verbs, missing agents, absent metrics | Fact-check claims |
| Breaks statements into 6 accountability elements | Offer opinions or recommendations |
| Exposes rhetorical language masquerading as commitment | Evaluate moral correctness of claims |

---

## The README File Map

This repository is structured around a set of README files that collectively form the full product specification. Each README is a standalone document targeting a specific concern.

| File | Purpose |
|---|---|
| `README.md` | **This file.** Master overview and build directive. |
| `README_Architecture.md` | Tech stack, folder structure, environment setup, deployment. |
| `README_Engine.md` | The Clarity Engine: scoring rubric, override rules, element guide. This is the brain of the product. |
| `README_Features.md` | Every UI feature and output module, with exact behavior specs. |
| `README_Prompts.md` | The canonical Gemini API system prompt and structured output format spec. |

---

## Product Summary

**Input:** Text (paste), PDF upload, or URL  
**Processing:** Gemini API running The Clarity Engine scoring rubric  
**Output:** Structured diagnostic breakdown — score, tier, element-by-element analysis, vague line identification, action/talk ratio, commitment summary, and more

**Primary use cases:**
- Political and policy statement analysis
- Corporate communications audit
- Legal and contractual language review
- Journalism and media literacy
- Academic writing review
- Strategic communication evaluation

---

## Design Philosophy

> *"Klaritex treats language as a formal system, not a narrative."*

- **Exposure over correction** — Reveal problems, never fix them
- **Structure over interpretation** — Score only what is present; never infer
- **Precision over completeness** — Under-interpret rather than over-interpret
- **Diagnostic, not generative** — The output is a map of failures, not a suggested rewrite

---

## Build Directive for Codex

You are building Klaritex from scratch. The deliverable is a **production-ready Next.js web application** deployed on Vercel.

**Before writing any code:**
1. Read `README_Architecture.md` for the tech stack and project structure
2. Read `README_Engine.md` for the scoring logic (you will hardcode this into the Gemini system prompt)
3. Read `README_Features.md` for every UI component and behavior
4. Read `README_Prompts.md` for the exact API prompt and output parsing spec

**Rules:**
- Do not deviate from the feature spec without flagging it
- Do not add features not listed in the spec
- Do not change the scoring logic in `README_Engine.md` — it is a fixed rubric
- The Gemini API key is stored in Vercel environment variables as `KLARITEX` — never hardcode it
- All AI analysis must go through the backend API route — never call Gemini directly from the client
