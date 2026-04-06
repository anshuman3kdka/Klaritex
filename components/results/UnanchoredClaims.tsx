interface UnanchoredClaimsProps {
  unanchoredClaimsCount?: number;
}

export function UnanchoredClaims({ unanchoredClaimsCount }: UnanchoredClaimsProps) {
  const count = typeof unanchoredClaimsCount === "number" ? Math.max(0, unanchoredClaimsCount) : null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Module 4 · Unanchored Claims</h3>

      {count === null ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">—</p>
      ) : count === 0 ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          No unanchored claims found.
        </p>
      ) : (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {count} unanchored {count === 1 ? "claim" : "claims"} detected
        </p>
      )}
    </article>
  );
}
