import type { AmbiguityTier } from "@/lib/types";
import * as d3 from "d3";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";

interface AmbiguityScoreProps {
  ambiguityScore?: number;
  rawPenaltyScore?: number;
  tier?: AmbiguityTier;
  animationKey?: number;
  defaultExpanded?: boolean;
}

const COUNTER_DURATION_SECONDS = 1.4;
const COUNTER_DURATION_MS = COUNTER_DURATION_SECONDS * 1000;
const NEUTRAL_SCORE_COLOR = "#e8edf5";
const tierBadgeClassMap: Record<AmbiguityTier, string> = {
  1: "k-tier-badge--1",
  2: "k-tier-badge--2",
  3: "k-tier-badge--3"
};
const tierColorMap: Record<AmbiguityTier, string> = {
  1: "#2d7a4f",
  2: "#c9a84c",
  3: "#9b2c2c"
};

const SVG_WIDTH = 280;
const SVG_HEIGHT = 160;
const ARC_CENTER_X = SVG_WIDTH / 2;
const ARC_CENTER_Y = SVG_HEIGHT - 18;
const ARC_RADIUS = 102;

const scoreToAngle = (score: number) => -Math.PI + (Math.max(0, Math.min(10, score)) / 10) * Math.PI;

export function AmbiguityScore({
  ambiguityScore,
  rawPenaltyScore,
  tier,
  animationKey = 0,
  defaultExpanded = false,
}: AmbiguityScoreProps) {
  const hasScore = typeof ambiguityScore === "number";
  const hasRawPenalty = typeof rawPenaltyScore === "number";
  const normalizedScore = useMemo(() => (hasScore ? Math.min(10, Math.max(0, ambiguityScore)) : 0), [ambiguityScore, hasScore]);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayColor, setDisplayColor] = useState(NEUTRAL_SCORE_COLOR);
  const [arcReveal, setArcReveal] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(-Math.PI);
  const [showTierBadge, setShowTierBadge] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(defaultExpanded);
  const [scorePathLength, setScorePathLength] = useState(0);
  const scorePathRef = useRef<SVGPathElement | null>(null);

  const tierText = tier ? `Tier ${tier}` : "—";
  const tierColor = tier ? tierColorMap[tier] : tierColorMap[2];
  const tooltipText = `${normalizedScore.toFixed(1)} / 10 — ${tierText}`;
  const tierBadgeClass = tier ? tierBadgeClassMap[tier] : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]";
  const tierBadgeAnimation = tier === 3
    ? "kTierBadgeSpringIn 300ms ease-out both, kTierBadgeBreath 2.5s ease-in-out infinite 300ms"
    : "kTierBadgeSpringIn 300ms ease-out both";

  const fullArcPath = useMemo(() => {
    const generator = d3.arc();
    return generator({
      innerRadius: ARC_RADIUS,
      outerRadius: ARC_RADIUS,
      startAngle: -Math.PI,
      endAngle: 0,
    }) ?? "";
  }, []);

  const scoreRatio = normalizedScore / 10;
  const scoreSegmentLength = scoreRatio;
  const scoreNeedleRad = scoreToAngle(normalizedScore);

  const boundaryTicks = useMemo(() => {
    return [2.5, 6.0].map((boundaryScore) => {
      const angle = scoreToAngle(boundaryScore);
      const outerR = ARC_RADIUS + 6;
      const innerR = ARC_RADIUS - 8;
      return {
        boundaryScore,
        x1: ARC_CENTER_X + Math.cos(angle) * outerR,
        y1: ARC_CENTER_Y + Math.sin(angle) * outerR,
        x2: ARC_CENTER_X + Math.cos(angle) * innerR,
        y2: ARC_CENTER_Y + Math.sin(angle) * innerR,
      };
    });
  }, []);

  useEffect(() => {
    const path = scorePathRef.current;
    if (!path) {
      return;
    }

    setScorePathLength(path.getTotalLength());
  }, [fullArcPath]);

  useEffect(() => {
    const handleModuleReveal = (event: Event) => {
      const customEvent = event as CustomEvent<{ moduleId?: string }>;
      if (customEvent.detail?.moduleId !== "module-1") {
        return;
      }

      setHasBeenRevealed(true);
      setAnimationTrigger((previous) => previous + 1);
    };

    document.addEventListener("moduleRevealed", handleModuleReveal);
    return () => {
      document.removeEventListener("moduleRevealed", handleModuleReveal);
    };
  }, []);

  useEffect(() => {
    const resetVisualState = () => {
      setAnimatedScore(0);
      setDisplayColor(NEUTRAL_SCORE_COLOR);
      setArcReveal(0);
      setNeedleAngle(-Math.PI);
      setShowTierBadge(false);
    };

    if (!hasScore || !hasBeenRevealed) {
      const resetId = window.setTimeout(resetVisualState, 0);
      return () => window.clearTimeout(resetId);
    }

    const resetId = window.setTimeout(resetVisualState, 0);

    const counterState = { value: 0, color: NEUTRAL_SCORE_COLOR, arcDraw: 0, needle: -Math.PI };
    const ease = gsap.parseEase("expo.out");
    const startTime = performance.now();

    const tickCounter = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION_MS, 1);
      const easedProgress = ease(progress);
      const nextValue = normalizedScore * easedProgress;
      setAnimatedScore(nextValue);

      if (progress >= 1) {
        gsap.ticker.remove(tickCounter);
      }
    };

    gsap.ticker.add(tickCounter);

    const timeline = gsap.timeline({
      defaults: { duration: COUNTER_DURATION_SECONDS, ease: "expo.out" },
      onComplete: () => {
        setAnimatedScore(normalizedScore);
        setShowTierBadge(true);
      }
    });

    timeline.to(counterState, {
      color: tierColor,
      onUpdate: () => setDisplayColor(counterState.color)
    }, 0);

    timeline.to(counterState, {
      arcDraw: 1,
      onUpdate: () => setArcReveal(counterState.arcDraw)
    }, 0);

    timeline.to(counterState, {
      needle: scoreNeedleRad,
      onUpdate: () => setNeedleAngle(counterState.needle)
    }, 0.06);

    return () => {
      window.clearTimeout(resetId);
      gsap.ticker.remove(tickCounter);
      timeline.kill();
    };
  }, [animationKey, animationTrigger, hasBeenRevealed, hasScore, normalizedScore, scoreNeedleRad, tierColor]);

  const computedDashArray = useMemo(() => {
    if (!scorePathLength) {
      return undefined;
    }

    const visibleLength = Math.max(scorePathLength * scoreSegmentLength, 0.0001);
    return `${visibleLength} ${scorePathLength}`;
  }, [scorePathLength, scoreSegmentLength]);

  const computedDashOffset = useMemo(() => {
    if (!scorePathLength) {
      return undefined;
    }

    return scorePathLength * scoreSegmentLength * (1 - arcReveal);
  }, [arcReveal, scorePathLength, scoreSegmentLength]);

  return (
    <CollapsibleCard title="Module 1 · Ambiguity Score" moduleId="module-1" defaultExpanded={defaultExpanded}>
      {!hasScore ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : (
        <>
          <p className="font-mono-ui text-[72px] leading-none sm:text-[96px]" style={{ color: displayColor }}>
            {animatedScore.toFixed(1)}
          </p>

          <div
            className="relative mt-3 w-full max-w-[280px]"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {showTooltip ? (
              <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)]/95 px-2 py-1 font-mono-ui text-[11px] text-[var(--text-primary)]">
                {tooltipText}
              </div>
            ) : null}
            <svg
              className="block w-full h-auto"
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="img"
              aria-label={tooltipText}
            >
              <path
                d={fullArcPath}
                transform={`translate(${ARC_CENTER_X}, ${ARC_CENTER_Y})`}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={8}
                strokeLinecap="round"
              />
              <path
                ref={scorePathRef}
                d={fullArcPath}
                transform={`translate(${ARC_CENTER_X}, ${ARC_CENTER_Y})`}
                fill="none"
                stroke={tierColor}
                strokeWidth={8}
                strokeLinecap="round"
                style={{
                  strokeDasharray: computedDashArray,
                  strokeDashoffset: computedDashOffset,
                }}
              />
              {boundaryTicks.map((tick) => (
                <line
                  key={tick.boundaryScore}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ))}

              <line
                x1={ARC_CENTER_X}
                y1={ARC_CENTER_Y}
                x2={ARC_CENTER_X + Math.cos(needleAngle) * (ARC_RADIUS - 18)}
                y2={ARC_CENTER_Y + Math.sin(needleAngle) * (ARC_RADIUS - 18)}
                stroke="#c9a84c"
                strokeWidth={2}
                strokeLinecap="round"
                style={{ transition: "x2 220ms cubic-bezier(0.22, 1, 0.36, 1), y2 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
              <circle cx={ARC_CENTER_X} cy={ARC_CENTER_Y} r={3.5} fill="#c9a84c" />
              <text
                x={ARC_CENTER_X}
                y={SVG_HEIGHT - 10}
                textAnchor="middle"
                className="font-mono-ui"
                fontSize="12"
                fill="rgba(232,237,245,0.8)"
              >
                Ambiguity Score
              </text>
            </svg>
          </div>

          <p className="font-mono-ui mt-3 text-[13px] text-[var(--text-gold)]/70">
            Raw Penalty: {hasRawPenalty ? `${rawPenaltyScore.toFixed(1)} / 12.0` : "—"}
          </p>
          {showTierBadge ? (
            <p
              className={`k-tier-badge mt-2 ${tierBadgeClass}`}
              style={{ animation: tierBadgeAnimation }}
            >
              {tierText}
            </p>
          ) : null}
        </>
      )}
    </CollapsibleCard>
  );
}
