export type Dimension = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
export type Zone =
  | "Dreamer"
  | "Perfectionist"
  | "Delegate"
  | "Rebel"
  | "CrisisMaker"
  | "Avoider"
  | "Overwhelmed";

export const DIMENSIONS: Dimension[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const ZONES: Zone[] = [
  "Dreamer",
  "Perfectionist",
  "Delegate",
  "Rebel",
  "CrisisMaker",
  "Avoider",
  "Overwhelmed",
];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  A: "Strategic Thinking",
  B: "Attention to Detail",
  C: "Delegation Capability",
  D: "Stress Handling",
  E: "Initiative",
  F: "Change Acceptance",
  G: "Accountability",
  H: "Crisis Dependence",
  I: "Collaboration",
  J: "Workload Management",
};

export type DimensionScores = Record<Dimension, number>;
export type ZoneScores = Record<Zone, number>;

export interface CompositeIndices {
  leadershipMaturityScore: number;
  delegationIndex: number;
  strategicThinkingIndex: number;
  executionIndex: number;
  burnoutRiskScore: number;
  successionReadinessScore: number;
}

export interface ScoringResult {
  dimensionScores: DimensionScores;
  zoneScores: ZoneScores;
  dominantZone: Zone;
  secondaryZone: Zone;
  compositeIndices: CompositeIndices;
}

export interface RawResponse {
  questionId: string;
  dimension: Dimension;
  score: number; // 1-10
}
