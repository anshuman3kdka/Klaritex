"use client";

import React, { useState } from 'react';
import {
  LabCard,
  LabWell,
  LabButton,
  LabPill,
  LabLabel,
  LabToggle,
  LabVerdict
} from '../../components/lab';

export default function LabStorybook() {
  const [toggleState, setToggleState] = useState(false);

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-12">
      <header className="mb-12">
        <h1 className="font-serif text-4xl mb-2">Laboratory White</h1>
        <p className="font-sans text-[var(--lab-muted)]">Phase 2: Atomic Neumorphic Primitives Preview</p>
      </header>

      <section>
        <LabLabel className="block mb-4">Cards & Wells</LabLabel>
        <div className="grid grid-cols-2 gap-8">
          <LabCard className="p-6 h-32 flex items-center justify-center">
            <span className="font-sans">LabCard (Extruded, 16px radius)</span>
          </LabCard>
          <LabWell className="p-6 h-32 flex items-center justify-center">
            <span className="font-sans text-[var(--lab-muted)]">LabWell (Pressed, 8px radius)</span>
          </LabWell>
        </div>
      </section>

      <section>
        <LabLabel className="block mb-4">Interactions</LabLabel>
        <div className="flex gap-6 items-center p-6 rounded-2xl bg-[var(--lab-surface)]">
          <LabButton>Standard Action</LabButton>
          <LabButton activeGlow>Active/Glow Action</LabButton>
          <div className="w-px h-8 bg-[var(--lab-shadow-dark)] opacity-50 mx-4" />
          <LabToggle checked={toggleState} onChange={setToggleState} aria-label="Demo Toggle" />
          <span className="font-mono text-sm ml-2">State: {toggleState ? 'ON' : 'OFF'}</span>
        </div>
      </section>

      <section>
        <LabLabel className="block mb-4">Typography & Status</LabLabel>
        <LabCard className="p-8 space-y-8">
          <div className="space-y-2">
            <LabVerdict verdict="Tier One: Highly Concrete" tier={1} />
            <LabVerdict verdict="Tier Two: Generally Clear" tier={2} />
            <LabVerdict verdict="Tier Three: Highly Vague" tier={3} />
          </div>

          <div className="w-full h-px bg-[var(--lab-shadow-dark)] opacity-20 my-4" />

          <div className="flex flex-wrap gap-4">
            <LabPill status="Locked In" />
            <LabPill status="Testable" />
            <LabPill status="Unclear" />
            <LabPill status="Contested" />
            <LabPill status="Missing" />
            <LabPill status="Untestable" />
          </div>
        </LabCard>
      </section>
    </div>
  );
}
