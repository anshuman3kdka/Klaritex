## 2024-05-18 - Improve Keyboard Navigation for Custom Inputs
**Learning:** Custom interactive elements like custom tablists (`role="tab"`) and radio groups (`role="radiogroup"`) built with generic `<button>` elements must implement roving tabindex (`tabIndex={isActive ? 0 : -1}`) and Arrow key navigation to prevent all elements from cluttering the sequential tab order and to match WAI-ARIA expectations.
**Action:** Always implement roving tabindex alongside Arrow key navigation on custom composite widgets to align with WAI-ARIA and ensure screen reader / keyboard friendliness.
