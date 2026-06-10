import type { DimensionScores, CompositeIndices } from "./types";

function avg(...vals: number[]): number {
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

function inv(score: number): number {
  return 100 - score;
}

export function computeCompositeIndices(d: DimensionScores): CompositeIndices {
  return {
    leadershipMaturityScore: avg(d.A, d.C, d.G, d.I),
    delegationIndex: d.C,
    strategicThinkingIndex: d.A,
    executionIndex: avg(d.G, inv(d.H), d.J),
    burnoutRiskScore: avg(inv(d.D), inv(d.J), d.H),
    successionReadinessScore: avg(d.A, d.C, d.E, d.G),
  };
}
