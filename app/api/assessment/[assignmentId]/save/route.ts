import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SavePayload {
  answers: Record<string, number>; // questionId → score (1-10)
  progress: { currentIndex: number; answeredCount: number };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = await params;
  const body: SavePayload = await req.json();

  const assignment = await prisma.surveyAssignment.findUnique({
    where: { id: assignmentId, userId: session.user.userId },
  });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (assignment.status === "completed")
    return NextResponse.json({ error: "Already completed" }, { status: 409 });

  // Upsert responses
  await Promise.all(
    Object.entries(body.answers).map(([questionId, score]) =>
      prisma.surveyResponse.upsert({
        where: { assignmentId_questionId: { assignmentId, questionId } },
        update: { score, answeredAt: new Date() },
        create: { assignmentId, questionId, score },
      })
    )
  );

  // Update session progress
  await prisma.surveySession.update({
    where: { assignmentId },
    data: {
      lastSavedAt: new Date(),
      progressJson: body.progress as object,
    },
  });

  return NextResponse.json({ ok: true, saved: Object.keys(body.answers).length });
}
