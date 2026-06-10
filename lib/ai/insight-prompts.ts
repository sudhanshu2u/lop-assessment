import type { AssessmentResult, User } from "@prisma/client";
import { DIMENSION_LABELS } from "@/lib/scoring/types";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import type { Zone, Dimension, DimensionScores, ZoneScores } from "@/lib/scoring/types";

export function buildInsightPrompt(
  result: AssessmentResult & { assignment: { user: Pick<User, "name" | "grade"> } }
): string {
  const dims = result.dimensionScores as DimensionScores;
  const zones = result.zoneScores as ZoneScores;
  const dom = result.dominantZone as Zone;
  const sec = result.secondaryZone as Zone;

  const dimLines = (Object.keys(DIMENSION_LABELS) as Dimension[])
    .map((k) => `  ${DIMENSION_LABELS[k]} (${k}): ${Math.round(dims[k])}`)
    .join("\n");

  const zoneLines = Object.entries(zones)
    .map(([z, s]) => `  ${z}: ${Math.round(s as number)}`)
    .join("\n");

  const domProfile = ZONE_PROFILES[dom];
  const secProfile = ZONE_PROFILES[sec];

  return `You are a senior organisational psychologist generating a Leadership Operating Profile (LOP) report.

PARTICIPANT:
  Name: ${result.assignment.user.name}
  Grade: ${result.assignment.user.grade ?? "Not specified"}
  Assessment Date: ${result.createdAt.toISOString().split("T")[0]}

DIMENSION SCORES (0-100):
${dimLines}

OPERATING ZONE SCORES (0-100):
${zoneLines}
  Primary Zone: ${dom} (${Math.round(zones[dom])})
  Secondary Zone: ${sec} (${Math.round(zones[sec])})

PRIMARY ZONE PROFILE (${dom}):
  ${domProfile.description}
  Typical strengths: ${domProfile.strengths.join(", ")}
  Typical risks: ${domProfile.risks.join(", ")}

SECONDARY ZONE PROFILE (${sec}):
  ${secProfile.description}

COMPOSITE INDICES (0-100):
  Leadership Maturity: ${Math.round(result.leadershipMaturityScore)}
  Delegation Index: ${Math.round(result.delegationIndex)}
  Strategic Thinking Index: ${Math.round(result.strategicThinkingIndex)}
  Execution Index: ${Math.round(result.executionIndex)}
  Burnout Risk Score: ${Math.round(result.burnoutRiskScore)} (higher = greater risk)
  Succession Readiness: ${Math.round(result.successionReadinessScore)}

Generate a professional, evidence-based, actionable Leadership Operating Profile with the following 10 sections.
Each section should be 150-220 words, written in third-person, grounded in the scores above.
Be specific — reference actual dimension scores, zone profiles, and composite indices.

Return ONLY valid JSON with exactly these keys:
{
  "executiveSummary": "...",
  "strengthsAndDevelopmentAreas": "...",
  "leadershipStyleAnalysis": "...",
  "stressResponseAnalysis": "...",
  "decisionMakingProfile": "...",
  "communicationStyle": "...",
  "teamContributionStyle": "...",
  "coachingActionsAndCareerPath": "...",
  "managerDiscussionPoints": "...",
  "developmentPlan": "..."
}`;
}
