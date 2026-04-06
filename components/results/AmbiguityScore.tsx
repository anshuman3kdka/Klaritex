import type { AmbiguityTier } from "@/lib/types";

interface AmbiguityScoreProps {
  ambiguityScore?: number;
  rawPenaltyScore?: number;
  tier?: AmbiguityTier;
}

function getScoreColor(score: number): string {
  if (score <= 2.5) return "bg-emerald-500";
  if (score <= 6.0) return "bg-amber-500";
  return "bg-rose-500";
}

export function AmbiguityScore({ ambiguityScore, rawPenaltyScore, tier }: AmbiguityScoreProps) {
  const hasScore = typeof ambiguityScore === "number";
  const hasRawPenalty = typeof rawPenaltyScore === "number";
  const normalizedScore = hasScore ? Math.min(10, Math.max(0, ambiguityScore)) : 0;
  const progressWidth = `${(normalizedScore / 10) * 100}%`;
  const barColor = getScoreColor(normalizedScore);
  const tierText = tier ? `Tier ${tier}` : "—";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 1 · Ambiguity Score</h3>

      {!hasScore ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : (
        <>
          <p className="mt-4 text-3xl font-bold text-slate-900">{normalizedScore.toFixed(1)} / 10</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full ${barColor}`} style={{ width: progressWidth }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Raw Penalty Score: {hasRawPenalty ? `${rawPenaltyScore.toFixed(1)} / 12.0` : "—"}
          </p>
          <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {tierText}
          </p>
        </>
      )}
    </article>
  );
}
