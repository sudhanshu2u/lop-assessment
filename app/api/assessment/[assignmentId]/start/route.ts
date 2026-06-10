import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = await params;

  const assignment = await prisma.surveyAssignment.findUnique({
    where: { id: assignmentId, userId: session.user.userId },
  });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (assignment.status === "completed")
    return NextResponse.json({ error: "Already completed" }, { status: 409 });

  await prisma.$transaction([
    prisma.surveyAssignment.update({
      where: { id: assignmentId },
      data: { status: "in_progress" },
    }),
    prisma.surveySession.upsert({
      where: { assignmentId },
      update: { lastSavedAt: new Date() },
      create: { assignmentId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
