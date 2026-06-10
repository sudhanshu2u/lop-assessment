import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DimensionScores } from "@/lib/scoring/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const ALLOWED = ["super_admin", "hr_admin", "manager"];
  if (!ALLOWED.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const where =
    role === "manager"
      ? { user: { managerId: session.user.userId } }
      : {};

  const results = await prisma.assessmentResult.findMany({
    where: { assignment: where },
    include: {
      assignment: {
        include: { user: { select: { id: true, name: true, grade: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Deduplicate — keep most recent per user
  const seen = new Set<string>();
  const unique = results.filter((r) => {
    const uid = r.assignment.userId;
    if (seen.has(uid)) return false;
    seen.add(uid);
    return true;
  });

  const data = unique.map((r) => ({
    userId: r.assignment.userId,
    name: r.assignment.user.name,
    grade: r.assignment.user.grade,
    dimensionScores: r.dimensionScores as DimensionScores,
    dominantZone: r.dominantZone,
    burnoutRiskScore: r.burnoutRiskScore,
  }));

  return NextResponse.json({ data, ok: true });
}
