export const TIER_THRESHOLDS = Object.freeze([
  {
    name: "Tier 1 · Very Clear",
    min: 0,
    max: 2,
    tone: "low",
    icon: "✅",
    description: "Very low ambiguity. Most readers should interpret this the same way.",
  },
  {
    name: "Tier 2 · Mostly Clear",
    min: 2.01,
    max: 4,
    tone: "low",
    icon: "🟢",
    description: "Low ambiguity. Minor wording could still be tightened for precision.",
  },
  {
    name: "Tier 3 · Moderate Risk",
    min: 4.01,
    max: 6,
    tone: "medium",
    icon: "🟡",
    description: "Moderate ambiguity. Some readers may interpret key parts differently.",
  },
  {
    name: "Tier 4 · High Risk",
    min: 6.01,
    max: 8,
    tone: "high",
    icon: "🟠",
    description: "High ambiguity. Important details are likely open to interpretation.",
  },
  {
    name: "Tier 5 · Critical Risk",
    min: 8.01,
    max: 10,
    tone: "high",
    icon: "🔴",
    description: "Critical ambiguity. Rewrite strongly recommended before using this text.",
  },
]);

function clampScore(scoreValue) {
  if (!Number.isFinite(scoreValue)) {
    return null;
  }

  return Math.max(0, Math.min(10, scoreValue));
}

export function classifyRiskTier(scoreValue) {
  const safeScore = clampScore(scoreValue);

  if (safeScore === null) {
    return null;
  }

  const matchedTier = TIER_THRESHOLDS.find((tier) => safeScore >= tier.min && safeScore <= tier.max);

  return matchedTier || TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
}
