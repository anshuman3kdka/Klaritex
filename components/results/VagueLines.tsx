"use client";

import { useState } from "react";

import type { VagueLine } from "@/lib/types";

interface VagueLinesProps {
  vagueLines?: VagueLine[];
}

export function VagueLines({ vagueLines }: VagueLinesProps) {
  const lines = vagueLines ?? [];
  const hasData = Array.isArray(vagueLines);
  const [isExpanded, setIsExpanded] = useState(lines.length > 0);

  return (
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 5 · Identify Vague Lines</h3>

      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="font-ui mt-4 rounded-lg border border-[var(--gold-muted)] bg-[var(--gold-primary)]/12 px-4 py-2 text-sm font-medium text-[var(--text-gold)] transition hover:bg-[var(--gold-primary)]/20"
        >
          Identify Vague Lines
        </button>
      ) : !hasData ? (
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : lines.length === 0 ? (
        <p className="font-ui mt-4 rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No vague lines detected.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <li key={`${line.sentence}-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <blockquote className="font-ui border-l-2 border-[var(--gold-muted)] pl-3 text-sm italic text-[var(--text-primary)]">“{line.sentence}”</blockquote>
              <p className="font-ui mt-2 text-sm text-[var(--text-secondary)]">{line.reason || "Missing structural detail."}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
