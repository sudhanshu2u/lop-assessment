import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DIMENSIONS } from "@/lib/scoring/types";
import type { DimensionScores } from "@/lib/scoring/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["super_admin", "hr_admin", "manager"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const results = await prisma.assessmentResult.findMany({
    include: {
      assignment: {
        include: {
          user: {
            select: { departmentId: true, department: { select: { name: true } } },
          },
        },
      },
    },
  });

  // Group by department
  const byDept: Record<string, { name: string; scores: DimensionScores[]; zones: string[] }> = {};

  for (const r of results) {
    const deptId = r.assignment.user.departmentId ?? "unknown";
    const deptName = r.assignment.user.department?.name ?? "Unknown";
    if (!byDept[deptId]) byDept[deptId] = { name: deptName, scores: [], zones: [] };
    byDept[deptId].scores.push(r.dimensionScores as DimensionScores);
    byDept[deptId].zones.push(r.dominantZone);
  }

  const data = Object.entries(byDept).map(([deptId, { name, scores, zones }]) => {
    const avgDims: Partial<DimensionScores> = {};
    for (const dim of DIMENSIONS) {
      const vals = scores.map((s) => s[dim] ?? 0);
      avgDims[dim] = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    }

    const zoneCounts: Record<string, number> = {};
    for (const z of zones) {
      zoneCounts[z] = (zoneCounts[z] ?? 0) + 1;
    }

    return { deptId, name, avgDims, zoneCounts, count: scores.length };
  });

  return NextResponse.json({ data, ok: true });
}
