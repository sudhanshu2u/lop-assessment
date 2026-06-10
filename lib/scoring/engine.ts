import {
  type Dimension,
  type Zone,
  type DimensionScores,
  type ZoneScores,
  type ScoringResult,
  type RawResponse,
  DIMENSIONS,
  ZONES,
} from "./types";
import { ZONE_MATRIX, ZONE_BOUNDS } from "./zone-matrix";
import { computeCompositeIndices } from "./composite-indices";

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

export function computeScores(responses: RawResponse[]): ScoringResult {
  // Step 1: Dimension scores (0-100)
  const byDim: Record<string, number[]> = {};
  for (const r of responses) {
    if (!byDim[r.dimension]) byDim[r.dimension] = [];
    byDim[r.dimension].push(r.score);
  }

  const dimensionScores = {} as DimensionScores;
  for (const dim of DIMENSIONS) {
    const scores = byDim[dim] ?? [];
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 5;
    dimensionScores[dim] = clamp(avg * 10);
  }

  // Step 2: Zone raw scores
  const zoneRaw: Partial<Record<Zone, number>> = {};
  for (const zone of ZONES) {
    let raw = 0;
    for (const dim of DIMENSIONS) {
      const { weight, inverted } = ZONE_MATRIX[dim][zone];
      if (weight === 0) continue;
      const effective = inverted ? 100 - dimensionScores[dim] : dimensionScores[dim];
      raw += effective * weight;
    }
    zoneRaw[zone] = raw;
  }

  // Step 3: Normalize zone scores to 0-100
  const zoneScores = {} as ZoneScores;
  for (const zone of ZONES) {
    const { min, max } = ZONE_BOUNDS[zone];
    const range = max - min;
    if (range === 0) {
      zoneScores[zone] = 50;
    } else {
      zoneScores[zone] = clamp(((zoneRaw[zone]! - min) / range) * 100);
    }
  }

  // Step 4: Dominant and secondary
  const sorted = ZONES.slice().sort((a, b) => zoneScores[b] - zoneScores[a]);
  const dominantZone = sorted[0];
  const secondaryZone = sorted[1];

  // Step 5: Composite indices
  const compositeIndices = computeCompositeIndices(dimensionScores);

  return { dimensionScores, zoneScores, dominantZone, secondaryZone, compositeIndices };
}
