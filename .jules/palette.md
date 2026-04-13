## 2025-02-14 - Custom UI Primitive Focus States
**Learning:** Custom interactive UI primitives in this design system (like divs acting as buttons or dropzones) do not inherently show focus states against the dark theme, making them inaccessible to keyboard users without explicit styles. Additionally, ARIA roles are sometimes missing when using generic HTML tags for these primitives.
**Action:** When building or modifying custom interactive components (tabs, radios, custom file uploads), always verify keyboard navigation and add `focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none` explicitly to ensure visibility. Also ensure proper ARIA semantic roles (e.g., `tablist`/`tab`, `radiogroup`/`radio`) are applied if not using semantic HTML elements.
## 2025-02-14 - CSS Grid Animations and Accessibility
**Learning:** When using CSS `grid-template-rows: 0fr` to hide collapsible content with animation, the elements remain in the DOM, allowing screen readers to access them and keyboard users to tab into invisible content. This creates a confusing and inaccessible experience.
**Action:** Use `visibility: hidden` combined with the CSS `transition` property on `visibility`. This elegantly delays the element becoming fully `hidden` until the transition completes, keeping it accessible only when visually expanded.
## 2025-02-14 - Copyright link Focus States
**Learning:** The copyright text in the footer lacked an accessible link, making it non-interactive and lacking proper focus states for keyboard users.
**Action:** Wrapped the copyright name in an `<a>` tag with proper `href`, `target="_blank"`, `rel="noopener noreferrer"`, and explicit focus styles (`focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none`) to maintain keyboard accessibility within the dark theme.

## 2025-04-13 - Input Form Accessibility
**Learning:** Dynamic input form error and description linking must use `aria-describedby` holding multiple IDs conditionally and `aria-invalid` on the input, along with `role="alert"` on the error container for proper screen reader support.
**Action:** Apply this pattern using conditional strings for `aria-describedby` and boolean checks for `aria-invalid` on all custom form inputs.
