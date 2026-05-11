#!/bin/bash
cat << 'CSS' > app/globals.css
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Inter:wght@400;500&family=Playfair+Display:wght@400;600&display=swap");
@import "tailwindcss";

@theme inline {
  --color-lab-surface: #EBEFF5;
  --color-lab-shadow-dark: #D1D9E6;
  --color-lab-shadow-light: #FFFFFF;
  --color-lab-ink: #1A1F22;
  --color-lab-muted: #7A8B99;
  --color-lab-gold: #C9A84C;
  --color-lab-green: #2d7a4f;
  --color-lab-amber: #b8860b;
  --color-lab-red: #9b2c2c;

  --shadow-extruded: 6px 6px 12px var(--color-lab-shadow-dark), -6px -6px 12px var(--color-lab-shadow-light);
  --shadow-pressed: inset 4px 4px 8px var(--color-lab-shadow-dark), inset -4px -4px 8px var(--color-lab-shadow-light);
  --shadow-extruded-hover: 8px 8px 16px var(--color-lab-shadow-dark), -8px -8px 16px var(--color-lab-shadow-light);
  --shadow-gold-glow: 0 0 14px rgba(201, 168, 76, 0.4);
}

:root {
  --lab-surface: #EBEFF5;
  --lab-shadow-dark: #D1D9E6;
  --lab-shadow-light: #FFFFFF;
  --lab-ink: #1A1F22;
  --lab-muted: #7A8B99;
  --lab-gold: #C9A84C;

  --tier1-color: #2d7a4f;
  --tier2-color: #b8860b;
  --tier3-color: #9b2c2c;
  --clear-color: #2d7a4f;
  --broad-color: #b8860b;
  --missing-color: #9b2c2c;

  --radius-primary: 16px;
  --radius-secondary: 8px;
  --radius-dial: 50%;
}

body {
  background: var(--lab-surface);
  color: var(--lab-ink);
  font-family: var(--font-sans), "Inter", sans-serif;
  min-height: 100vh;
}

/* Base interactive styles */
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
[role="button"]:focus-visible,
[role="tab"]:focus-visible {
  outline: 2px solid var(--lab-gold);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  z-index: 80;
  transform: translateY(-140%);
  border-radius: var(--radius-secondary);
  border: none;
  background: var(--lab-surface);
  box-shadow: var(--shadow-extruded);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--lab-ink);
  transition: transform 150ms ease;
}

.skip-link:focus-visible {
  transform: translateY(0);
}

@layer utilities {
  .lab-label {
    font-family: var(--font-mono), "DM Mono", monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--lab-muted);
  }
}
CSS
