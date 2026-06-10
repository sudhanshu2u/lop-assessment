import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeScores } from "@/lib/scoring/engine";
import type { RawResponse } from "@/lib/scoring/types";
import { appendAuditLog } from "@/lib/audit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = await params;

  const assignment = await prisma.surveyAssignment.findUnique({
    where: { id: assignmentId, userId: session.user.userId },
    include: { assessmentVersion: { include: { questions: { where: { isActive: true } } } } },
  });

  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (assignment.status === "completed")
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const responses = await prisma.surveyResponse.findMany({ where: { assignmentId } });
  const totalQuestions = assignment.assessmentVersion.questions.length;

  if (responses.length < totalQuestions) {
    return NextResponse.json(
      { error: `Incomplete: ${responses.length}/${totalQuestions} answered` },
      { status: 400 }
    );
  }

  // Build raw responses with dimension info
  const questionMap = new Map(
    assignment.assessmentVersion.questions.map((q) => [q.id, q])
  );
  const rawResponses: RawResponse[] = responses.map((r) => ({
    questionId: r.questionId,
    dimension: (questionMap.get(r.questionId)?.dimension ?? "A") as RawResponse["dimension"],
    score: r.score,
  }));

  const result = computeScores(rawResponses);

  const now = new Date();
  const session2 = await prisma.surveySession.findUnique({ where: { assignmentId } });
  const timeTaken = session2
    ? Math.floor((now.getTime() - session2.startedAt.getTime()) / 1000)
    : null;

  const [savedResult] = await prisma.$transaction([
    prisma.assessmentResult.create({
      data: {
        assignmentId,
        dimensionScores: result.dimensionScores as object,
        zoneScores: result.zoneScores as object,
        dominantZone: result.dominantZone,
        secondaryZone: result.secondaryZone,
        leadershipMaturityScore: result.compositeIndices.leadershipMaturityScore,
        delegationIndex: result.compositeIndices.delegationIndex,
        strategicThinkingIndex: result.compositeIndices.strategicThinkingIndex,
        executionIndex: result.compositeIndices.executionIndex,
        burnoutRiskScore: result.compositeIndices.burnoutRiskScore,
        successionReadinessScore: result.compositeIndices.successionReadinessScore,
      },
    }),
    prisma.surveyAssignment.update({
      where: { id: assignmentId },
      data: { status: "completed" },
    }),
    prisma.surveySession.update({
      where: { assignmentId },
      data: { completedAt: now, timeTakenSeconds: timeTaken },
    }),
  ]);

  // Fire-and-forget AI insights
  fetch(`${process.env.NEXTAUTH_URL}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resultId: savedResult.id }),
  }).catch(() => {});

  // Fire-and-forget audit
  appendAuditLog(
    session.user.userId,
    "SUBMIT_ASSESSMENT",
    "survey_assignment",
    assignmentId,
    { resultId: savedResult.id, dominantZone: result.dominantZone }
  );

  return NextResponse.json({ ok: true, resultId: savedResult.id });
}
