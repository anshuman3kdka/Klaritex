# Technical Deep Dive: Forensic Pane Linkage & Inspector Sync

This document specifies the bidirectional synchronization logic between the **Source Document Pane** and the **Diagnostic Inspector Pane** in the Vague Line Inspector (Module 8/9).

## 1. Introduction: The Split-Pane Paradigm
The Inspector is a forensic environment. To find the "truth" in a document, the user must be able to see the raw text (The Evidence) and the analytical breakdown (The Finding) simultaneously. Our goal is to make these two panes feel like a single, unified machine.

## 2. The Source Document Pane (Left)
- **Shadow State:** The entire text area should be housed in a large `shadow-pressed` (inset) well. This signifies that it is a "data collection" area—a place where the user looks "into" the document.
- **Typography:** `DM Mono` at 14px with a 1.6 line height. This clinical font makes the text feel like a legal deposition or a code file.
- **Column Gutter:** A small vertical line (1px, `#D1D9E6`) should separate the line numbers from the actual text, further reinforcing the "Code Editor" aesthetic.

## 3. Highlighting Mechanics
Structural weaknesses identified by the engine are highlighted directly in the source text.
- **Color:** Diagnostic Gold (`#C9A84C`) at 15% opacity for the background fill.
- **Underline:** A subtle 1px dashed underline in Gold should accompany the highlight.
- **Interaction (Active):** When a highlight is clicked or its corresponding card is selected, the opacity must increase to 30%, and the underline must become solid.

## 4. The Diagnostic Inspector Pane (Right)
This pane contains the "Analytical Cards" (Modules 8 and 9).
- **Shadow State:** The cards in this pane are `shadow-extruded` (outset). They represent the "Findings" that have been extracted and brought to the surface.
- **Structure:** Cards are stacked vertically with `24px` of spacing between them.

## 5. Bidirectional Scroll Sync
This is the core technical requirement for the Inspector.

### 5.1 Source -> Card Sync
When a user clicks a highlighted phrase in the Source Pane:
1. The right pane must automatically scroll (smoothly) to the corresponding analysis card.
2. The card must briefly "pulse" its shadow to indicate it is the active finding.
3. A subtle SVG connector line (monoline, `#C9A84C`) can briefly draw between the text and the card to guide the eye.

### 5.2 Card -> Source Sync
When a user clicks an analysis card in the Right Pane:
1. The Source Pane must automatically scroll to the relevant paragraph.
2. The highlight in the text must transition to its "Active" state (30% opacity).

## 6. SVG Connector Lines (The "Visual Link")
To reinforce the forensic connection, we use "Connector Lines" during hover states.
- **Trigger:** Hovering over an analysis card.
- **Execution:** A thin (0.5px) SVG path draws from the left edge of the card to the right edge of the corresponding text highlight.
- **Visuals:** Use a "diagnostic gold" stroke with a `stroke-dasharray` to create a technical, dotted feel.

## 7. Interaction Feedback Sequence
1. **Hover:** Highlight glows slightly; connector line appears at 20% opacity.
2. **Click:** Scroll event triggers; highlight deepens; connector line pulses to 100% then fades.
3. **Deselect:** All states return to baseline.

## 8. Implementation Checklist
- [ ] Is the Source Document well correctly recessed (`shadow-pressed`)?
- [ ] Do highlights use the 15% gold opacity standard?
- [ ] Does clicking a highlight trigger a smooth scroll in the right pane?
- [ ] Does clicking a card scroll the text viewer?
- [ ] Are line numbers present and formatted in `DM Mono`?

By perfecting this "Forensic Sync," we allow the user to navigate complex documents with the speed of a developer navigating a codebase, turning a dense text review into a high-efficiency diagnostic process.