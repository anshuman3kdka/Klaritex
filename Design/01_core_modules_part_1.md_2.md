# Klaritex Core Modules: The Dashboard & Macro-Metrics (1-7)

This document serves as the primary technical specification for the "Executive Command" layer of the Klaritex engine. It details the structural logic, mathematical mapping, and visual hierarchy for the first seven modules of the document analysis suite.

## 1. Introduction: The Macro-Perspective
The first seven modules are designed to provide an immediate, high-density diagnostic assessment of any document. This is where the user transitions from raw text into structured data. The design goal here is "Editorial Authority"—the UI must not only show numbers but communicate a verdict with clinical precision.

## 2. Module 1: Ambiguity Score (The Primary Output)
The Ambiguity Score is the "North Star" metric of the entire Klaritex platform. It is a weighted average of structural failures across the analyzed text.

### 2.1 Logical Requirements
- **Data Format:** A float between 0.0 and 10.0, displayed to one decimal place (e.g., 7.8).
- **The Raw Penalty:** Beneath the primary score, the system must display the "Raw Penalty Score"—the unnormalized sum of all detected structural failures. This is rendered in `DM Mono` at 11px to communicate transparency.

### 2.2 Visual Implementation
- **The Neumorphic Dial:** The score must be housed in a large, circular dial. The outer ring is "extruded" (outset shadow), while the inner well containing the number is "pressed" (inset shadow). This creates the physical sensation of a high-end laboratory gauge.
- **The Segmented Arc:** A visual progress bar must wrap around the dial. This is not a solid fill but a segmented arc representing the 0-10 scale.
- **Tier-Bound Color Mapping:**
    - **0.0 - 4.0 (Green/Success):** Tier One. High structural integrity.
    - **4.1 - 7.0 (Amber/Warning):** Tier Two/Three. Significant rhetorical noise.
    - **7.1 - 10.0 (Red/Critical):** Tier Four/Five. Structurally deficient.

## 3. Module 2: Clarity Level (The Interpretive Label)
While Module 1 provides the "What," Module 2 provides the "So What." It translates a mathematical score into a human-readable classification.

### 3.1 Classification Tiers
- **Level One: Solid (AS 0.0 - 2.0):** Requirements are clear, agents are named, and timelines are binding.
- **Level Two: Workable (AS 2.1 - 4.0):** Generally actionable but contains minor unquantified modifiers.
- **Level Three: Fragmented (AS 4.1 - 6.0):** Significant gaps in accountability; requires manual clarification.
- **Level Four: Hollow (AS 6.1 - 8.0):** Performative language with almost no verifiable anchors.
- **Level Five: Rhetorical (AS 8.1 - 10.0):** Purely aspirational. No legal or structural weight detected.

### 3.2 Visual Execution
The Level (e.g., "L2") should be rendered in a large, elegant `Playfair Display` serif font. This contrasts with the clinical `DM Mono` description beneath it, creating the "Elegant Authority" requested in the design philosophy.

## 4. Module 3: Exposure Check (The Accountability Matrix)
This module breaks down the document into the "Six Elements of Commitment."

### 4.1 The Six Elements
1. **Agent:** Who is responsible?
2. **Action:** What exactly is being done?
3. **Object:** What is the target of the action?
4. **Metric:** How is it measured?
5. **Timeline:** When must it be completed?
6. **Premise:** What conditions must be met?

### 4.2 Status Logic
Each element is assigned one of three states:
- **Locked In (Success Green):** The element is explicitly defined and clear.
- **Unclear (Warning Amber):** The element is present but broad or subjective.
- **Missing (Critical Red):** The element is entirely absent from the text.

### 4.3 The Distribution Bar
At the top of the matrix, a segmented horizontal bar shows the proportion of these three states across the entire document. This provides a "health check" for the document's accountability profile at a glance.

## 5. Module 4: Unanchored Claims (The Rhetoric Filter)
This module acts as a high-pass filter for "fluff." It specifically targets statements that sound meaningful but contain no structural grounding.

### 5.1 Logic
A claim is "Unanchored" if it is missing its **Agent**, **Metric**, and **Timeline** simultaneously. (e.g., "We will strive for excellence.")
The module displays a single integer count of these statements.

### 5.2 Visual Implementation
The count is rendered in `DM Mono` at a very large scale, centered within a circular "pressed" well. The goal is to make this number feel heavy and unmovable.

## 6. Module 5: Identify Vague Lines (Top 5 Weaknesses)
This module lists the "Greatest Offenders" in the document—the five sentences that contribute most to the high Ambiguity Score.

### 6.1 Content Requirements
- **The Quote:** The original sentence must be quoted exactly in `Inter` italic.
- **The Reason:** A structural reason (not an editorial opinion) must be provided in `DM Mono`. This reason must be 10 words or fewer (e.g., "Verb 'strive' has no binary completion state").

## 7. Module 6: Lowest Structural Anchors
While Module 5 looks at ambiguity, Module 6 looks at the failure of completion. It lists the 3 sentences with the worst "Structural Completeness."

### 7.1 Visual Tagging
Each entry must include a stark, red "Issue Label" (e.g., `[NO TIMELINE]`, `[ABSENT AGENT]`). These labels should be monospaced and contained within a small, subtle inset pill to denote a "tag" or "error code" feel.

## 8. Module 7: Action vs Talk Ratio
This module visualizes the linguistic balance of the document.

### 8.1 Data Mapping
- **Action Verbs:** Verbs with a binary success/failure state (e.g., "deliver," "pay," "publish").
- **Talk/Rhetoric:** Verbs or phrases that describe effort or intent without a completion state (e.g., "strive," "aim," "seek," "explore").

### 8.2 Labeling Logic
- **>70% Action:** Action-Led
- **50-70% Action:** Balanced
- **30-50% Action:** Mostly Talk
- **<30% Action:** Just Talk

### 8.3 Visualization
A horizontal bar chart with `var(--shadow-pressed)` for the track and `var(--shadow-extruded)` for the segments. The "Action" segment uses the signature `Diagnostic Gold`, while the "Talk" segment uses a muted neutral.