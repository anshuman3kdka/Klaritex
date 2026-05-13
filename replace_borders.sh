#!/bin/bash
# Remove arbitrary borders to strictly comply with zero-border constraint
sed -i 's/border border-dashed border-\[var(--lab-shadow-dark)\]//g' components/results/ForensicInspector.tsx
sed -i 's/border-l-\[3px\] border-l-\[var(--lab-gold)\]/shadow-\[var(--shadow-pressed)\]/g' components/results/CommitmentBreakdown.tsx
sed -i 's/border-l-\[3px\] border-\[var(--lab-gold)\]/shadow-\[var(--shadow-pressed)\]/g' components/results/VagueLines.tsx
sed -i 's/border border-\[var(--lab-gold)\]\/30//g' components/results/CommitmentBreakdown.tsx
sed -i 's/border border-\[var(--lab-red)\]\/30//g' components/analyzer/PdfUpload.tsx
sed -i 's/border border-\[var(--lab-gold)\]\/30//g' components/analyzer/PdfUpload.tsx
sed -i 's/border border-\[var(--lab-green)\]\/20//g' components/analyzer/PdfUpload.tsx
