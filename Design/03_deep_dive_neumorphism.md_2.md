# Technical Deep Dive: Laboratory White Shadow Systems (Neumorphism)

This document provides the exhaustive CSS specification and design rationale for the "Laboratory White" aesthetic—the core visual language of the Klaritex platform.

## 1. The Philosophy of "White-on-White" Depth
In traditional UI design, hierarchy is created through color, borders, and high-contrast backgrounds. In the "Laboratory White" environment, we reject these conventions. Hierarchy is created through **Elevation** and **Recession**.

The entire application exists on a single, continuous surface (`#EBEFF5`). To distinguish modules, we do not use borders; we use the way light hits a physical object. This creates a tactile, professional atmosphere that feels like a piece of high-end medical equipment or industrial hardware.

## 2. Core Color Tokens: The Foundation
For the neumorphic effect to work, the background and the surface of the elements must be identical.
- **Surface & Background:** `#EBEFF5`
- **Text (Primary):** `#1A1F22` (Clinical Black)
- **Text (Muted):** `#7A8B99` (Structural Gray)
- **Accent (Active):** `#C9A84C` (Diagnostic Gold)

## 3. The Shadow Tokens: Outset (Extruded)
The "Extruded" state makes an element look like it is popping out of the page. This is used for primary module containers, primary buttons, and any element that represents a "Result" or "Output."

### 3.1 CSS Specification
- **Top-Left Shadow:** `-6px -6px 12px #FFFFFF` (The Light Source)
- **Bottom-Right Shadow:** `6px 6px 12px #D1D9E6` (The Cast Shadow)
- **Combined Box-Shadow:** `box-shadow: 6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF;`

## 4. The Shadow Tokens: Inset (Pressed)
The "Pressed" state makes an element look like it has been carved into the surface. This is used for data wells, text inputs, tracks for progress bars, and the "Active" state of toggles/buttons.

### 4.1 CSS Specification
- **Top-Left Shadow:** `inset 4px 4px 8px #D1D9E6`
- **Bottom-Right Shadow:** `inset -4px -4px 8px #FFFFFF`
- **Combined Box-Shadow:** `box-shadow: inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF;`

## 5. Visual Hierarchy through Corner Radius
Consistency in rounding is critical to maintaining the "Industrial Product" feel.
- **Main Cards (Large):** `16px`. These represent major modules.
- **Inner Modules/Pills (Small):** `8px`. These represent data segments within a module.
- **The "Diagnostic Dial":** `50%` (Perfect Circle). Used for Module 1 and Module 4 to denote "Global Status."

## 6. Interaction Patterns: The Mechanical Shift
Every interactive element must provide physical feedback.
- **Button Hover:** On hover, the `shadow-extruded` should slightly increase in blur radius (e.g., `12px` to `16px`) to simulate the button "lifting" toward the user.
- **Button Click:** On click, the button must instantly swap from `shadow-extruded` to `shadow-pressed`. This provides the tactile sensation of a physical button being depressed into a console.
- **Transition Duration:** All shadow transitions must use `transition: all 0.2s ease-in-out`. Anything faster feels "digital" and jarring; anything slower feels "sluggish."

## 7. The Gold Illumination
Diagnostic Gold (`#C9A84C`) is our only non-semantic color. It is reserved for "Verification."
- **Active State Glow:** When an element is in an "Active Diagnostic" state (like the Stress Test), it can use a subtle gold outer glow: `box-shadow: 0 0 15px rgba(201, 168, 76, 0.4)`. This simulates the "Backlighting" of an expensive medical monitor.

## 8. Implementation Checklist for Frontend Designers
- [ ] Is the background color exactly `#EBEFF5`?
- [ ] Are there zero `1px` borders in the UI? (Depth must be shadow-only).
- [ ] Does every button physically "sink" on click?
- [ ] Are the dark shadows using `#D1D9E6` and not a generic gray?
- [ ] Is the light source consistently coming from the top-left (145 degrees)?

By following these rules, the interface will achieve the "Laboratory White" aesthetic—a design that feels engineered, not just drawn.