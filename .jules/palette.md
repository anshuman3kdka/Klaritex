## 2025-02-14 - Custom UI Primitive Focus States
**Learning:** Custom interactive UI primitives in this design system (like divs acting as buttons or dropzones) do not inherently show focus states against the dark theme, making them inaccessible to keyboard users without explicit styles. Additionally, ARIA roles are sometimes missing when using generic HTML tags for these primitives.
**Action:** When building or modifying custom interactive components (tabs, radios, custom file uploads), always verify keyboard navigation and add `focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none` explicitly to ensure visibility. Also ensure proper ARIA semantic roles (e.g., `tablist`/`tab`, `radiogroup`/`radio`) are applied if not using semantic HTML elements.
## 2025-02-14 - CSS Grid Animations and Accessibility
**Learning:** When using CSS `grid-template-rows: 0fr` to hide collapsible content with animation, the elements remain in the DOM, allowing screen readers to access them and keyboard users to tab into invisible content. This creates a confusing and inaccessible experience.
**Action:** Use `visibility: hidden` combined with the CSS `transition` property on `visibility`. This elegantly delays the element becoming fully `hidden` until the transition completes, keeping it accessible only when visually expanded.
## 2025-02-14 - Copyright link Focus States
**Learning:** The copyright text in the footer lacked an accessible link, making it non-interactive and lacking proper focus states for keyboard users.
**Action:** Wrapped the copyright name in an `<a>` tag with proper `href`, `target="_blank"`, `rel="noopener noreferrer"`, and explicit focus styles (`focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 focus-visible:outline-none`) to maintain keyboard accessibility within the dark theme.
## 2025-02-14 - Roving TabIndex in Radio Groups
**Learning:** Custom UI radio group primitives lacking roving `tabIndex` functionality are inaccessible for keyboard users, as only the active item should be focusable via `Tab`, and other items navigate via arrow keys.
**Action:** When building generic components with `role="radiogroup"`, always implement a roving `tabIndex` (`0` for the active item, `-1` for inactive ones) and ensure explicit arrow key navigation handler on the parent container (using `onKeyDown`).
