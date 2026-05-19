## 2025-02-14 - Custom UI Primitive Focus States
**Learning:** Custom interactive UI primitives in this design system (like divs acting as buttons or dropzones) do not inherently show focus states against the dark theme, making them inaccessible to keyboard users without explicit styles. Additionally, ARIA roles are sometimes missing when using generic HTML tags for these primitives.
**Action:** When building or modifying custom interactive components (tabs, radios, custom file uploads), always verify keyboard navigation and add `focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none` explicitly to ensure visibility. Also ensure proper ARIA semantic roles (e.g., `tablist`/`tab`, `radiogroup`/`radio`) are applied if not using semantic HTML elements.
## 2025-02-14 - CSS Grid Animations and Accessibility
**Learning:** When using CSS `grid-template-rows: 0fr` to hide collapsible content with animation, the elements remain in the DOM, allowing screen readers to access them and keyboard users to tab into invisible content. This creates a confusing and inaccessible experience.
**Action:** Use `visibility: hidden` combined with the CSS `transition` property on `visibility`. This elegantly delays the element becoming fully `hidden` until the transition completes, keeping it accessible only when visually expanded.
## 2025-02-14 - Copyright link Focus States
**Learning:** The copyright text in the footer lacked an accessible link, making it non-interactive and lacking proper focus states for keyboard users.
**Action:** Wrapped the copyright name in an `<a>` tag with proper `href`, `target="_blank"`, `rel="noopener noreferrer"`, and explicit focus styles (`focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none`) to maintain keyboard accessibility within the dark theme.
## 2025-02-14 - React State Updates and Focus Loss
**Learning:** When navigating custom tablists or radiogroups with Arrow keys in React, programmatic `.focus()` calls often fail if executed immediately following a state update because the DOM has not yet flushed the changes.
**Action:** Wrap `.focus()` calls with `setTimeout(..., 0)` inside the `onKeyDown` handler to delay execution until the next tick, ensuring the targeted element is successfully updated in the DOM and receives focus.
## 2025-02-14 - Roving Tabindex Implementations
**Learning:** Generic tags implementing interactive ARIA roles (like `<div role="radiogroup">` or `<div role="tablist">`) with their generic children buttons do not manage focus inherently. Setting all generic elements to `tabIndex={0}` forces the user to Tab through every item rather than using standardized Arrow key navigation.
**Action:** Implement a roving tabindex by assigning `tabIndex={0}` exclusively to the active item, and `tabIndex={-1}` to all inactive items, coupled with explicit Arrow key handlers on the parent container.
