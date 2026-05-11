# Technical Deep Dive: Typographic Tension & Precision

This document specifies the typographic framework for the Klaritex platform. Our design relies on the intentional tension between two contrasting font families: `Playfair Display` and `DM Mono`.

## 1. The Rationale: Authority vs. Precision
Klaritex is a dual-purpose tool. It provides high-level executive conclusions (Authority) and forensic data breakdowns (Precision). Our typography must reflect this duality.
- **The Serif (`Playfair Display`):** Communicates history, legal authority, and the "Final Verdict." It is used for results that require human trust.
- **The Monospace (`DM Mono`):** Communicates the machine, the algorithm, and the "Data Truth." It is used for the process of extraction and structural analysis.

## 2. Elegant Authority: Playfair Display
`Playfair Display` is our high-contrast serif. It should be used sparingly to maintain its impact.

### 2.1 Usage Rules
- **Global Scores:** The large integer in Module 1 (Ambiguity Score) and the Level label in Module 2 (Clarity Level).
- **Module Titles:** While titles use Mono for clinical feel, the *content* of the conclusion (e.g., "Verdict: Marginal") uses Playfair for weight.
- **Weight & Scaling:** Use Weight 600 for headings and 400 for large numeric readouts. Never use weights below 400, as the thin strokes will disappear against the white neumorphic background.

### 2.2 CSS Configuration
```css
font-family: 'Playfair Display', serif;
font-weight: 600;
letter-spacing: -0.01em;
line-height: 1.1;
```

## 3. Clinical Precision: DM Mono
`DM Mono` is our workhorse font. It provides the "Laboratory Printout" feel that defines the platform.

### 3.1 Usage Rules
- **Diagnostic Findings:** Every structural observation, reason for ambiguity, and extracted value.
- **Labels:** Small, all-caps module labels (e.g., "OVERALL AMBIGUITY").
- **Raw Data:** Raw Penalty scores, word counts, and metadata.
- **Code/Status:** Status pills (e.g., `LOCKED IN`, `MISSING`) and Issue Labels (e.g., `[NO TIMELINE]`).

### 3.2 Label Treatment
To maximize the "Mechanical" feel, module labels should use the following treatment:
- Font: `DM Mono`
- Size: `11px`
- Case: `UPPERCASE`
- Tracking: `0.1em` (Generous letter spacing)
- Color: `#7A8B99` (Muted)

## 4. System Prose: Inter
Because Monospaced fonts are difficult to read in long-form prose, we use `Inter` (a clean, neutral sans-serif) as the "bridge" font.

### 4.1 Usage Rules
- **Document Text:** The actual content of the analyzed contract or speech.
- **Executive Summaries:** The "Summary of Commitments" prose.
- **Instructions:** Tooltips and system help text.

### 4.2 Prose Specs
- Size: `15px`
- Line Height: `1.6` (Open and readable)
- Color: `#1A1F22` (Primary Text)

## 5. The Typographic Hierarchy Map
| Element | Font Family | Size | Weight | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Ambiguity Score** | Playfair Display | 48px | 400 | Elegant, authoritative verdict. |
| **Module Labels** | DM Mono | 11px | 500 | Clinical, mechanical identifier. |
| **Diagnostic Findings**| DM Mono | 13px | 400 | Clean, structured data readout. |
| **Document Text** | Inter | 15px | 400 | Neutral, highly legible source. |
| **Status Badges** | DM Mono | 10px | 600 | High-visibility system status. |

## 6. Implementation Checklist
- [ ] Are all numeric scores rendered in `Playfair Display`?
- [ ] Are all "Reasons" and structural findings monospaced?
- [ ] Are module labels small, uppercase, and generously spaced?
- [ ] Is the document text using a high line-height for legibility?
- [ ] Is there a clear distinction between "The Machine's Data" (Mono) and "The Expert's Conclusion" (Serif)?

By maintaining this typographic tension, we ensure that Klaritex feels like both a cutting-edge algorithm and a trusted legal partner.