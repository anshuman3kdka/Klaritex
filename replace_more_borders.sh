#!/bin/bash
sed -i 's/border border-white\/20/shadow-\[var(--shadow-pressed)\]/g' components/results/ResultsPanel.tsx
sed -i 's/hover:border-white\/40 //g' components/results/ResultsPanel.tsx
sed -i 's/border-t //g' components/results/ModuleAccordion.tsx
sed -i 's/k-border-color //g' components/results/ModuleAccordion.tsx
