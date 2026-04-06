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
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 5 · Identify Vague Lines</h3>

      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          Identify Vague Lines
        </button>
      ) : !hasData ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : lines.length === 0 ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          No vague lines detected.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <li key={`${line.sentence}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <blockquote className="border-l-2 border-slate-300 pl-3 text-sm italic text-slate-800">“{line.sentence}”</blockquote>
              <p className="mt-2 text-sm text-slate-600">{line.reason || "Missing structural detail."}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
