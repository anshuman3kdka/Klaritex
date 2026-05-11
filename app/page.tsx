"use client";

import { useState } from "react";

import { InputPanel } from "@/components/analyzer/InputPanel";
import { CoolShowcase } from "@/components/home/CoolShowcase";
import type { InputPanelIntent } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  const [intent, setIntent] = useState<InputPanelIntent | null>(null);

  return (
    <div className="relative h-[100dvh] flex flex-col overflow-hidden bg-[var(--lab-surface)]">
      {/* Phase 3: Background removed for Laboratory White constraint */}

      <header className="k-entrance-fade-down relative z-10 shrink-0 border-b border-[var(--lab-shadow-dark)]/20 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center gap-4 px-4 py-5 sm:px-6">
          <nav aria-label="Primary navigation">
            <a
              href="https://klaritex.anshuman3kdka.in"
              aria-label="Clarity Engine"
              className="font-sans text-sm text-[var(--lab-muted)] transition-colors hover:text-[var(--lab-ink)] sm:text-base"
            >
              Clarity Engine
            </a>
          </nav>
          <div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="About page is coming soon"
              className="font-sans cursor-not-allowed text-sm text-[var(--lab-muted)]/75 sm:text-base"
            >
              About
            </button>
          </div>
          <div className="text-right">
            <span className="font-serif text-2xl tracking-tight text-[var(--lab-gold)] sm:text-3xl font-semibold">Klaritex&trade;</span>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative z-10 flex-1 overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <section className="k-entrance-fade-down mx-auto mb-8 w-full max-w-3xl rounded-xl px-4 py-8 text-center sm:py-10">
          <p className="font-serif text-base leading-relaxed text-[var(--lab-ink)] sm:text-lg">
            Language Exposed. Accountability Scored.
          </p>
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-[var(--lab-gold)] to-transparent sm:mt-4"
          />
        </section>

        <CoolShowcase
          ctaTargetId="analyzer"
          onIntent={(nextIntent) => {
            setIntent({
              id: Date.now(),
              ...nextIntent,
            });
          }}
        />

        <InputPanel id="analyzer" intent={intent} />
      </main>

      <footer className="relative z-10 shrink-0 border-t border-[var(--lab-shadow-dark)]/20 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-8">
            <a
              href="mailto:thisisanshumanp@gmail.com"
              aria-label="Contact via email (opens your email client)"
              className="font-sans text-sm text-[var(--lab-muted)] transition-colors hover:text-[var(--lab-ink)] sm:text-base"
            >
              Contact
            </a>
            <a
              href="https://github.com/anshuman3kdka/Klaritex"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className="font-sans text-sm text-[var(--lab-muted)] transition-colors hover:text-[var(--lab-ink)] sm:text-base"
            >
              GitHub
            </a>
          </div>
          <p className="font-sans text-xs text-[var(--lab-muted)] sm:text-sm">
            &copy;
            <a
              href="https://anshuman3kdka.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Anshuman3kdka (opens in a new tab)"
              className="transition-colors hover:text-[var(--lab-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 rounded-sm ml-1 mr-1"
            >
              Anshuman3kdka
            </a>
            &middot; Built between lectures
          </p>
        </div>
      </footer>
    </div>
  );
}
