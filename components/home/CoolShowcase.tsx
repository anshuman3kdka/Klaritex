"use client";

import { useMemo, useState } from "react";

import type { AnalysisMode, InputMode } from "@/lib/types";
import { LabCard, LabButton, LabLabel } from "../lab";

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
    <section className="k-entrance-fade-down mx-auto mb-10 w-full max-w-5xl px-4 sm:px-6">
      <LabCard className="overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="min-w-0">
            <LabLabel>Preview Modes</LabLabel>
            <h2 className="mt-2 font-serif text-2xl text-[var(--lab-ink)] sm:text-3xl font-semibold">
              Demo preview of Klaritex scoring modes.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--lab-muted)] sm:text-base">
              This card shows sample results only. Use the Analyze section below to run real analysis on your text.
            </p>
            <LabButton
              onClick={handlePrimaryCtaClick}
              className="mt-6"
            >
              Try with my text
            </LabButton>

            <div className="mt-8 flex flex-wrap gap-2">
              {MOODS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => handleMoodClick(entry.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-mono transition sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 ${
                    activeMood === entry.key
                      ? "shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)] text-[var(--lab-gold)]"
                      : "shadow-[var(--shadow-extruded)] bg-[var(--lab-surface)] text-[var(--lab-muted)] hover:text-[var(--lab-ink)] hover:shadow-[var(--shadow-pressed)]"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2 sm:hidden" aria-label="Example things to analyze">
              {IDEA_CHIPS.map((chip) => (
                <span key={chip} className="shadow-[var(--shadow-extruded)] bg-[var(--lab-surface)] rounded-full px-3 py-1 text-xs text-[var(--lab-muted)] font-mono">
                  {chip}
                </span>
              ))}
            </div>

            <div className="cool-marquee mt-8 hidden sm:block" aria-label="Example things to analyze">
              <div className="cool-marquee-track">
                {[...IDEA_CHIPS, ...IDEA_CHIPS].map((chip, index) => (
                  <span key={`${chip}-${index}`} className="shadow-[var(--shadow-extruded)] bg-[var(--lab-surface)] rounded-full px-3 py-1 text-xs text-[var(--lab-muted)] font-mono mx-1">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 rounded-2xl p-6 shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)]">
            <div className="relative">
              <LabLabel>{mood.label}</LabLabel>
              <p className="mt-1 text-sm text-[var(--lab-muted)] font-sans">{mood.subtitle}</p>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <LabLabel>Confidence</LabLabel>
                  <p className="mt-1 font-serif text-4xl text-[var(--lab-ink)] font-semibold">{mood.score}</p>
                </div>
              </div>

              <p className="mt-6 rounded-lg p-4 text-sm text-[var(--lab-ink)] shadow-[var(--shadow-extruded)] bg-[var(--lab-surface)]">
                {mood.note}
              </p>
            </div>
          </div>
        </div>
      </LabCard>
    </section>
  );
}
