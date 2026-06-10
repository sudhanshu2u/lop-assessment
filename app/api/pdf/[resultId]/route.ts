import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ReactElement } from "react";
import LOPReportDocument from "@/components/pdf/LOPReportDocument";
import type { Zone, DimensionScores, ZoneScores, CompositeIndices } from "@/lib/scoring/types";
import type { DocumentProps } from "@react-pdf/renderer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resultId } = await params;

  const result = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      assignment: {
        include: {
          user: { select: { name: true, email: true, grade: true, department: { select: { name: true } } } },
          assessmentVersion: { select: { title: true, version: true } },
        },
      },
    },
  });

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { userId, role } = session.user;
  const isOwn = result.assignment.userId === userId;
  const isPrivileged = ["super_admin", "hr_admin", "manager"].includes(role);
  if (!isOwn && !isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const props = {
    name: result.assignment.user.name,
    grade: result.assignment.user.grade ?? "—",
    department: result.assignment.user.department?.name ?? "—",
    assessmentTitle: result.assignment.assessmentVersion.title,
    assessmentVersion: result.assignment.assessmentVersion.version,
    completedAt: result.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    dominantZone: result.dominantZone as Zone,
    secondaryZone: result.secondaryZone as Zone,
    dimensionScores: result.dimensionScores as DimensionScores,
    zoneScores: result.zoneScores as ZoneScores,
    compositeIndices: {
      leadershipMaturityScore: result.leadershipMaturityScore,
      delegationIndex: result.delegationIndex,
      strategicThinkingIndex: result.strategicThinkingIndex,
      executionIndex: result.executionIndex,
      burnoutRiskScore: result.burnoutRiskScore,
      successionReadinessScore: result.successionReadinessScore,
    } as CompositeIndices,
    aiInsights: result.aiInsights as Record<string, string> | null,
  };

  const element = createElement(LOPReportDocument, props) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="lop-report-${result.assignment.user.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
