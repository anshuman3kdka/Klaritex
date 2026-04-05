export type AnalysisMode = "quick" | "deep";

export type InputMode = "text" | "pdf" | "url";

export type ElementStatus = "clear" | "broad" | "missing";

export type AmbiguityTier = 1 | 2 | 3;

export interface CommitmentElement {
  name: string;
  status: ElementStatus;
  penalty: number;
  notes: string;
}

export interface ExposureItem {
  label: string;
  status: "locked-in" | "unclear" | "missing";
}

export interface VagueLine {
  sentence: string;
  reason: string;
}

export interface StructuralAnchor {
  sentence: string;
  issue: string;
}

export interface AnalysisResult {
  ambiguityScore: number;
  rawPenaltyScore: number;
  tier: AmbiguityTier;
  tierOverride: boolean;
  overrideRule?: "tier-floor" | "critical-pair" | null;
  clarityLevel: number;
  elements: CommitmentElement[];
  exposureCheck?: ExposureItem[];
  unanchoredClaimsCount: number;
  vagueLines: VagueLine[];
  lowestAnchors: StructuralAnchor[];
  actionRatio: number;
  talkRatio: number;
  ratioLabel: string;
  commitmentSummary: string;
  ambiguityExplanation: string[];
  verifiableRequirements: string[];
}
