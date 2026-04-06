"use client";

import type { VagueLine } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

interface VagueLinesProps {
  vagueLines?: VagueLine[];
}

export function VagueLines({ vagueLines }: VagueLinesProps) {
  const lines = vagueLines ?? [];
  const hasData = Array.isArray(vagueLines);

  return (
    <CollapsibleCard title="Module 5 · Identify Vague Lines">
      {!hasData ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : lines.length === 0 ? (
        <p className="font-ui rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No vague lines detected.
        </p>
      ) : (
        <ul className="space-y-3">
          {lines.map((line, index) => (
            <li key={`${line.sentence}-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <blockquote className="font-ui border-l-2 border-[var(--gold-muted)] pl-3 text-sm italic text-[var(--text-primary)]">“{line.sentence}”</blockquote>
              <p className="font-ui mt-2 text-sm text-[var(--text-secondary)]">{line.reason || "Missing structural detail."}</p>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleCard>
  );
}
