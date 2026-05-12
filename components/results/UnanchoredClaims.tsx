import { LabCard, LabLabel, LabWell } from "../lab";

interface UnanchoredClaimsProps {
  unanchoredClaimsCount?: number;
}

export function UnanchoredClaims({ unanchoredClaimsCount }: UnanchoredClaimsProps) {
  const count = typeof unanchoredClaimsCount === "number" ? Math.max(0, unanchoredClaimsCount) : null;

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 4 · Unanchored Claims</LabLabel>
      <div className="flex flex-col items-center">
        {count === null ? (
          <LabWell className="h-24 w-24 flex items-center justify-center rounded-full">
            <span className="font-mono text-xl text-[var(--lab-muted)]">—</span>
          </LabWell>
        ) : (
          <LabWell className="h-32 w-32 flex items-center justify-center rounded-full mb-4">
            <span className={`font-mono text-5xl font-semibold ${count === 0 ? "text-[var(--lab-green)]" : "text-[var(--lab-red)]"}`}>
              {count}
            </span>
          </LabWell>
        )}
        <p className="font-sans text-sm text-[var(--lab-ink)] font-semibold">
          {count === null ? "Data unavailable" : count === 0 ? "No unanchored claims found" : `Unanchored ${count === 1 ? "claim" : "claims"} detected`}
        </p>
      </div>
    </LabCard>
  );
}
