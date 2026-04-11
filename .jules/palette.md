## 2025-02-14 - Custom UI Primitive Focus States
**Learning:** Custom interactive UI primitives in this design system (like divs acting as buttons or dropzones) do not inherently show focus states against the dark theme, making them inaccessible to keyboard users without explicit styles. Additionally, ARIA roles are sometimes missing when using generic HTML tags for these primitives.
**Action:** When building or modifying custom interactive components (tabs, radios, custom file uploads), always verify keyboard navigation and add `focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none` explicitly to ensure visibility. Also ensure proper ARIA semantic roles (e.g., `tablist`/`tab`, `radiogroup`/`radio`) are applied if not using semantic HTML elements.
## 2025-02-14 - CSS Grid Animations and Accessibility
**Learning:** When using CSS `grid-template-rows: 0fr` to hide collapsible content with animation, the elements remain in the DOM, allowing screen readers to access them and keyboard users to tab into invisible content. This creates a confusing and inaccessible experience.
**Action:** Use `visibility: hidden` combined with the CSS `transition` property on `visibility`. This elegantly delays the element becoming fully `hidden` until the transition completes, keeping it accessible only when visually expanded.

## 2025-04-11 - Form Validation Accessibility
**Learning:** In interactive forms with dynamic validation, using generic error messages is not sufficient for screen reader users. The relationship between the input and its corresponding error message needs to be explicitly defined.
**Action:** When implementing forms with validation, use `aria-invalid` on the input element (unless it has `role="button"`), and `aria-describedby` pointing to the ID of the error message container. Ensure the error message container uses `role="alert"` so the error is proactively announced when it appears.
