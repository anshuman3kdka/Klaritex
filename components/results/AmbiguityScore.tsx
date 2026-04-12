import type { AmbiguityTier } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";

interface AmbiguityScoreProps {
  ambiguityScore?: number;
  rawPenaltyScore?: number;
  tier?: AmbiguityTier;
  animationKey?: number;
}

const COUNTER_DURATION_MS = 1200;
const COUNTER_INTERVAL_MS = 30;
const tierBadgeClassMap: Record<AmbiguityTier, string> = {
  1: "k-tier-badge--1",
  2: "k-tier-badge--2",
  3: "k-tier-badge--3"
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function AmbiguityScore({ ambiguityScore, rawPenaltyScore, tier, animationKey = 0 }: AmbiguityScoreProps) {
  const hasScore = typeof ambiguityScore === "number";
  const hasRawPenalty = typeof rawPenaltyScore === "number";
  const normalizedScore = useMemo(() => (hasScore ? Math.min(10, Math.max(0, ambiguityScore)) : 0), [ambiguityScore, hasScore]);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showTierBadge, setShowTierBadge] = useState(false);
  const scorePercent = (animatedScore / 10) * 100;
  const tierText = tier ? `Tier ${tier}` : "—";
  const tierBadgeClass = tier ? tierBadgeClassMap[tier] : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]";
  const tierBadgeAnimation = tier === 3
    ? "kTierBadgeSpringIn 300ms ease-out both, kTierBadgeBreath 2.5s ease-in-out infinite 300ms"
    : "kTierBadgeSpringIn 300ms ease-out both";

  useEffect(() => {
    if (!hasScore) {
      setAnimatedScore(0);
      setShowTierBadge(false);
      return;
    }

    setAnimatedScore(0);
    setShowTierBadge(false);
    const startTime = performance.now();

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION_MS, 1);
      const easedProgress = easeOutCubic(progress);
      const nextScore = normalizedScore * easedProgress;
      setAnimatedScore(nextScore);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setAnimatedScore(normalizedScore);
        setShowTierBadge(true);
      }
    }, COUNTER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [animationKey, hasScore, normalizedScore]);

  return (
    <CollapsibleCard title="Module 1 · Ambiguity Score">
      {!hasScore ? (
        <p className="font-ui rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">—</p>
      ) : (
        <>
          <p className="font-mono-ui text-5xl text-[var(--text-gold)] sm:text-6xl">{animatedScore.toFixed(1)}</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--bg-primary)]">
            <div className="flex h-full w-full">
              <div className="h-full bg-[var(--gold-primary)]" style={{ width: `${scorePercent}%` }} />
              <div className="h-full bg-[var(--tier3-color)]/90" style={{ width: `${100 - scorePercent}%` }} />
            </div>
          </div>
          <p className="font-mono-ui mt-3 text-xs text-[var(--text-secondary)]">
            Raw Penalty Score: {hasRawPenalty ? `${rawPenaltyScore.toFixed(1)} / 12.0` : "—"}
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
