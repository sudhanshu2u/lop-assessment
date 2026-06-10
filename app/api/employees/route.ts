import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PRIVILEGED = ["super_admin", "hr_admin", "manager"];

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!PRIVILEGED.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const where =
    role === "manager"
      ? { managerId: session.user.userId, isActive: true }
      : { isActive: true };

  const employees = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      grade: true,
      location: true,
      departmentId: true,
      department: { select: { name: true } },
      manager: { select: { name: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: employees, ok: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["super_admin", "hr_admin"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, employeeRole, departmentId, managerId, grade, location } =
    await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "name, email, password required" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hash,
      role: employeeRole ?? "employee",
      departmentId,
      managerId,
      grade,
      location,
    },
  });

  return NextResponse.json({ ok: true, id: user.id });
}
