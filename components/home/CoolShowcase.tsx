"use client";

import { useMemo, useState } from "react";

import type { AnalysisMode, InputMode } from "@/lib/types";

type ShowcaseIntent = {
  inputMode?: InputMode;
  processingMode?: AnalysisMode;
  text?: string;
  focusTextInput?: boolean;
};

type CoolShowcaseProps = {
  onIntent?: (intent: ShowcaseIntent) => void;
  ctaTargetId?: string;
};

const MOODS = [
  {
    key: "focus",
    label: "Focus Mode",
    subtitle: "For policy teams and legal reviews",
    accent: "from-emerald-300/30 via-emerald-400/10 to-transparent",
    score: "91%",
    note: "Clear commitments detected",
  },
  {
    key: "debate",
    label: "Debate Mode",
    subtitle: "For campaign claims and public statements",
    accent: "from-amber-300/35 via-amber-400/10 to-transparent",
    score: "63%",
    note: "Mixed commitment signals",
  },
  {
    key: "redflag",
    label: "Red Flag Mode",
    subtitle: "For marketing hype and vague promises",
    accent: "from-rose-300/35 via-rose-400/10 to-transparent",
    score: "28%",
    note: "High ambiguity risk",
  },
] as const;

const IDEA_CHIPS = [
  "Paste a political speech",
  "Drop in a pricing page",
  "Analyze a shareholder letter",
  "Test a manifesto draft",
  "Check a job description",
  "Inspect a grant proposal",
];

export function CoolShowcase({ onIntent, ctaTargetId = "analyzer" }: CoolShowcaseProps) {
  const [activeMood, setActiveMood] = useState<(typeof MOODS)[number]["key"]>("focus");

  const mood = useMemo(() => MOODS.find((entry) => entry.key === activeMood) ?? MOODS[0], [activeMood]);

  const handleMoodClick = (key: (typeof MOODS)[number]["key"]) => {
    setActiveMood(key);

    if (!onIntent) {
      return;
    }

    if (key === "focus") {
      onIntent({
        inputMode: "text",
        processingMode: "quick",
        text: "Our team will publish weekly progress updates every Friday with named owners for each milestone.",
        focusTextInput: true,
      });
      return;
    }

    if (key === "debate") {
      onIntent({
        inputMode: "text",
        processingMode: "deep",
        text: "We may consider reducing fees sometime soon if market conditions permit and stakeholders align.",
        focusTextInput: true,
      });
      return;
    }

    onIntent({
      inputMode: "url",
      processingMode: "deep",
    });
  };

  const handlePrimaryCtaClick = () => {
    onIntent?.({
      inputMode: "text",
      focusTextInput: true,
    });

    const target = document.getElementById(ctaTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="k-entrance-fade-down mx-auto mb-10 w-full max-w-5xl">
      <div className="k-card overflow-hidden border px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="min-w-0">
            <p className="font-mono-ui text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Preview Modes</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--text-primary)] sm:text-3xl">
              Demo preview of Klaritex scoring modes.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              This card shows sample results only. Use the Analyze section below to run real analysis on your text.
            </p>
            <button
              type="button"
              onClick={handlePrimaryCtaClick}
              className="mt-4 inline-flex items-center rounded-lg bg-[var(--gold-primary)] px-4 py-2 font-ui text-sm font-semibold text-[#1a1a1a] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50"
            >
              Try with my text
            </button>

            <div className="mt-5 flex flex-wrap gap-2">
              {MOODS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => handleMoodClick(entry.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                    activeMood === entry.key
                      ? "border-[var(--gold-primary)] bg-[var(--gold-primary)]/15 text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--bg-elevated)]/55 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 sm:hidden" aria-label="Example things to analyze">
              {IDEA_CHIPS.map((chip) => (
                <span key={chip} className="cool-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="cool-marquee mt-5 hidden sm:block" aria-label="Example things to analyze">
              <div className="cool-marquee-track">
                {[...IDEA_CHIPS, ...IDEA_CHIPS].map((chip, index) => (
                  <span key={`${chip}-${index}`} className="cool-chip">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-4">
            <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br ${mood.accent}`} />
            <div className="relative">
              <p className="font-mono-ui text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{mood.label}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{mood.subtitle}</p>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="font-mono-ui text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">Confidence</p>
                  <p className="mt-1 font-display text-4xl text-[var(--text-primary)]">{mood.score}</p>
                </div>
                <div className="cool-signal" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]/40 px-3 py-2 text-sm text-[var(--text-primary)]/90">
                {mood.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
