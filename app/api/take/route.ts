import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function GET() {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ departments });
}

export async function POST(req: Request) {
  const { name, email, departmentId, grade } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Generate a fresh temp password every time (auto-signin only — user never types this)
  const tempPassword = randomUUID();
  const hash = await bcrypt.hash(tempPassword, 10);

  // Upsert user — updates name/password so re-registrants can always sign in
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash: hash, name: name.trim(), ...(departmentId ? { departmentId } : {}), ...(grade ? { grade } : {}) },
    create: {
      email: normalizedEmail,
      passwordHash: hash,
      name: name.trim(),
      role: "employee",
      ...(departmentId ? { departmentId } : {}),
      ...(grade ? { grade } : {}),
    },
  });

  // Find active assessment version
  const version = await prisma.assessmentVersion.findFirst({ where: { isActive: true } });
  if (!version) {
    return NextResponse.json({ error: "No active assessment found. Contact your HR admin." }, { status: 404 });
  }

  // Check for existing assignment
  const existing = await prisma.surveyAssignment.findFirst({
    where: { userId: user.id },
    include: { result: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Already completed → send to their report
  if (existing?.status === "completed" && existing.result) {
    return NextResponse.json({
      ok: true,
      email: normalizedEmail,
      password: tempPassword,
      completed: true,
      resultId: existing.result.id,
    });
  }

  // In progress → resume
  if (existing && existing.status !== "completed") {
    return NextResponse.json({ ok: true, email: normalizedEmail, password: tempPassword, assignmentId: existing.id });
  }

  // New assignment
  const assignment = await prisma.surveyAssignment.create({
    data: {
      assessmentVersionId: version.id,
      userId: user.id,
      assignedById: user.id,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, email: normalizedEmail, password: tempPassword, assignmentId: assignment.id });
}
