import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { QUESTIONS } from "@/lib/scoring/dimensions";

// One-time setup endpoint — protected by a secret key
// Call: POST /api/setup with header X-Setup-Key: <SETUP_SECRET>
export async function POST(req: Request) {
  const key = req.headers.get("x-setup-key");
  if (!key || key !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Departments
    const depts = await Promise.all([
      prisma.department.upsert({
        where: { id: "dept-technology" },
        update: {},
        create: { id: "dept-technology", name: "Technology", function: "Engineering", location: "Mumbai" },
      }),
      prisma.department.upsert({
        where: { id: "dept-sales" },
        update: {},
        create: { id: "dept-sales", name: "Sales", function: "Revenue", location: "Delhi" },
      }),
      prisma.department.upsert({
        where: { id: "dept-hr" },
        update: {},
        create: { id: "dept-hr", name: "Human Resources", function: "People", location: "Bangalore" },
      }),
    ]);
    results.push(`✓ ${depts.length} departments`);

    // Users
    const adminHash = await bcrypt.hash("Admin@2024!", 12);
    const admin = await prisma.user.upsert({
      where: { email: "admin@lop.internal" },
      update: {},
      create: { email: "admin@lop.internal", passwordHash: adminHash, name: "System Administrator", role: "super_admin", departmentId: depts[2].id },
    });

    const hrHash = await bcrypt.hash("HRAdmin@2024!", 12);
    await prisma.user.upsert({
      where: { email: "hr@lop.internal" },
      update: {},
      create: { email: "hr@lop.internal", passwordHash: hrHash, name: "HR Administrator", role: "hr_admin", departmentId: depts[2].id },
    });

    const mgrHash = await bcrypt.hash("Manager@2024!", 12);
    const manager = await prisma.user.upsert({
      where: { email: "manager@lop.internal" },
      update: {},
      create: { email: "manager@lop.internal", passwordHash: mgrHash, name: "Tech Manager", role: "manager", departmentId: depts[0].id, grade: "L5" },
    });

    const empHash = await bcrypt.hash("Employee@2024!", 12);
    await Promise.all([
      prisma.user.upsert({ where: { email: "alice@lop.internal" }, update: {}, create: { email: "alice@lop.internal", passwordHash: empHash, name: "Alice Sharma", role: "employee", departmentId: depts[0].id, managerId: manager.id, grade: "L3" } }),
      prisma.user.upsert({ where: { email: "bob@lop.internal" }, update: {}, create: { email: "bob@lop.internal", passwordHash: empHash, name: "Bob Mehta", role: "employee", departmentId: depts[0].id, managerId: manager.id, grade: "L4" } }),
    ]);
    results.push("✓ 5 users (admin, hr, manager, 2 employees)");

    // Assessment version
    const version = await prisma.assessmentVersion.upsert({
      where: { id: "version-1-0" },
      update: {},
      create: { id: "version-1-0", title: "Leadership Operating Profile Assessment", version: "1.0", isActive: true, createdById: admin.id },
    });

    // 40 questions
    for (const q of QUESTIONS) {
      await prisma.question.upsert({
        where: { id: `${version.id}-${q.id}` },
        update: { text: q.text },
        create: { id: `${version.id}-${q.id}`, assessmentVersionId: version.id, text: q.text, dimension: q.dimension, dimensionLabel: q.dimensionLabel, orderIndex: q.orderIndex, weight: 1.0 },
      });
    }
    results.push(`✓ ${QUESTIONS.length} questions`);

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, results }, { status: 500 });
  }
}
