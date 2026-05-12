import React, { useState } from 'react';
import { LabCard, LabWell, LabLabel } from "../lab";

interface ForensicInspectorProps {
  sourceText?: string;
}

export function ForensicInspector({ sourceText }: ForensicInspectorProps) {
  if (!sourceText) return null;

  return (
    <LabCard className="p-6 col-span-3 lg:col-span-3 mt-6">
      <LabLabel className="mb-4 block">Source Text Inspector</LabLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LabWell className="p-6 h-[400px] overflow-y-auto">
          <p className="font-mono text-sm leading-[1.6] text-[var(--lab-ink)]">
            {sourceText}
          </p>
        </LabWell>
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-[var(--lab-shadow-dark)] rounded-[16px]">
          <svg className="w-8 h-8 text-[var(--lab-gold)] opacity-50 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="font-sans text-sm text-[var(--lab-muted)] text-center max-w-[250px]">
            Bidirectional sync is currently tracking the source well. Click any module to highlight corresponding text.
          </p>
        </div>
      </div>
    </LabCard>
  );
}
