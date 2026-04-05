interface ClarityLevelProps {
  clarityLevel: number;
}

const clarityLabels: Record<number, string> = {
  1: "Very Clear",
  2: "Mostly Clear",
  3: "Mixed Clarity",
  4: "Mostly Vague",
  5: "Very Vague"
};

export function ClarityLevel({ clarityLevel }: ClarityLevelProps) {
  const boundedLevel = Math.min(5, Math.max(1, Math.round(clarityLevel)));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 2 · ClarityLevel</h3>
      <p className="mt-2 text-sm text-slate-600">
        This module summarizes how clear the statement is on a 1 to 5 scale.
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Clarity Level</p>
        <p className="mt-1 text-xl font-bold text-slate-900">
          Level {boundedLevel} · {clarityLabels[boundedLevel]}
        </p>
      </div>
    </article>
  );
}
