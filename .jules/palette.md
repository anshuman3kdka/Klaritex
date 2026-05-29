## 2025-02-14 - Custom UI Primitive Focus States
**Learning:** Custom interactive UI primitives in this design system (like divs acting as buttons or dropzones) do not inherently show focus states against the dark theme, making them inaccessible to keyboard users without explicit styles. Additionally, ARIA roles are sometimes missing when using generic HTML tags for these primitives.
**Action:** When building or modifying custom interactive components (tabs, radios, custom file uploads), always verify keyboard navigation and add `focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none` explicitly to ensure visibility. Also ensure proper ARIA semantic roles (e.g., `tablist`/`tab`, `radiogroup`/`radio`) are applied if not using semantic HTML elements.
## 2025-02-14 - CSS Grid Animations and Accessibility
**Learning:** When using CSS `grid-template-rows: 0fr` to hide collapsible content with animation, the elements remain in the DOM, allowing screen readers to access them and keyboard users to tab into invisible content. This creates a confusing and inaccessible experience.
**Action:** Use `visibility: hidden` combined with the CSS `transition` property on `visibility`. This elegantly delays the element becoming fully `hidden` until the transition completes, keeping it accessible only when visually expanded.
## 2025-02-14 - Copyright link Focus States
**Learning:** The copyright text in the footer lacked an accessible link, making it non-interactive and lacking proper focus states for keyboard users.
**Action:** Wrapped the copyright name in an `<a>` tag with proper `href`, `target="_blank"`, `rel="noopener noreferrer"`, and explicit focus styles (`focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none`) to maintain keyboard accessibility within the dark theme.
## 2025-02-14 - ModeToggle Roving Tabindex
**Learning:** Custom `role="radiogroup"` components using generic buttons need to implement a roving tabindex (active item `tabIndex={0}`, inactive `tabIndex={-1}`) and handle explicit arrow key navigation so that all radio options do not mistakenly enter the sequential tab order.
**Action:** When creating custom radio buttons/groups, always manage keyboard focus using arrow keys and update tabindex so the user can easily tab past the group.
