import type { AmbiguityTier } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

interface ScoreSummaryBarProps {
  ambiguityScore?: number;
  tier?: AmbiguityTier;
  tierOverride?: boolean;
  overrideRule?: "tier-floor" | "critical-pair" | null;
}

const tierStyles: Record<AmbiguityTier, string> = {
  1: "k-tier-badge--1",
  2: "k-tier-badge--2",
  3: "k-tier-badge--3"
};

const tierLabel: Record<AmbiguityTier, string> = {
  1: "Tier 1 · Low Ambiguity",
  2: "Tier 2 · Medium Ambiguity",
  3: "Tier 3 · High Ambiguity"
};

const overrideRuleLabel: Record<"tier-floor" | "critical-pair", string> = {
  "tier-floor": "Override: 3+ elements missing — forced Tier 3",
  "critical-pair": "Override: Both Agent and Action are symbolic — AS fixed at 10.0"
};

export function ScoreSummaryBar({ ambiguityScore, tier, tierOverride = false, overrideRule }: ScoreSummaryBarProps) {
  const hasScore = typeof ambiguityScore === "number";
  const hasTier = typeof tier === "number";

  return (
    <CollapsibleCard title="Score Summary" className={tier === 3 ? "border-[var(--tier3-color)]/55" : ""}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <p className="k-module-label">Ambiguity Score</p>
          <p className="font-mono-ui mt-1 text-4xl leading-none text-[var(--text-gold)] sm:text-5xl">
            {hasScore ? ambiguityScore.toFixed(1) : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <p className="k-module-label">Tier Badge</p>
          {hasTier ? (
            <span className={`k-tier-badge k-tier-badge--summary mt-2 ${tierStyles[tier]}`}>
              {tierLabel[tier]}
            </span>
          ) : (
            <p className="font-ui mt-2 text-sm text-[var(--text-secondary)]">—</p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <p className="k-module-label">Override Notice</p>
          {tierOverride ? (
            <p className="font-ui mt-2 rounded-md border border-[var(--tier3-color)]/55 bg-[var(--tier3-color)]/12 p-2 text-sm font-medium text-[var(--tier3-color)]">
              {overrideRule ? overrideRuleLabel[overrideRule] : "Override applied"}
            </p>
          ) : (
            <p className="font-ui mt-2 text-sm text-[var(--text-secondary)]">No override applied</p>
          )}
        </div>
      </div>
    </CollapsibleCard>
  );
}
