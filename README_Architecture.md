# Klaritex — Architecture & Tech Stack

> **For Codex:** This file defines the full technical architecture. Follow it exactly. Do not introduce libraries, patterns, or structures not listed here unless something is genuinely unavailable, in which case use the closest equivalent and leave a comment.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Use the `app/` directory structure |
| Styling | **Tailwind CSS** | No other CSS frameworks |
| UI Components | **shadcn/ui** | Install and configure at project init |
| AI Engine | **Gemini API** (Google Generative AI) | Via `@google/generative-ai` SDK |
| PDF Parsing | **pdf-parse** | Server-side only |
| URL Scraping | **cheerio** + **node-fetch** | Server-side only |
| Deployment | **Vercel** | Already configured |
| Language | **TypeScript** | Strict mode on |

---

## Environment Variables

The following variables must be configured in Vercel and in `.env.local` for local development:

```
KLARITEX=<your-gemini-api-key>
```

> **Codex:** Never hardcode this key. Always read it from `process.env.KLARITEX` on the server side only. The variable name is `KLARITEX` — do not rename it.

---

## Project Folder Structure

```
klaritex/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, global styles)
│   ├── page.tsx                # Homepage — main analyzer UI
│   ├── globals.css             # Tailwind base + custom CSS vars
│   └── api/
│       ├── analyze/
│       │   └── route.ts        # POST — main analysis endpoint (text input)
│       ├── analyze-pdf/
│       │   └── route.ts        # POST — PDF upload, extract text, analyze
│       └── analyze-url/
│           └── route.ts        # POST — fetch URL, extract content, analyze
│
├── components/
│   ├── ui/                     # shadcn/ui generated components (do not edit manually)
│   ├── analyzer/
│   │   ├── InputPanel.tsx      # Text area, mode selector, submit button
│   │   ├── PdfUpload.tsx       # PDF file upload UI
│   │   ├── UrlInput.tsx        # URL input field UI
│   │   └── ModeToggle.tsx      # Quick Thinking / Deep Thinking toggle
│   └── results/
│       ├── ResultsPanel.tsx    # Container for all output modules
│       ├── AmbiguityScore.tsx  # Score display + tier badge
│       ├── ClarityLevel.tsx    # Level tag display
│       ├── ExposureCheck.tsx   # Locked In / Unclear / Missing distribution
│       ├── UnanchoredClaims.tsx # Count of structurally empty statements
│       ├── VagueLines.tsx      # Highlighted vague sentences + reasons
│       ├── LowestAnchors.tsx   # Weakest structural parts of the text
│       ├── ActionTalkRatio.tsx # Action vs Talk percentage bar
│       ├── CommitmentSummary.tsx # Extracted commitments only
│       ├── AmbiguityExplanation.tsx # Why ambiguity exists
│       ├── CommitmentBreakdown.tsx  # 6-element WHO/WHAT/WHOM/HOW/WHEN/WHY
│       └── VerifiableRequirements.tsx # What is needed to make statement valid
│
├── lib/
│   ├── gemini.ts               # Gemini API client setup
│   ├── parseResponse.ts        # Parses structured JSON from Gemini output
│   ├── extractPdf.ts           # PDF text extraction utility
│   ├── extractUrl.ts           # URL content scraping utility
│   └── types.ts                # All shared TypeScript types/interfaces
│
├── public/
│   └── (static assets)
│
├── .env.local                  # Local env vars (gitignored)
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## API Routes

### POST `/api/analyze`

Accepts plain text, returns structured analysis JSON.

**Request body:**
```json
{
  "text": "string (max 10,000 chars)",
  "mode": "quick" | "deep"
}
```

**Response:** See `README_Prompts.md` for the full response shape.

---

### POST `/api/analyze-pdf`

Accepts a PDF file upload (multipart/form-data), extracts text server-side, then runs the same analysis pipeline as `/api/analyze`.

**Request:** `multipart/form-data` with field `file` (PDF)  
**Response:** Same shape as `/api/analyze`

**Constraints:**
- Extract text using `pdf-parse`
- Truncate extracted text to 10,000 characters before sending to Gemini
- If PDF has no extractable text, return error: `{ error: "PDF contains no extractable text." }`

---

### POST `/api/analyze-url`

Accepts a URL, fetches and strips the page content server-side, then runs analysis.

**Request body:**
```json
{
  "url": "string (valid URL)",
  "mode": "quick" | "deep"
}
```

**Response:** Same shape as `/api/analyze`

**Constraints:**
- Use `node-fetch` to fetch the URL
- Use `cheerio` to extract readable text (strip nav, headers, footers, scripts, styles)
- Extract `<p>`, `<article>`, `<main>` content only
- Truncate to 10,000 characters
- Do NOT follow redirects more than 2 hops
- Return error if URL is unreachable: `{ error: "Could not fetch content from URL." }`

---

## Gemini API Setup (`lib/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.KLARITEX!);

