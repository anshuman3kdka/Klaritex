#!/bin/bash
sed -i 's/doc.setFont("helvetica", "bold")/doc.setFont("times", "bold")/g' lib/report/generateAnalysisPdf.ts
sed -i 's/doc.setFont("helvetica", "normal")/doc.setFont("helvetica", "normal")/g' lib/report/generateAnalysisPdf.ts
sed -i 's/doc.setFont("helvetica", "italic")/doc.setFont("times", "italic")/g' lib/report/generateAnalysisPdf.ts
sed -i 's/doc.setFont("courier", "normal")/doc.setFont("courier", "normal")/g' lib/report/generateAnalysisPdf.ts
