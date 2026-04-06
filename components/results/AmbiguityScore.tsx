import type { AmbiguityTier } from "@/lib/types";
import { CollapsibleCard } from "./CollapsibleCard";

interface AmbiguityScoreProps {
  ambiguityScore?: number;
  rawPenaltyScore?: number;
  tier?: AmbiguityTier;
}

export function AmbiguityScore({ ambiguityScore, rawPenaltyScore, tier }: AmbiguityScoreProps) {
  const hasScore = typeof ambiguityScore === "number";
  const hasRawPenalty = typeof rawPenaltyScore === "number";
  const normalizedScore = hasScore ? Math.min(10, Math.max(0, ambiguityScore)) : 0;
  const scorePercent = (normalizedScore / 10) * 100;
  const tierText = tier ? `Tier ${tier}` : "—";

  return (
    <CollapsibleCard title="Module 1 · Ambiguity Score">
      {!hasScore ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : (
        <>
          <p className="font-mono-ui text-5xl text-[var(--text-gold)] sm:text-6xl">{normalizedScore.toFixed(1)}</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--bg-primary)]">
            <div className="flex h-full w-full">
              <div className="h-full bg-[var(--gold-primary)]" style={{ width: `${scorePercent}%` }} />
              <div className="h-full bg-[var(--tier3-color)]/90" style={{ width: `${100 - scorePercent}%` }} />
            </div>
          </div>
          <p className="font-mono-ui mt-3 text-xs text-[var(--text-secondary)]">
            Raw Penalty Score: {hasRawPenalty ? `${rawPenaltyScore.toFixed(1)} / 12.0` : "—"}
          </p>
          <p className="k-badge mt-2 border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            {tierText}
          </p>
        </>
      )}
    </CollapsibleCard>
  );
}
