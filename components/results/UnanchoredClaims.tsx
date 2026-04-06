interface UnanchoredClaimsProps {
  unanchoredClaimsCount?: number;
}

export function UnanchoredClaims({ unanchoredClaimsCount }: UnanchoredClaimsProps) {
  const count = typeof unanchoredClaimsCount === "number" ? Math.max(0, unanchoredClaimsCount) : null;

  return (
    <article className="k-module-card p-5">
      <h3 className="k-module-label">Module 4 · Unanchored Claims</h3>

      {count === null ? (
        <p className="font-ui mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : count === 0 ? (
        <p className="font-ui mt-4 rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No unanchored claims found.
        </p>
      ) : (
        <p className="font-ui mt-4 rounded-lg border border-[var(--missing-color)]/40 bg-[var(--missing-color)]/14 p-4 text-sm font-semibold text-[var(--missing-color)]">
          {count} unanchored {count === 1 ? "claim" : "claims"} detected
        </p>
      )}
    </article>
  );
}
