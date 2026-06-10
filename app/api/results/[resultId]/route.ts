import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
          user: { select: { id: true, name: true, email: true, grade: true, departmentId: true } },
          assessmentVersion: { select: { title: true, version: true } },
        },
      },
    },
  });

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const userId = session.user.userId;

  // Access control: own results, or manager/admin
  const isOwn = result.assignment.userId === userId;
  const isPrivileged = ["super_admin", "hr_admin", "manager"].includes(role);

  if (!isOwn && !isPrivileged) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: result, ok: true });
}
