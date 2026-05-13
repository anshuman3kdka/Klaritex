import React, { useCallback, useMemo, useRef, useState } from "react";
import { LabCard, LabWell, LabLabel } from "../lab";

interface ForensicInspectorProps {
  sourceText?: string;
}

const MAX_FINDINGS = 12;

export function ForensicInspector({ sourceText }: ForensicInspectorProps) {
  const resolvedSourceText = sourceText ?? "";

  const findings = useMemo(() => {
    return resolvedSourceText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, index) => ({ id: index, text: line }))
      .slice(0, MAX_FINDINGS);
  }, [resolvedSourceText]);

  const [activeId, setActiveId] = useState<number | null>(null);
  const sourceRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const cardRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const focusPair = useCallback((id: number) => {
    setActiveId(id);
    sourceRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" });
    cardRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  const selectedActiveId = useMemo(
    () => (findings.some((item) => item.id === activeId) ? activeId : (findings[0]?.id ?? null)),
    [activeId, findings]
  );

  if (!sourceText) return null;

  return (
    <LabCard className="p-6 col-span-3 lg:col-span-3 mt-6">
      <LabLabel className="mb-4 block">Source Text Inspector · Forensic Sync</LabLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LabWell className="p-4 h-[400px] overflow-y-auto">
          <ol className="space-y-2">
            {findings.map((finding, index) => {
              const isActive = finding.id === selectedActiveId;
              return (
                <li key={finding.id} className="grid grid-cols-[44px_1fr] items-start gap-3">
                  <span className="font-mono text-[11px] text-[var(--lab-muted)] pt-2">
                    L{index + 1}
                  </span>
                  <button
                    ref={(node) => {
                      sourceRefs.current[finding.id] = node;
                    }}
                    type="button"
                    onClick={() => focusPair(finding.id)}
                    className={`w-full rounded-[8px] px-3 py-2 text-left font-mono text-[13px] leading-[1.6] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 ${
                      isActive
                        ? "bg-[color-mix(in_oklab,var(--lab-gold)_30%,transparent)] shadow-[var(--shadow-pressed)]"
                        : "bg-[color-mix(in_oklab,var(--lab-gold)_15%,transparent)]"
                    }`}
                    aria-pressed={isActive}
                  >
                    {finding.text}
                  </button>
                </li>
              );
            })}
          </ol>
        </LabWell>
        <div className="h-[400px] overflow-y-auto space-y-3">
          {findings.map((finding, index) => {
            const isActive = finding.id === selectedActiveId;
            return (
              <button
                key={finding.id}
                ref={(node) => {
                  cardRefs.current[finding.id] = node;
                }}
                type="button"
                onClick={() => focusPair(finding.id)}
                className={`block w-full rounded-[16px] p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 ${
                  isActive
                    ? "bg-[var(--lab-surface)] shadow-[var(--shadow-extruded),0_0_12px_color-mix(in_oklab,var(--lab-gold)_28%,transparent)]"
                    : "bg-[var(--lab-surface)] shadow-[var(--shadow-extruded)]"
                }`}
                aria-pressed={isActive}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--lab-muted)]">
                  Finding {index + 1}
                </p>
                <p className="mt-2 font-sans text-sm text-[var(--lab-ink)]">
                  {finding.text.length > 180 ? `${finding.text.slice(0, 180)}…` : finding.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </LabCard>
  );
}
