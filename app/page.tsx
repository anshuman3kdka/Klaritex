import { InputPanel } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 sm:py-12">
      <header className="k-header mx-auto mb-8 w-full max-w-3xl rounded-xl px-4 py-8 text-center sm:py-10">
        <h1 className="font-display text-5xl tracking-tight text-[var(--text-gold)] sm:text-6xl">Klaritex</h1>
        <p className="font-ui mt-3 text-sm text-[var(--text-secondary)] sm:text-base">
          Language Exposed. Accountability Scored.
        </p>
      </header>

      <InputPanel />
    </main>
  );
}
