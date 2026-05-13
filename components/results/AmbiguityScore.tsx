import type { AmbiguityTier } from "@/lib/types";
import { LabCard, LabDial, LabLabel } from "../lab";

interface AmbiguityScoreProps {
  ambiguityScore?: number;
  rawPenaltyScore?: number;
  tier?: AmbiguityTier;
  animationKey?: number;
  defaultExpanded?: boolean;
}

const tierColorMap: Record<AmbiguityTier, string> = {
  1: "text-[var(--lab-green)]",
  2: "text-[var(--lab-amber)]",
  3: "text-[var(--lab-red)]"
};

export function AmbiguityScore({
  ambiguityScore,
  rawPenaltyScore,
  tier,
}: AmbiguityScoreProps) {
  const hasScore = typeof ambiguityScore === "number";
  const hasRawPenalty = typeof rawPenaltyScore === "number";

  const displayScore = hasScore ? ambiguityScore.toFixed(1) : "—";
  const displayColor = tier ? tierColorMap[tier] : "text-[var(--lab-ink)]";

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 1 · Ambiguity Score</LabLabel>
      <div className="flex flex-col items-center">
        <LabDial value={displayScore} label="Ambiguity" colorClass={displayColor} />

        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--lab-muted)] mt-6">
          Raw Penalty: {hasRawPenalty ? `${rawPenaltyScore.toFixed(1)} / 12.0` : "—"}
        </p>
      </div>
    </LabCard>
  );
}
