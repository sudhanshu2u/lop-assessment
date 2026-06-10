import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["super_admin", "hr_admin"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const versions = await prisma.assessmentVersion.findMany({
    include: {
      _count: { select: { assignments: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: versions, ok: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["super_admin", "hr_admin"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, dueDate, userIds, isAnonymous } = await req.json();
  if (!title || !userIds?.length)
    return NextResponse.json({ error: "title and userIds required" }, { status: 400 });

  const activeVersion = await prisma.assessmentVersion.findFirst({ where: { isActive: true } });
  if (!activeVersion)
    return NextResponse.json({ error: "No active assessment version" }, { status: 400 });

  const assignments = await prisma.surveyAssignment.createMany({
    data: (userIds as string[]).map((userId: string) => ({
      assessmentVersionId: activeVersion.id,
      userId,
      assignedById: session.user.userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      isAnonymous: isAnonymous ?? false,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, created: assignments.count });
}
