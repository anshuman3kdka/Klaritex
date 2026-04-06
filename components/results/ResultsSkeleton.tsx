export function ResultsSkeleton() {
  return (
    <section className="mx-auto mt-6 w-full max-w-3xl space-y-4" aria-live="polite" aria-busy="true">
      <div className="k-module-card p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-[var(--border)]" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--border)]" />
              <div className="mt-3 h-7 w-28 animate-pulse rounded bg-[var(--gold-muted)]/60" />
            </div>
          ))}
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <article key={index} className="k-module-card p-5">
          <div className="h-5 w-56 animate-pulse rounded bg-[var(--border)]" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-[var(--border)]/80" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-[var(--border)]/80" />
            <div className="h-3 w-9/12 animate-pulse rounded bg-[var(--border)]/80" />
          </div>
        </article>
      ))}
    </section>
  );
}
