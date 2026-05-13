"use client";

import { useState } from "react";
import { LabCard, LabLabel, LabButton, LabWell } from "../lab";

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
    <LabCard className="p-6">
      <div className="flex justify-between items-start mb-6">
        <LabLabel className="block">Module 8 · Summary of Commitments</LabLabel>
        <LabButton
          onClick={handleCopy}
          disabled={!summaryText}
          className="text-xs py-1 px-3"
        >
          {copied ? "Copied" : "Copy"}
        </LabButton>
      </div>

      {!hasSummary ? (
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      ) : summaryText ? (
        <p className="font-sans text-[var(--lab-ink)] leading-relaxed">{summaryText}</p>
      ) : (
        <LabWell className="p-4 text-sm font-semibold text-[var(--lab-amber)]">
          No extractable commitments found. The text contains no verifiable accountability statements.
        </LabWell>
      )}
    </LabCard>
  );
}
