"use client";

import { useState } from "react";

import {
  LabButton,
  LabCard,
  LabDial,
  LabLabel,
  LabPill,
  LabToggle,
  LabVerdict,
  LabWell,
} from "@/components/lab";

/**
 * Laboratory White — primitives gallery.
 *
 * This route exists for visual QA during the phased redesign. It is
 * not linked from anywhere in the production navigation, does not
 * appear in the sitemap, and consumes zero application APIs.
 *
 * Reach it manually at /_lab while inspecting changes.
 */
export default function LabGalleryPage() {
  const [stress, setStress] = useState(false);

  return (
    <main className="min-h-[100dvh] bg-[var(--lab-surface)] px-6 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-3">
          <LabLabel>Laboratory White · Primitives Gallery</LabLabel>
          <h1 className="font-serif text-4xl font-semibold tracking-[-0.01em] text-[var(--lab-ink)] sm:text-5xl">
            Component DNA
          </h1>
          <p className="max-w-prose font-sans text-[15px] leading-[1.6] text-[var(--lab-ink)]/80">
            Atomic building blocks composed in Phase 2. Every Phase 3–6 module
            assembles from these primitives — no neumorphic shadow logic should
            ever be re-implemented at the call site.
          </p>
        </header>

        {/* Cards & Wells ------------------------------------------------ */}
        <section className="flex flex-col gap-4">
          <LabLabel>01 · Surfaces</LabLabel>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <LabCard padding="lg">
              <LabLabel>Lab Card · Extruded</LabLabel>
              <p className="mt-3 font-sans text-[15px] leading-[1.6] text-[var(--lab-ink)]">
                Conclusion / Control surface. Pops out of the Lab Surface
                through outset shadow. Used for every module container.
              </p>
            </LabCard>
            <LabCard padding="lg" elevation="lg" interactive>
              <LabLabel>Lab Card · Lifted (Interactive)</LabLabel>
              <p className="mt-3 font-sans text-[15px] leading-[1.6] text-[var(--lab-ink)]">
                Hover lifts the card from 6px to 10px shadow blur, simulating
                the surface rising toward the user.
              </p>
            </LabCard>
            <LabWell padding="lg">
              <LabLabel>Lab Well · Pressed</LabLabel>
              <p className="mt-3 font-mono text-[13px] leading-relaxed text-[var(--lab-ink)]">
                Evidence / Input / Data Well. Carved into the Lab Surface
                through inset shadow. Hosts text inputs and source panes.
              </p>
            </LabWell>
            <LabWell padding="lg" radius="card" depth="default">
              <LabLabel>Lab Well · Source Pane</LabLabel>
              <p className="mt-3 font-mono text-[14px] leading-[1.6] text-[var(--lab-ink)]">
                &quot;We will{" "}
                <span className="rounded-sm bg-[var(--lab-gold)]/15 px-0.5 underline decoration-[var(--lab-gold)] decoration-dashed underline-offset-[3px]">
                  endeavour to support
                </span>{" "}
                stakeholders where reasonably practicable.&quot;
              </p>
            </LabWell>
          </div>
        </section>

        {/* Pills -------------------------------------------------------- */}
        <section className="flex flex-col gap-4">
          <LabLabel>02 · Status Pills</LabLabel>
          <LabCard padding="lg">
            <div className="flex flex-wrap items-center gap-3">
              <LabPill tone="clear">Locked In</LabPill>
              <LabPill tone="broad">Unclear</LabPill>
              <LabPill tone="missing">Missing</LabPill>
              <LabPill tone="gold">Testable</LabPill>
              <LabPill tone="broad">Contested</LabPill>
              <LabPill tone="muted">Untestable</LabPill>
              <LabPill tone="missing">[NO TIMELINE]</LabPill>
              <LabPill tone="missing">[NO METRIC]</LabPill>
              <LabPill tone="neutral" variant="extruded">
                Tier One
              </LabPill>
            </div>
          </LabCard>
        </section>

        {/* Buttons ------------------------------------------------------ */}
        <section className="flex flex-col gap-4">
          <LabLabel>03 · Mechanical Controls</LabLabel>
          <LabCard padding="lg">
            <div className="flex flex-wrap items-center gap-4">
              <LabButton size="sm">Run</LabButton>
              <LabButton>Analyze Document</LabButton>
              <LabButton size="lg" glow>
                Engage Engine
              </LabButton>
              <LabButton variant="secondary">Reset</LabButton>
              <LabButton variant="ghost">Cancel</LabButton>
              <LabButton pressed>Active</LabButton>
              <LabButton disabled>Disabled</LabButton>
            </div>
            <p className="mt-4 font-mono text-[12px] text-[var(--lab-muted)]">
              Click any button to feel the mechanical shift: extruded → pressed
              over 200ms ease-in-out.
            </p>
          </LabCard>
        </section>

        {/* Toggle ------------------------------------------------------- */}
        <section className="flex flex-col gap-4">
          <LabLabel>04 · Stress Test Toggle</LabLabel>
          <LabCard padding="lg">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <LabLabel>Adversarial Mode</LabLabel>
                <p className="max-w-prose font-sans text-[15px] leading-[1.6] text-[var(--lab-ink)]">
                  Reclassifies commitments under hostile scrutiny. Active state
                  illuminates the knob with Diagnostic Gold and shifts the
                  module into the &quot;Verification&quot; mode shift.
                </p>
              </div>
              <LabToggle
                checked={stress}
                onCheckedChange={setStress}
                label={stress ? "Stress Test · On" : "Stress Test · Off"}
              />
            </div>
          </LabCard>
        </section>

        {/* Dials -------------------------------------------------------- */}
        <section className="flex flex-col gap-4">
          <LabLabel>05 · Diagnostic Dials</LabLabel>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <LabCard padding="lg" className="flex flex-col items-center gap-4">
              <LabDial
                size={200}
                value={0.18}
                tone="clear"
                segments={24}
                label="Ambiguity Score"
                caption="Raw 4.5"
                ariaLabel="Ambiguity score eighteen percent — Solid"
              >
                <span className="font-serif text-5xl font-normal leading-none text-[var(--lab-ink)]">
                  18
                </span>
              </LabDial>
              <LabVerdict tone="clear" dot size="md">
                Verdict: Solid
              </LabVerdict>
            </LabCard>

            <LabCard padding="lg" className="flex flex-col items-center gap-4">
              <LabDial
                size={200}
                value={0.54}
                tone="broad"
                segments={24}
                label="Ambiguity Score"
                caption="Raw 13.5"
                ariaLabel="Ambiguity score fifty-four percent — Marginal"
              >
                <span className="font-serif text-5xl font-normal leading-none text-[var(--lab-ink)]">
                  54
                </span>
              </LabDial>
              <LabVerdict tone="broad" dot size="md">
                Verdict: Marginal
              </LabVerdict>
            </LabCard>

            <LabCard padding="lg" className="flex flex-col items-center gap-4">
              <LabDial
                size={200}
                value={0.87}
                tone="missing"
                segments={24}
                label="Ambiguity Score"
                caption="Raw 21.7"
                ariaLabel="Ambiguity score eighty-seven percent — Rhetorical"
              >
                <span className="font-serif text-5xl font-normal leading-none text-[var(--lab-ink)]">
                  87
                </span>
              </LabDial>
              <LabVerdict tone="missing" dot size="md">
                Verdict: Rhetorical
              </LabVerdict>
            </LabCard>
          </div>
        </section>

        {/* Typography --------------------------------------------------- */}
        <section className="flex flex-col gap-4">
          <LabLabel>06 · Typographic Tension</LabLabel>
          <LabCard padding="lg" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <LabLabel>Authority · Playfair Display</LabLabel>
              <p className="font-serif text-5xl font-normal tracking-[-0.01em] leading-[1.1] text-[var(--lab-ink)]">
                Marginal
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <LabLabel>Precision · DM Mono</LabLabel>
              <p className="font-mono text-[13px] leading-relaxed text-[var(--lab-ink)]">
                AGENT: Defined &middot; ACTION: Defined &middot; OBJECT:
                Defined &middot; QUANTIFIER: Missing &middot; TIMEFRAME: Vague
                &middot; PREMISE: Defined
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <LabLabel>Source · Inter</LabLabel>
              <p className="font-sans text-[15px] leading-[1.6] text-[var(--lab-ink)]">
                The Company shall use commercially reasonable efforts to
                deliver the platform updates referenced herein in a timely
                fashion, subject to operational priorities.
              </p>
            </div>
          </LabCard>
        </section>

        {/* Verdicts ----------------------------------------------------- */}
        <section className="flex flex-col gap-4">
          <LabLabel>07 · Verdict Lines</LabLabel>
          <LabCard padding="lg" className="flex flex-col gap-4">
            <LabVerdict tone="clear" dot>
              Verdict: Solid (Tier One)
            </LabVerdict>
            <LabVerdict tone="broad" dot>
              Verdict: Marginal (Tier Two)
            </LabVerdict>
            <LabVerdict tone="missing" dot>
              Verdict: Rhetorical (Tier Three)
            </LabVerdict>
            <LabVerdict tone="gold" dot size="md">
              Stress Test · 2 of 6 Testable
            </LabVerdict>
          </LabCard>
        </section>
      </div>
    </main>
  );
}
