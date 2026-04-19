"use client";

import { useState } from "react";

import { InputPanel } from "@/components/analyzer/InputPanel";
import { SpaceVoidBackground } from "@/components/background/SpaceVoidBackground";
import { CoolShowcase } from "@/components/home/CoolShowcase";
import type { InputPanelIntent } from "@/components/analyzer/InputPanel";

export default function HomePage() {
  const [intent, setIntent] = useState<InputPanelIntent | null>(null);

  return (
    <div className="relative h-[100dvh] flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      <SpaceVoidBackground />

      <header className="k-entrance-fade-down k-glass-surface relative z-10 shrink-0 border-b backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center gap-4 px-4 py-5 sm:px-6">
          <div>
            <a
              href="https://klaritex.anshuman3kdka.in"
              aria-label="Clarity Engine"
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
            <span className="font-display text-2xl tracking-tight text-[var(--text-gold)] sm:text-3xl">Klaritex&trade;</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <section className="k-header k-entrance-fade-down mx-auto mb-8 w-full max-w-3xl rounded-xl px-4 py-8 text-center sm:py-10">
          <p className="font-ui text-base leading-relaxed text-[var(--text-primary)]/80 sm:text-lg">
            Language Exposed. Accountability Scored.
          </p>
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-[var(--gold-muted)] to-transparent sm:mt-4"
          />
        </section>

        <CoolShowcase
          onIntent={(nextIntent) => {
            setIntent({
              id: Date.now(),
              ...nextIntent,
            });
          }}
        />

        <InputPanel intent={intent} />
      </main>

      <footer className="k-glass-surface relative z-10 shrink-0 border-t backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-8">
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
          <p className="font-ui text-xs text-[var(--text-secondary)] sm:text-sm">
            &copy;
            <a
              href="https://anshuman3kdka.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Anshuman3kdka (opens in a new tab)"
              className="transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 rounded-sm"
            >
              Anshuman3kdka
            </a>{" "}
            &middot; Built between lectures
          </p>
        </div>
      </footer>
    </div>
  );
}
