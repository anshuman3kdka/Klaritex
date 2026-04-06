"use client";

import { useState } from "react";

interface CommitmentSummaryProps {
  commitmentSummary?: string;
}

export function CommitmentSummary({ commitmentSummary }: CommitmentSummaryProps) {
  const [copied, setCopied] = useState(false);
  const hasSummary = typeof commitmentSummary === "string";
  const summaryText = commitmentSummary?.trim() ?? "";

  async function handleCopy() {
    if (!summaryText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Module 8 · Summary of Commitments</h3>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!summaryText}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {!hasSummary ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : summaryText ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">{summaryText}</p>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No extractable commitments found. The text contains no verifiable accountability statements.
        </p>
      )}
    </article>
  );
}
