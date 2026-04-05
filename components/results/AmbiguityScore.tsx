interface AmbiguityScoreProps {
  ambiguityScore: number;
  rawPenaltyScore: number;
}

export function AmbiguityScore({ ambiguityScore, rawPenaltyScore }: AmbiguityScoreProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 1 · AmbiguityScore</h3>
      <p className="mt-2 text-sm text-slate-600">
        This module shows the final ambiguity rating and the raw penalty value used before final scaling.
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Final Score</dt>
          <dd className="mt-1 text-xl font-bold text-slate-900">{ambiguityScore.toFixed(1)} / 10</dd>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Raw Penalty</dt>
          <dd className="mt-1 text-xl font-bold text-slate-900">{rawPenaltyScore.toFixed(2)}</dd>
        </div>
      </dl>
    </article>
  );
}
