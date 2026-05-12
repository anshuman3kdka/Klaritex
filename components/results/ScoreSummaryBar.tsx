import type { AmbiguityTier } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";
import { LabWell } from "../lab";

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
    <CollapsibleCard title="Score Summary" className={tier === 3 ? "shadow-[var(--shadow-gold-glow)]" : ""}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <LabWell className="p-4 flex flex-col justify-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--lab-muted)]">Ambiguity Score</p>
          <p className="font-serif mt-2 text-4xl font-semibold leading-none text-[var(--lab-ink)] sm:text-5xl">
            {hasScore ? ambiguityScore.toFixed(1) : "—"}
          </p>
        </LabWell>

        <LabWell className="p-4 flex flex-col justify-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--lab-muted)]">Tier</p>
          {hasTier ? (
            <span className={`mt-3 font-mono text-xs uppercase tracking-wide px-3 py-1.5 rounded-full self-start shadow-[var(--shadow-extruded)] ${tier === 3 ? "bg-[var(--lab-red)]/10 text-[var(--lab-red)]" : tier === 2 ? "bg-[var(--lab-amber)]/10 text-[var(--lab-amber)]" : "bg-[var(--lab-green)]/10 text-[var(--lab-green)]"}`}>
              {tierLabel[tier]}
            </span>
          ) : (
            <p className="font-sans mt-3 text-sm text-[var(--lab-muted)]">—</p>
          )}
        </LabWell>

        <LabWell className="p-4 flex flex-col justify-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--lab-muted)]">Override Notice</p>
          {tierOverride ? (
            <p className="font-mono text-xs mt-3 bg-[var(--lab-red)]/10 text-[var(--lab-red)] p-2 rounded-[8px] shadow-[var(--shadow-pressed)]">
              {overrideRule ? overrideRuleLabel[overrideRule] : "Override applied"}
            </p>
          ) : (
            <p className="font-sans text-sm mt-3 text-[var(--lab-muted)]">No override applied</p>
          )}
        </LabWell>
      </div>
    </CollapsibleCard>
  );
}
