# Klaritex Core Modules: Forensic Analysis & Verifiability (8-11)

This document specifies the "Forensic Depth" layer of the Klaritex engine. These modules (8-11) move beyond scoring and into the adversarial simulation of commitments.

## 1. Introduction: The Adversarial Shift
Modules 8 through 11 represent the shift from *assessment* to *interrogation*. Here, the UI becomes more interactive, shifting from static readouts to simulation environments. The design philosophy shifts from "Observation" to "Stress Testing."

## 2. Module 8: Summary of Commitments (The Signal)
This module extracts only the "Structural Signal" from the document's noise. It is the final, purified list of promises that can actually be enforced.

### 2.1 Extraction Logic
The system filters the text for sentences that contain a minimum of four "Locked In" elements from the Exposure Check (Agent, Action, Object, Timeline).
- **Prose Summary:** The extracted data is presented as a clean, bulleted list of prose.
- **No Interpretation:** The summary must not add "AI interpretation" or "Advice." It must be a direct linguistic distillation of what is in the text.
- **Empty State:** If zero commitments meet the threshold, the UI must state: "No structural commitments detected."

### 2.2 Interaction: The Copy Function
A "Copy to Clipboard" button is required in the top-right of this module. It must use the "Mechanical Click" pattern—transitioning from `shadow-extruded` to `shadow-pressed` on click.

## 3. Module 9: Structural Ambiguity Explanation (The 'Why')
This module explains the "Architecture of Confusion." It provides 2 to 4 bulleted structural observations that explain the Ambiguity Score.

### 3.1 Tone & Content
- **Style:** `DM Mono`, 12px, clinical and observational.
- **Example Observations:**
    - "Agent 'The Company' is a collective pronoun without individual accountability."
    - "Premise is circular: completion depends on future undefined parameters."
    - "Verb 'improve' lacks a measurable baseline or delta."

## 4. Module 10: Commitment Breakdown (The Centerpiece)
This is the most complex module in the Klaritex suite. it is a two-state interface that allows for the physical "Stress Testing" of a claim.

### 4.1 State 1: Breakdown Mode (Default)
A high-density grid showing the extracted values for the six accountability elements.
- **Visuals:** Each element (Agent, Action, etc.) is housed in its own `shadow-pressed` cell.
- **Badges:** Small status badges (Locked In/Unclear/Missing) appear next to each value.

### 4.2 State 2: Stress Test Mode (Active)
When the user toggles the "Stress Test" switch, the entire module must undergo a "Mechanical Shift."

#### 4.2.1 The Reclassification Rules
The UI must visually re-evaluate the elements based on their "Verifiability in 6 Months."
- **Clear -> Testable:** These are the anchors. They remain at 100% opacity and are illuminated by the **Diagnostic Gold** (`#C9A84C`) accent.
- **Broad -> Contested:** These are the legal gray areas. They shift to **Warning Amber** (`#D97706`) and reduce to 70% opacity.
- **Missing -> Untestable:** These are the "noise." They are greyed out to 35% opacity, effectively disappearing from the user's primary focus.

#### 4.2.2 The Verdict Line
A bold summary line appears at the bottom of the module (e.g., "Verdict: Marginal"). This verdict is calculated based on the ratio of Testable to Untestable elements. It must be accompanied by a semantic status dot (Green/Amber/Red).

## 5. Module 11: Verifiable Requirements (The Path to Tier One)
This is the final diagnostic output—a list of "Structural Gaps" that prevent the document from reaching Tier One (Solid) status.

### 5.1 Logic
For every "Unclear" or "Missing" element in the document, this module generates a "Requirement Statement."
- **Example:** If "Timeline" is missing, the requirement is "Define an explicit date for completion."
- **Tier One State:** If all elements are already Clear, the module displays a "Verification Seal" style text: "No additional requirements needed. Requirement is fully verifiable."

### 5.2 Visual Style
Items should be presented as a clean list of short phrases. Avoid bullet points; use generous vertical spacing and `DM Mono` to maintain the "Laboratory Printout" aesthetic.

## 6. The "Mechanical" Stress Toggle
The toggle between Breakdown and Stress Test modes is the most important interaction in the app.
- **Construction:** It should look like a physical, heavy-duty industrial switch.
- **Active State:** When toggled ON, the switch must physically "sink" into the surface using `shadow-pressed`, and its surrounding glow must shift to `lab-gold`. This communicates that a "Machine Process" has been activated.