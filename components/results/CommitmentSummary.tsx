"use client";

import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";

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
    <CollapsibleCard
      title="Module 8 · Summary of Commitments"
      moduleId="module-8"
      headerAction={
        <button
          type="button"
          onClick={handleCopy}
          disabled={!summaryText}
          className="font-ui rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-accent)] hover:text-[var(--text-gold)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      }
    >
      {!hasSummary ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : summaryText ? (
        <p className="font-ui rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-primary)]">{summaryText}</p>
      ) : (
        <p className="font-ui rounded-lg border border-[var(--broad-color)]/45 bg-[var(--broad-color)]/14 p-4 text-sm text-[var(--broad-color)]">
          No extractable commitments found. The text contains no verifiable accountability statements.
        </p>
      )}
    </CollapsibleCard>
  );
}
