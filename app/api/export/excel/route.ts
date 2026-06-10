import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { DIMENSIONS, DIMENSION_LABELS } from "@/lib/scoring/types";
import type { DimensionScores, CompositeIndices } from "@/lib/scoring/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["super_admin", "hr_admin"].includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const results = await prisma.assessmentResult.findMany({
    include: {
      assignment: {
        include: {
          user: { select: { name: true, email: true, grade: true, department: { select: { name: true } } } },
          assessmentVersion: { select: { version: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewRows = results.map((r) => ({
    Name: r.assignment.user.name,
    Email: r.assignment.user.email,
    Grade: r.assignment.user.grade ?? "",
    Department: r.assignment.user.department?.name ?? "",
    "Assessment Version": r.assignment.assessmentVersion.version,
    "Dominant Zone": r.dominantZone,
    "Secondary Zone": r.secondaryZone,
    "Leadership Maturity": Math.round(r.leadershipMaturityScore),
    "Delegation Index": Math.round(r.delegationIndex),
    "Strategic Thinking Index": Math.round(r.strategicThinkingIndex),
    "Execution Index": Math.round(r.executionIndex),
    "Burnout Risk": Math.round(r.burnoutRiskScore),
    "Succession Readiness": Math.round(r.successionReadinessScore),
    "Completed At": r.createdAt.toISOString().split("T")[0],
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewRows), "Overview");

  // Sheet 2: Dimension Scores
  const dimHeaders = DIMENSIONS.map((d) => DIMENSION_LABELS[d]);
  const dimRows = results.map((r) => {
    const dims = r.dimensionScores as DimensionScores;
    const row: Record<string, string | number> = {
      Name: r.assignment.user.name,
      Email: r.assignment.user.email,
    };
    for (const d of DIMENSIONS) {
      row[DIMENSION_LABELS[d]] = Math.round(dims[d]);
    }
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dimRows), "Dimension Scores");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="lop-report-${Date.now()}.xlsx"`,
    },
  });
}
