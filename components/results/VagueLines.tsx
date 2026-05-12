"use client";

import type { VagueLine } from "@/lib/types";
import { LabCard, LabLabel, LabWell } from "../lab";

interface VagueLinesProps {
  vagueLines?: VagueLine[];
}

export function VagueLines({ vagueLines }: VagueLinesProps) {
  const lines = vagueLines ?? [];
  const hasData = Array.isArray(vagueLines);

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 5 · Vague Lines</LabLabel>
      {!hasData ? (
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      ) : lines.length === 0 ? (
        <p className="font-sans text-sm font-semibold text-[var(--lab-green)]">No vague lines detected.</p>
      ) : (
        <ul className="space-y-4">
          {lines.map((line, index) => (
            <li key={`${line.sentence}-${index}`}>
              <LabWell className="p-4 flex flex-col gap-3">
                <blockquote className="font-sans text-[var(--lab-ink)] italic opacity-90 shadow-[var(--shadow-pressed)] pl-3">“{line.sentence}”</blockquote>
                <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--lab-red)]">{line.reason || "Missing structural detail."}</p>
              </LabWell>
            </li>
          ))}
        </ul>
      )}
    </LabCard>
  );
}
