"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LabCard, LabLabel, LabWell } from "../lab";
import { useCounter } from "./useCounter";

interface ActionTalkRatioProps {
  actionRatio?: number;
  talkRatio?: number;
  ratioLabel?: string;
}

const BAR_DURATION_MS = 800;
const TALK_DELAY_MS = 100;
const LABEL_FADE_MS = 200;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function ActionTalkRatio({ actionRatio, talkRatio, ratioLabel }: ActionTalkRatioProps) {
  const hasRatios = typeof actionRatio === "number" && typeof talkRatio === "number";
  const safeAction = hasRatios ? Math.min(100, Math.max(0, actionRatio)) : 0;
  const safeTalk = hasRatios ? Math.min(100, Math.max(0, talkRatio)) : 0;
  const [hasStarted, setHasStarted] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<"action" | "talk" | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const isJustTalk = hasRatios && safeAction < 30;

  useEffect(() => {
    if (!hasRatios) {
      const resetId = window.setTimeout(() => {
        setHasStarted(false);
        setShowLabel(false);
      }, 0);
      return () => window.clearTimeout(resetId);
    }

    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionId = window.setTimeout(() => {
        setHasStarted(true);
        setShowLabel(true);
      }, 0);
      return () => window.clearTimeout(reducedMotionId);
    }

    const currentBar = barRef.current;
    if (!currentBar) {
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      const fallbackId = window.setTimeout(() => {
        setHasStarted(true);
      }, 0);
      return () => window.clearTimeout(fallbackId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: [0.2] }
    );

    observer.observe(currentBar);

    return () => observer.disconnect();
  }, [hasRatios]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowLabel(true);
    }, BAR_DURATION_MS + TALK_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasStarted, safeAction, safeTalk]);

  const animatedAction = useCounter({
    target: safeAction,
    durationMs: BAR_DURATION_MS,
    start: hasStarted,
    easing: easeOutCubic,
  });

  const animatedTalk = useCounter({
    target: safeTalk,
    durationMs: BAR_DURATION_MS,
    delayMs: TALK_DELAY_MS,
    start: hasStarted,
    easing: easeOutCubic,
  });

  const actionDisplay = hasStarted ? animatedAction : 0;
  const talkDisplay = hasStarted ? animatedTalk : 0;

  const labelText = useMemo(() => ratioLabel || "—", [ratioLabel]);
  const isLabelVisible = hasStarted && showLabel;

  return (
    <LabCard className="p-6">
      <LabLabel className="mb-6 block">Module 7 · Action vs Talk Ratio</LabLabel>
      {!hasRatios ? (
        <p className="font-mono text-sm text-[var(--lab-muted)]">—</p>
      ) : (
        <>
          <p className="font-mono text-[13px] text-[var(--lab-ink)] font-semibold mb-4">
            {actionDisplay.toFixed(1)}% Action / {talkDisplay.toFixed(1)}% Talk
          </p>

          <div ref={barRef} className="h-4 overflow-hidden rounded-full shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)] flex items-center px-1 gap-1">
            <div
              className="rounded-full bg-[var(--lab-gold)] h-2 transition-all duration-200"
              style={{ width: `${actionDisplay}%` }}
              onMouseEnter={() => setHoveredSegment("action")}
              onMouseLeave={() => setHoveredSegment(null)}
            />
            <div
              className="rounded-full bg-[var(--lab-muted)] opacity-50 h-2 transition-all duration-200"
              style={{
                width: `${talkDisplay}%`,
              }}
              onMouseEnter={() => setHoveredSegment("talk")}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          </div>

          <p
            className="font-mono mt-6 text-[11px] uppercase tracking-widest text-[var(--lab-gold)] font-semibold transition-opacity"
            style={{ opacity: isLabelVisible ? 1 : 0, transitionDuration: `${LABEL_FADE_MS}ms` }}
          >
            {labelText}
          </p>
        </>
      )}
    </LabCard>
  );
}
