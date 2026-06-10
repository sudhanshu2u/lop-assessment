import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignments = await prisma.surveyAssignment.findMany({
    where: { userId: session.user.userId },
    include: {
      assessmentVersion: { select: { title: true, version: true } },
      result: { select: { id: true, dominantZone: true, createdAt: true } },
      session: { select: { startedAt: true, completedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: assignments, ok: true });
}
