import { InputPanel } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface)]/70">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center gap-4 px-4 py-5 sm:px-6">
          <div className="h-8 rounded-md border border-dashed border-[var(--border)]/70" aria-hidden="true" />
          <div className="h-8 rounded-md border border-dashed border-[var(--border)]/70" aria-hidden="true" />
          <div className="text-right">
            <span className="font-display text-2xl tracking-tight text-[var(--text-gold)] sm:text-3xl">Klaritex</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <section className="k-header mx-auto mb-8 w-full max-w-3xl rounded-xl px-4 py-8 text-center sm:py-10">
          <p className="font-ui text-sm text-[var(--text-secondary)] sm:text-base">
            Language Exposed. Accountability Scored.
          </p>
        </section>

        <InputPanel />
      </main>

      <footer className="mt-12 border-t border-[var(--border)] bg-[var(--bg-surface)]/50">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-2">
          <div className="min-h-16 rounded-md border border-dashed border-[var(--border)]/70 p-4 text-sm text-[var(--text-secondary)]">
            Footer space for additional sections
          </div>
          <div className="flex items-end justify-start md:justify-end">
            <p className="font-ui text-sm text-[var(--text-secondary)]">
              © 2026 Anshuman3kdka · Built between lectures
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
