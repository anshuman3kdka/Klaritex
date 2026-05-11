# Technical Deep Dive: Stress Test & Adversarial Simulation Logic

This document specifies the interaction logic and visual state-management for the "Stress Test Environment" (Module 10). This is the functional heart of the Klaritex platform.

## 1. The Premise: Accountability over Time
The Stress Test answers a specific question for the user: "If the author of this document disappears, what can I actually enforce in a court of law or a board meeting?" The UI must shift from "What does it say?" to "What is it worth?"

## 2. The Interaction: The "Mechanical Shift"
When the user clicks the "Stress Test" toggle, the application must communicate that the data is being "interrogated."
- **Trigger:** A mechanical toggle component.
- **Visual Feedback:**
    - The toggle itself physically sinks (`shadow-pressed`).
    - The **Diagnostic Gold** (`#C9A84C`) accent illuminates the "Active Stress Mode" pill.
    - A subtle "scanning" animation (a single-pixel gold line) passes vertically over the Commitment Breakdown card.

## 3. The Reclassification Engine
This is the core logic that transforms the UI state. We re-map the "Exposure Check" statuses to "Verifiability" statuses.

### 3.1 Status Re-Mapping Table
| Original Status | Stress Status | Visual Treatment | Logic Rationale |
| :--- | :--- | :--- | :--- |
| **Locked In** | **Testable** | 100% Opacity, Gold Text | These are the anchor points of the document. |
| **Unclear** | **Contested** | 70% Opacity, Amber Text | These will be the subject of future legal disputes. |
| **Missing** | **Untestable** | 35% Opacity, Muted Gray | These provide no accountability and are "noise." |

## 4. Visual Filtering (Focus Management)
The primary goal of the Stress Test is to "Filter out the noise." By reducing the opacity of **Untestable** claims to 35%, we allow the **Testable** (Gold) claims to pop forward.
- **Contrast Rule:** The 35% opacity text must still be *just* legible, but it should clearly feel "deactivated."
- **Focus Rule:** The user's eye should naturally rest on the Gold elements first, the Amber second, and the Gray last.

## 5. The Verdict Calculation (Module 10 Footer)
The Verdict Line is the final conclusion of the Stress Test. It is derived from the "Accountability Ratio" (Testable Elements / Total Elements).

### 5.1 Verdict Tiers
- **Solid (Green Dot):** >80% of elements are Testable. The document is an "Ironclad Commitment."
- **Marginal (Amber Dot):** 40% - 80% of elements are Testable. The document is "Fragile" but workable.
- **Deficient (Red Dot):** <40% of elements are Testable. The document is "Structurally Hollow."

## 6. The Animation Sequence
The transition to Stress Mode must be smooth to avoid jarring the user.
1. **0ms:** Toggle clicked. Toggle shadow flips to `pressed`.
2. **50ms:** Gold "Active Mode" pill illuminates.
3. **100ms:** All "Untestable" rows begin fading to 35% opacity.
4. **100ms:** "Testable" values transition color from Black to Diagnostic Gold.
5. **200ms:** Verdict Line slides up from the bottom of the card.
6. **Total Duration:** 300ms.

## 7. Implementation Checklist
- [ ] Does the Stress Test toggle have a physical `shadow-pressed` state?
- [ ] Are "Untestable" items accurately faded to 35%?
- [ ] Is the **Diagnostic Gold** (`#C9A84C`) used as the primary indicator for "Testable"?
- [ ] Does the "Verdict Line" change color/text based on the actual ratio of testable elements?
- [ ] Is the transition between modes smooth (approx. 300ms)?

By following this specification, the Stress Test becomes more than a feature—it becomes a tactile "Audit Machine" that provides the user with an uncompromising look at their document's true value.