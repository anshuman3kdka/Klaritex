import { InputPanel } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface)]/70">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center gap-4 px-4 py-5 sm:px-6">
          <div>
            <a
              href="https://klaritex.anshuman3kdka.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Clarity Engine (opens in a new tab)"
              className="font-ui text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:text-base"
            >
              Clarity Engine
            </a>
          </div>
          <div>
            <a
              href="#"
              aria-label="About (coming soon)"
              className="font-ui text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:text-base"
            >
              About
            </a>
          </div>
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
        <div className="mx-auto flex w-full max-w-6xl items-center gap-8 px-4 py-10 sm:px-6">
          <a
            href="mailto:thisisanshumanp@gmail.com"
            aria-label="Contact via email (opens your email client)"
            className="font-ui text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:text-base"
          >
            Contact
          </a>
          <a
            href="https://github.com/anshuman3kdka/Klaritex"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in a new tab)"
            className="font-ui text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:text-base"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
