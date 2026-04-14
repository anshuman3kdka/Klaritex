"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
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
    <CollapsibleCard title="Module 7 · Action vs Talk Ratio" moduleId="module-7">
      {!hasRatios ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : (
        <>
          <p className="font-mono-ui text-sm text-[var(--text-primary)]">
            {actionDisplay.toFixed(1)}% Action / {talkDisplay.toFixed(1)}% Talk
          </p>

          <div ref={barRef} className="mt-3 h-6 overflow-hidden rounded-full bg-[var(--bg-primary)] px-0.5">
            <div className="flex h-full w-full items-center gap-0.5">
              <div
                className="group relative flex items-center justify-center rounded-full bg-[var(--gold-primary)] text-[10px] font-medium text-[#0d101a] transition-all duration-200"
                style={{ width: `${actionDisplay}%`, height: hoveredSegment === "action" ? "6px" : "3px" }}
                onMouseEnter={() => setHoveredSegment("action")}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {hoveredSegment === "action" ? `Action ${safeAction.toFixed(1)}%` : null}
              </div>
              <div
                className="group relative flex items-center justify-center rounded-full bg-[var(--tier3-color)]/90 text-[10px] font-medium text-[#f7d4d4] transition-all duration-200"
                style={{
                  width: `${talkDisplay}%`,
                  height: hoveredSegment === "talk" ? "6px" : "3px",
                  animation: isJustTalk ? "kTierBadgeBreath 2.5s ease-in-out infinite" : undefined,
                }}
                onMouseEnter={() => setHoveredSegment("talk")}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {hoveredSegment === "talk" ? `Talk ${safeTalk.toFixed(1)}%` : null}
              </div>
            </div>
          </div>

          <p
            className="font-mono-ui mt-3 inline-flex rounded-sm border border-[var(--gold-muted)]/70 bg-[var(--gold-primary)]/14 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--text-gold)] transition-opacity"
            style={{ opacity: isLabelVisible ? 1 : 0, transitionDuration: `${LABEL_FADE_MS}ms` }}
          >
            {labelText}
          </p>
        </>
      )}
    </CollapsibleCard>
  );
}