export function getGeminiModel(mode: "quick" | "deep") {
  return genAI.getGenerativeModel({
    model: mode === "deep" ? "gemini-1.5-pro" : "gemini-1.5-flash",
  });
}
```

**Quick Thinking** → `gemini-1.5-flash` (faster, lighter)  
**Deep Thinking** → `gemini-1.5-pro` (slower, more rigorous)

---

## Error Handling

All API routes must return structured errors in the shape:

```json
{
  "error": "Human-readable error message"
}
```

With appropriate HTTP status codes:
- `400` — Bad input (missing text, invalid URL, oversized input)
- `422` — Unprocessable (PDF with no text, URL with no content)
- `500` — Internal error (API failure, parsing failure)
- `503` — Gemini API unavailable

---

## TypeScript Types (`lib/types.ts`)

Define all shared types here. At minimum:

```typescript
export type AnalysisMode = "quick" | "deep";

export type InputMode = "text" | "pdf" | "url";

export type ElementStatus = "clear" | "broad" | "missing";

export type AmbiguityTier = 1 | 2 | 3;

export interface CommitmentElement {
  name: string;       // "Who", "Action", "Object", "Measure", "Timeline", "Premise"
  status: ElementStatus;
  penalty: number;
  notes: string;
}

export interface ExposureItem {
  label: string;
  status: "locked-in" | "unclear" | "missing";
}

export interface VagueLine {
  sentence: string;
  reason: string;
}

export interface StructuralAnchor {
  sentence: string;
  issue: string;
}

export interface AnalysisResult {
  ambiguityScore: number;           // 0.0 – 10.0
  rawPenaltyScore: number;          // 0.0 – 12.0
  tier: AmbiguityTier;
  tierOverride: boolean;            // true if Override Rule triggered
  overrideRule?: "tier-floor" | "critical-pair";
  clarityLevel: number;             // 1–5 (derived from tier/score)
  elements: CommitmentElement[];    // 6 elements
  exposureCheck: ExposureItem[];
  unanchoredClaimsCount: number;
  vagueLines: VagueLine[];
  lowestAnchors: StructuralAnchor[];
  actionRatio: number;              // 0–100 (percentage that is "action")
  talkRatio: number;                // 0–100 (percentage that is "talk")
  ratioLabel: string;               // e.g. "Mostly Talk", "Balanced", "Action-Led"
  commitmentSummary: string;        // Extracted commitments only, no additions
  ambiguityExplanation: string;     // Why ambiguity exists
  verifiableRequirements: string[]; // What would make statement fully valid
}
```

---

## Performance & Constraints

- Max input size: **10,000 characters**
- No client-side API calls to Gemini — all AI calls go through the server
- Show a loading state while analysis is running
- Gracefully degrade: if one output module fails to parse, show the rest
- All output modules are populated from a **single Gemini API call** — do not make multiple calls per analysis
