import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { QUESTIONS } from "@/lib/scoring/dimensions";

// One-time setup endpoint — creates tables + seeds data
// POST /api/setup  with header  X-Setup-Key: lop-setup-2024-raghav
export async function POST(req: Request) {
  const key = req.headers.get("x-setup-key");
  if (!key || key !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // ── Step 1: Create enums + tables via raw SQL ──────────────────────
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "UserRole" AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "AssignmentStatus" AS ENUM ('pending', 'in_progress', 'completed')`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" TEXT NOT NULL, "name" TEXT NOT NULL, "function" TEXT,
        "location" TEXT, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL, "email" TEXT NOT NULL, "password_hash" TEXT NOT NULL,
        "name" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'employee',
        "department_id" TEXT, "manager_id" TEXT, "grade" TEXT, "location" TEXT,
        "tenure_start" TIMESTAMPTZ, "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "assessment_versions" (
        "id" TEXT NOT NULL, "title" TEXT NOT NULL, "version" TEXT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT false, "created_by" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "assessment_versions_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "questions" (
        "id" TEXT NOT NULL, "assessment_version_id" TEXT NOT NULL, "text" TEXT NOT NULL,
        "dimension" TEXT NOT NULL, "dimension_label" TEXT NOT NULL, "order_index" INTEGER NOT NULL,
        "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0, "is_active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "survey_assignments" (
        "id" TEXT NOT NULL, "assessment_version_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL, "assigned_by" TEXT NOT NULL,
        "due_date" TIMESTAMPTZ, "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
        "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "survey_assignments_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "survey_responses" (
        "id" TEXT NOT NULL, "assignment_id" TEXT NOT NULL, "question_id" TEXT NOT NULL,
        "score" INTEGER NOT NULL, "answered_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "survey_responses_assignment_id_question_id_key" ON "survey_responses"("assignment_id", "question_id")`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "survey_sessions" (
        "id" TEXT NOT NULL, "assignment_id" TEXT NOT NULL,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "completed_at" TIMESTAMPTZ,
        "time_taken_seconds" INTEGER, "last_saved_at" TIMESTAMPTZ, "progress_json" JSONB,
        CONSTRAINT "survey_sessions_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "survey_sessions_assignment_id_key" ON "survey_sessions"("assignment_id")`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "assessment_results" (
        "id" TEXT NOT NULL, "assignment_id" TEXT NOT NULL,
        "dimension_scores" JSONB NOT NULL, "zone_scores" JSONB NOT NULL,
        "dominant_zone" TEXT NOT NULL, "secondary_zone" TEXT NOT NULL,
        "leadership_maturity_score" DOUBLE PRECISION NOT NULL,
        "delegation_index" DOUBLE PRECISION NOT NULL,
        "strategic_thinking_index" DOUBLE PRECISION NOT NULL,
        "execution_index" DOUBLE PRECISION NOT NULL,
        "burnout_risk_score" DOUBLE PRECISION NOT NULL,
        "succession_readiness_score" DOUBLE PRECISION NOT NULL,
        "ai_insights" JSONB, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
      )`);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "assessment_results_assignment_id_key" ON "assessment_results"("assignment_id")`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" TEXT NOT NULL, "user_id" TEXT, "action" TEXT NOT NULL,
        "resource_type" TEXT NOT NULL, "resource_id" TEXT, "metadata" JSONB,
        "ip_address" TEXT, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
      )`);

    // Foreign keys (wrapped individually so IF NOT EXISTS logic works)
    const fks = [
      `ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
      `ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
      `ALTER TABLE "assessment_versions" ADD CONSTRAINT "assessment_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "questions" ADD CONSTRAINT "questions_assessment_version_id_fkey" FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "survey_assignments" ADD CONSTRAINT "survey_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "survey_assignments" ADD CONSTRAINT "survey_assignments_assessment_version_id_fkey" FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "survey_assignments" ADD CONSTRAINT "survey_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "survey_sessions" ADD CONSTRAINT "survey_sessions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    ];
    for (const fk of fks) {
      try { await prisma.$executeRawUnsafe(fk); } catch { /* already exists */ }
    }

    results.push("✓ Schema created");

    // ── Step 2: Seed data ──────────────────────────────────────────────
    const depts = await Promise.all([
      prisma.department.upsert({ where: { id: "dept-technology" }, update: {}, create: { id: "dept-technology", name: "Technology", function: "Engineering", location: "Mumbai" } }),
      prisma.department.upsert({ where: { id: "dept-sales" }, update: {}, create: { id: "dept-sales", name: "Sales", function: "Revenue", location: "Delhi" } }),
      prisma.department.upsert({ where: { id: "dept-hr" }, update: {}, create: { id: "dept-hr", name: "Human Resources", function: "People", location: "Bangalore" } }),
    ]);
    results.push(`✓ ${depts.length} departments`);

    const adminHash = await bcrypt.hash("Admin@2024!", 12);
    const admin = await prisma.user.upsert({ where: { email: "admin@lop.internal" }, update: {}, create: { email: "admin@lop.internal", passwordHash: adminHash, name: "System Administrator", role: "super_admin", departmentId: depts[2].id } });

    const hrHash = await bcrypt.hash("HRAdmin@2024!", 12);
    await prisma.user.upsert({ where: { email: "hr@lop.internal" }, update: {}, create: { email: "hr@lop.internal", passwordHash: hrHash, name: "HR Administrator", role: "hr_admin", departmentId: depts[2].id } });

    const mgrHash = await bcrypt.hash("Manager@2024!", 12);
    const manager = await prisma.user.upsert({ where: { email: "manager@lop.internal" }, update: {}, create: { email: "manager@lop.internal", passwordHash: mgrHash, name: "Tech Manager", role: "manager", departmentId: depts[0].id, grade: "L5" } });

    const empHash = await bcrypt.hash("Employee@2024!", 12);
    await Promise.all([
      prisma.user.upsert({ where: { email: "alice@lop.internal" }, update: {}, create: { email: "alice@lop.internal", passwordHash: empHash, name: "Alice Sharma", role: "employee", departmentId: depts[0].id, managerId: manager.id, grade: "L3" } }),
      prisma.user.upsert({ where: { email: "bob@lop.internal" }, update: {}, create: { email: "bob@lop.internal", passwordHash: empHash, name: "Bob Mehta", role: "employee", departmentId: depts[0].id, managerId: manager.id, grade: "L4" } }),
    ]);
    results.push("✓ 5 users seeded");

    const version = await prisma.assessmentVersion.upsert({ where: { id: "version-1-0" }, update: {}, create: { id: "version-1-0", title: "Leadership Operating Profile Assessment", version: "1.0", isActive: true, createdById: admin.id } });

    for (const q of QUESTIONS) {
      await prisma.question.upsert({ where: { id: `${version.id}-${q.id}` }, update: { text: q.text }, create: { id: `${version.id}-${q.id}`, assessmentVersionId: version.id, text: q.text, dimension: q.dimension, dimensionLabel: q.dimensionLabel, orderIndex: q.orderIndex, weight: 1.0 } });
    }
    results.push(`✓ ${QUESTIONS.length} questions seeded`);

    return NextResponse.json({ ok: true, results, message: "Setup complete! Login: admin@lop.internal / Admin@2024!" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, results }, { status: 500 });
  }
}
