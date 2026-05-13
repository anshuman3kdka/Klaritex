import { LabCard, LabWell } from "../lab";

export function ResultsSkeleton() {
  return (
    <section className="mx-auto mt-6 w-full max-w-3xl space-y-6" aria-live="polite" aria-busy="true">
      <LabCard className="p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-[var(--lab-shadow-dark)]" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LabWell key={index} className="p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--lab-shadow-dark)]" />
              <div className="mt-4 h-7 w-28 animate-pulse rounded bg-[var(--lab-gold)]/40" />
            </LabWell>
          ))}
        </div>
      </LabCard>

      {Array.from({ length: 5 }).map((_, index) => (
        <LabCard key={index} className="p-6">
          <div className="h-5 w-56 animate-pulse rounded bg-[var(--lab-shadow-dark)]" />
          <div className="mt-6 space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-[var(--lab-shadow-dark)]/50" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-[var(--lab-shadow-dark)]/50" />
            <div className="h-3 w-9/12 animate-pulse rounded bg-[var(--lab-shadow-dark)]/50" />
          </div>
        </LabCard>
      ))}
    </section>
  );
}
