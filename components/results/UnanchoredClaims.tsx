import { CollapsibleCard } from "./CollapsibleCard";

interface UnanchoredClaimsProps {
  unanchoredClaimsCount?: number;
}

export function UnanchoredClaims({ unanchoredClaimsCount }: UnanchoredClaimsProps) {
  const count = typeof unanchoredClaimsCount === "number" ? Math.max(0, unanchoredClaimsCount) : null;

  return (
    <CollapsibleCard title="Module 4 · Unanchored Claims" moduleId="module-4">
      {count === null ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : count === 0 ? (
        <p className="font-ui rounded-lg border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-4 text-sm font-medium text-[var(--clear-color)]">
          No unanchored claims found.
        </p>
      ) : (
        <p className="font-ui rounded-lg border border-[var(--missing-color)]/40 bg-[var(--missing-color)]/14 p-4 text-sm font-semibold text-[var(--missing-color)]">
          {count} unanchored {count === 1 ? "claim" : "claims"} detected
        </p>
      )}
    </CollapsibleCard>
  );
}
