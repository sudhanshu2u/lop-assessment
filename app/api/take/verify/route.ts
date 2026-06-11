import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(req: Request) {
  const { token, otp } = await req.json();

  if (!token || !otp) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify + decode JWT
  let payload: { email: string; name: string; departmentId?: string; grade?: string; otp: string };
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload as typeof payload;
  } catch {
    return NextResponse.json({ error: "Code expired. Please go back and request a new one." }, { status: 400 });
  }

  // Check OTP matches
  if (otp.trim() !== payload.otp) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  const { email, name, departmentId, grade } = payload;

  // Create/update user with a fresh temp password
  const tempPassword = randomUUID();
  const hash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, name, ...(departmentId ? { departmentId } : {}), ...(grade ? { grade } : {}) },
    create: {
      email,
      passwordHash: hash,
      name,
      role: "employee",
      ...(departmentId ? { departmentId } : {}),
      ...(grade ? { grade } : {}),
    },
  });

  // Find active version
  const version = await prisma.assessmentVersion.findFirst({ where: { isActive: true } });
  if (!version) {
    return NextResponse.json({ error: "No active assessment. Contact your HR admin." }, { status: 404 });
  }

  // Check existing assignment
  const existing = await prisma.surveyAssignment.findFirst({
    where: { userId: user.id },
    include: { result: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (existing?.status === "completed" && existing.result) {
    return NextResponse.json({ ok: true, email, password: tempPassword, completed: true, resultId: existing.result.id });
  }

  if (existing && existing.status !== "completed") {
    return NextResponse.json({ ok: true, email, password: tempPassword, assignmentId: existing.id });
  }

  const assignment = await prisma.surveyAssignment.create({
    data: { assessmentVersionId: version.id, userId: user.id, assignedById: user.id, status: "pending" },
  });

  return NextResponse.json({ ok: true, email, password: tempPassword, assignmentId: assignment.id });
}
