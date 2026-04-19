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

---

## Screenshot Setup (for future UI change previews)

This repo includes Playwright and a screenshot command so visual changes can be captured directly from the repository.

### One-time setup
- `playwright` is already listed in `devDependencies`
- On a fresh clone, install the browser binaries before taking screenshots:
  ```bash
  npx playwright install chromium
  ```

### How to take a screenshot
1. Start the app: `npm run dev`
2. If you have not installed Playwright browsers on this machine yet, run: `npx playwright install chromium`
3. In another terminal run: `npm run screenshot -- http://127.0.0.1:3000 screenshots/homepage.png`
4. The image will be saved into the `screenshots/` folder (or whatever path you pass)

### Command format
```bash
npm run screenshot -- <url> <output-file>
```

Example:
```bash
npm run screenshot -- http://127.0.0.1:3000 screenshots/change-1.png
```

---

## Live Smoke Check (pre-commit safety check)

This project includes a **live smoke check** so you can verify the production/live API is still healthy before committing.

### What it checks
The command runs 3 real API scenarios against `LIVE_BASE_URL`:
1. Text analysis (`/api/analyze`)
2. PDF analysis (`/api/analyze-pdf`)
3. URL analysis (`/api/analyze-url`)

For each scenario, it verifies:
- HTTP status is successful
- Response shape contains required analysis fields (`ambiguityScore` and a valid `elements` array)
- Response time is under threshold (default: 60s per scenario)

### Fixture files used
- `tests/fixtures/sample-text.txt`
- `tests/fixtures/tiny-test.pdf`
- `tests/fixtures/sample-url.txt`

### Required environment variables
- `LIVE_BASE_URL` (required) — your deployed site base URL, for example:
  - `https://klaritex.example.com`

Optional:
- `LIVE_TIMEOUT_MS` (default `45000`) — request timeout per API call
- `LIVE_SCENARIO_MAX_MS` (default `60000`) — max allowed response time before scenario fails
- `SKIP_LIVE_CHECK=1` — emergency bypass for the smoke check command

### Run manually before commit
```bash
LIVE_BASE_URL=https://your-live-site.com npm run live:check
```

### Example output
```text
Text analysis: PASS
PDF analysis: PASS
URL analysis: FAIL - Timeout threshold exceeded (62101ms > 60000ms)

Live smoke check summary
+---------------+--------+-----------------------------------------------+
| Scenario      | Result | Reason                                        |
+---------------+--------+-----------------------------------------------+
| Text analysis | PASS   | HTTP 200 in 1450ms                            |
| PDF analysis  | PASS   | HTTP 200 in 2038ms                            |
| URL analysis  | FAIL   | Timeout threshold exceeded (62101ms > 60000ms) |
+---------------+--------+-----------------------------------------------+
```

### Pre-commit hook wiring
This repo includes `.pre-commit-config.yaml` with a local hook that runs:
```bash
npm run live:check
```

If you use the Python `pre-commit` framework, install/enable it once:
```bash
pip install pre-commit
pre-commit install
```

### Emergency bypass options
- Standard Git bypass (skips all commit hooks):
  ```bash
  git commit --no-verify -m "your message"
  ```
- Live-check-only bypass:
  ```bash
  SKIP_LIVE_CHECK=1 git commit -m "your message"
  ```

### Common failure causes
- `LIVE_BASE_URL` is missing or has a typo
- Live deployment is down or returning non-200 errors
- Missing/invalid server auth or API key configuration (for example Gemini key missing in deployment)
- Temporary rate limit on live APIs

### CI (optional but included)
A GitHub Actions workflow is included at `.github/workflows/live-check.yml` and runs on:
- pushes to `main`
- pushes to `release/**`

It runs `npm run live:check` (without `SKIP_LIVE_CHECK`) and uploads `live-smoke-check.log` as a build artifact for traceability.
