export function ResultsSkeleton() {
  return (
    <section className="mx-auto mt-6 w-full max-w-3xl space-y-4" aria-live="polite" aria-busy="true">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-7 w-28 animate-pulse rounded bg-slate-300" />
            </div>
          ))}
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <article key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-9/12 animate-pulse rounded bg-slate-100" />
          </div>
        </article>
      ))}
    </section>
  );
}
