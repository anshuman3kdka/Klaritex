interface AmbiguityExplanationProps {
  ambiguityExplanation?: string[];
}

export function AmbiguityExplanation({ ambiguityExplanation }: AmbiguityExplanationProps) {
  const explanations = ambiguityExplanation ?? null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 9 · Structural Ambiguity Explanation</h3>

      {!explanations ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : explanations.length === 0 ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          No structural ambiguity markers were returned.
        </p>
      ) : (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-800">
          {explanations.slice(0, 4).map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
