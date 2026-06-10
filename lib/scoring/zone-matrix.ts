import type { Dimension, Zone } from "./types";

export interface ZoneWeight {
  weight: number;
  inverted?: boolean; // true = use (10 - rawAvg) × 10 as effective score
}

export type ZoneMatrix = Record<Dimension, Record<Zone, ZoneWeight>>;

export const ZONE_MATRIX: ZoneMatrix = {
  A: {
    Dreamer: { weight: 3 },
    Perfectionist: { weight: 0 },
    Delegate: { weight: 1 },
    Rebel: { weight: 1 },
    CrisisMaker: { weight: 0 },
    Avoider: { weight: -1 },
    Overwhelmed: { weight: 0 },
  },
  B: {
    Dreamer: { weight: 0 },
    Perfectionist: { weight: 3 },
    Delegate: { weight: -1 },
    Rebel: { weight: -1 },
    CrisisMaker: { weight: 0 },
    Avoider: { weight: 1 },
    Overwhelmed: { weight: 0 },
  },
  C: {
    Dreamer: { weight: -1 },
    Perfectionist: { weight: -2 },
    Delegate: { weight: 3 },
    Rebel: { weight: 0 },
    CrisisMaker: { weight: -1 },
    Avoider: { weight: -1 },
    Overwhelmed: { weight: -1 },
  },
  D: {
    Dreamer: { weight: 0 },
    Perfectionist: { weight: 0 },
    Delegate: { weight: 0 },
    Rebel: { weight: 0 },
    CrisisMaker: { weight: -2, inverted: true },
    Avoider: { weight: -1, inverted: true },
    Overwhelmed: { weight: -3, inverted: true },
  },
  E: {
    Dreamer: { weight: 2 },
    Perfectionist: { weight: 0 },
    Delegate: { weight: 0 },
    Rebel: { weight: 2 },
    CrisisMaker: { weight: 0 },
    Avoider: { weight: -2 },
    Overwhelmed: { weight: -1 },
  },
  F: {
    Dreamer: { weight: 1 },
    Perfectionist: { weight: -2 },
    Delegate: { weight: 0 },
    Rebel: { weight: 3 },
    CrisisMaker: { weight: 0 },
    Avoider: { weight: -2 },
    Overwhelmed: { weight: 0 },
  },
  G: {
    Dreamer: { weight: 1 },
    Perfectionist: { weight: 2 },
    Delegate: { weight: 2 },
    Rebel: { weight: -1 },
    CrisisMaker: { weight: 0 },
    Avoider: { weight: -2 },
    Overwhelmed: { weight: 0 },
  },
  H: {
    Dreamer: { weight: 0 },
    Perfectionist: { weight: 0 },
    Delegate: { weight: -1 },
    Rebel: { weight: 1 },
    CrisisMaker: { weight: 3 },
    Avoider: { weight: 0 },
    Overwhelmed: { weight: 2 },
  },
  I: {
    Dreamer: { weight: 0 },
    Perfectionist: { weight: -1 },
    Delegate: { weight: 2 },
    Rebel: { weight: 0 },
    CrisisMaker: { weight: 0 },
    Avoider: { weight: -1 },
    Overwhelmed: { weight: -1 },
  },
  J: {
    Dreamer: { weight: 1 },
    Perfectionist: { weight: 0 },
    Delegate: { weight: 0 },
    Rebel: { weight: 0 },
    CrisisMaker: { weight: -2, inverted: true },
    Avoider: { weight: -1, inverted: true },
    Overwhelmed: { weight: -3, inverted: true },
  },
};

function computeTheoreticalBounds(): Record<Zone, { min: number; max: number }> {
  const bounds: Partial<Record<Zone, { min: number; max: number }>> = {};
  const zones: Zone[] = [
    "Dreamer", "Perfectionist", "Delegate", "Rebel", "CrisisMaker", "Avoider", "Overwhelmed",
  ];
  const dims: Dimension[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  for (const zone of zones) {
    let minRaw = 0;
    let maxRaw = 0;
    for (const dim of dims) {
      const { weight, inverted } = ZONE_MATRIX[dim][zone];
      if (weight === 0) continue;
      // effective score range: 0–100 (regardless of inversion)
      const contrib0 = 0 * weight; // score=0 × weight
      const contrib100 = 100 * weight; // score=100 × weight
      minRaw += Math.min(contrib0, contrib100);
      maxRaw += Math.max(contrib0, contrib100);
    }
    bounds[zone] = { min: minRaw, max: maxRaw };
  }
  return bounds as Record<Zone, { min: number; max: number }>;
}

export const ZONE_BOUNDS = computeTheoreticalBounds();
