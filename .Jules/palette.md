## 2024-05-18 - Keyboard Accessibility (focus-visible)

**Learning:** Tailwind-styled `<button>` and interactive elements frequently omit clear focus indicators when standard styling suppresses default browser outlines or replaces borders. In `Klaritex` specifically, custom buttons with background and border changes on hover/active states lacked equivalent focus rings, rendering them inaccessible for keyboard navigation.
**Action:** Always add explicit focus rings using `focus:outline-none focus-visible:ring-2 focus-visible:ring-[color] focus-visible:ring-offset-2` to custom interactive components to ensure keyboard accessibility. Also, explicitly set `aria-pressed` on simulated tab/toggle interfaces for screen reader clarity.
