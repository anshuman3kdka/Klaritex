import type { AmbiguityTier } from "@/lib/types";

interface ScoreSummaryBarProps {
  ambiguityScore: number;
  tier: AmbiguityTier;
  tierOverride: boolean;
  overrideRule?: "tier-floor" | "critical-pair" | null;
}

const tierStyles: Record<AmbiguityTier, string> = {
  1: "bg-emerald-100 text-emerald-800 border-emerald-200",
  2: "bg-amber-100 text-amber-800 border-amber-200",
  3: "bg-rose-100 text-rose-800 border-rose-200"
};

const overrideRuleLabel: Record<"tier-floor" | "critical-pair", string> = {
  "tier-floor": "Tier floor rule applied",
  "critical-pair": "Critical pair rule applied"
};

export function ScoreSummaryBar({
  ambiguityScore,
  tier,
  tierOverride,
  overrideRule
}: ScoreSummaryBarProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Score Summary</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ambiguity Score</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{ambiguityScore.toFixed(1)} / 10</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tier Badge</p>
          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tierStyles[tier]}`}
          >
            Tier {tier}
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Override Notice</p>
          {tierOverride ? (
            <p className="mt-2 text-sm font-medium text-amber-700">
              {overrideRule ? overrideRuleLabel[overrideRule] : "Tier override was applied"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No override applied</p>
          )}
        </div>
      </div>
    </section>
  );
}
