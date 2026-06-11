import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { QUESTIONS } from "@/lib/scoring/dimensions";

export async function POST(req: Request) {
  const key = req.headers.get("x-setup-key");
  if (!key || key !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  async function exec(sql: string) {
    try { await prisma.$executeRawUnsafe(sql); } catch { /* already exists */ }
  }

  try {
    // Enums (ignore "already exists")
    await exec(`CREATE TYPE "UserRole" AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee')`);
    await exec(`CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'in_progress', 'completed')`);

    // Tables
    await exec(`CREATE TABLE IF NOT EXISTS "departments" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "function" TEXT, "location" TEXT, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "departments_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "password_hash" TEXT NOT NULL, "name" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'employee', "department_id" TEXT, "manager_id" TEXT, "grade" TEXT, "location" TEXT, "tenure_start" TIMESTAMPTZ, "is_active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "users_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`);
    await exec(`CREATE TABLE IF NOT EXISTS "assessment_versions" ("id" TEXT NOT NULL, "title" TEXT NOT NULL, "version" TEXT NOT NULL, "is_active" BOOLEAN NOT NULL DEFAULT false, "created_by" TEXT NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "assessment_versions_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE TABLE IF NOT EXISTS "questions" ("id" TEXT NOT NULL, "assessment_version_id" TEXT NOT NULL, "text" TEXT NOT NULL, "dimension" TEXT NOT NULL, "dimension_label" TEXT NOT NULL, "order_index" INTEGER NOT NULL, "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0, "is_active" BOOLEAN NOT NULL DEFAULT true, CONSTRAINT "questions_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE TABLE IF NOT EXISTS "survey_assignments" ("id" TEXT NOT NULL, "assessment_version_id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "assigned_by" TEXT NOT NULL, "due_date" TIMESTAMPTZ, "is_anonymous" BOOLEAN NOT NULL DEFAULT false, "status" "AssignmentStatus" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "survey_assignments_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE TABLE IF NOT EXISTS "survey_responses" ("id" TEXT NOT NULL, "assignment_id" TEXT NOT NULL, "question_id" TEXT NOT NULL, "score" INTEGER NOT NULL, "answered_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "survey_responses_uq" ON "survey_responses"("assignment_id", "question_id")`);
    await exec(`CREATE TABLE IF NOT EXISTS "survey_sessions" ("id" TEXT NOT NULL, "assignment_id" TEXT NOT NULL, "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "completed_at" TIMESTAMPTZ, "time_taken_seconds" INTEGER, "last_saved_at" TIMESTAMPTZ, "progress_json" JSONB, CONSTRAINT "survey_sessions_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "survey_sessions_assignment_id_key" ON "survey_sessions"("assignment_id")`);
    await exec(`CREATE TABLE IF NOT EXISTS "assessment_results" ("id" TEXT NOT NULL, "assignment_id" TEXT NOT NULL, "dimension_scores" JSONB NOT NULL, "zone_scores" JSONB NOT NULL, "dominant_zone" TEXT NOT NULL, "secondary_zone" TEXT NOT NULL, "leadership_maturity_score" DOUBLE PRECISION NOT NULL, "delegation_index" DOUBLE PRECISION NOT NULL, "strategic_thinking_index" DOUBLE PRECISION NOT NULL, "execution_index" DOUBLE PRECISION NOT NULL, "burnout_risk_score" DOUBLE PRECISION NOT NULL, "succession_readiness_score" DOUBLE PRECISION NOT NULL, "ai_insights" JSONB, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "assessment_results_assignment_id_key" ON "assessment_results"("assignment_id")`);
    await exec(`CREATE TABLE IF NOT EXISTS "audit_logs" ("id" TEXT NOT NULL, "user_id" TEXT, "action" TEXT NOT NULL, "resource_type" TEXT NOT NULL, "resource_id" TEXT, "metadata" JSONB, "ip_address" TEXT, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"))`);

    // Foreign keys
    await exec(`ALTER TABLE "users" ADD CONSTRAINT "users_dept_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "users" ADD CONSTRAINT "users_mgr_fk" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "assessment_versions" ADD CONSTRAINT "av_user_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "questions" ADD CONSTRAINT "q_av_fk" FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "survey_assignments" ADD CONSTRAINT "sa_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "survey_assignments" ADD CONSTRAINT "sa_av_fk" FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "survey_assignments" ADD CONSTRAINT "sa_by_fk" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "survey_responses" ADD CONSTRAINT "sr_sa_fk" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "survey_responses" ADD CONSTRAINT "sr_q_fk" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "survey_sessions" ADD CONSTRAINT "ss_sa_fk" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "assessment_results" ADD CONSTRAINT "ar_sa_fk" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await exec(`ALTER TABLE "audit_logs" ADD CONSTRAINT "al_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);

    results.push("✓ Schema ready");

    // Seed departments
    const depts = await Promise.all(
      DEPARTMENTS.map((d) => prisma.department.upsert({ where: { id: d.id }, update: { name: d.name }, create: { id: d.id, name: d.name } }))
    );
    results.push(`✓ ${depts.length} departments`);

    const [h1, h2, h3, h4] = await Promise.all([
      bcrypt.hash("Admin@2024!", 10),
      bcrypt.hash("HRAdmin@2024!", 10),
      bcrypt.hash("Manager@2024!", 10),
      bcrypt.hash("Employee@2024!", 10),
    ]);

    const admin = await prisma.user.upsert({ where: { email: "admin@lop.internal" }, update: {}, create: { email: "admin@lop.internal", passwordHash: h1, name: "System Administrator", role: "super_admin", departmentId: depts[2].id } });
    await prisma.user.upsert({ where: { email: "hr@lop.internal" }, update: {}, create: { email: "hr@lop.internal", passwordHash: h2, name: "HR Administrator", role: "hr_admin", departmentId: depts[2].id } });
    const manager = await prisma.user.upsert({ where: { email: "manager@lop.internal" }, update: {}, create: { email: "manager@lop.internal", passwordHash: h3, name: "Tech Manager", role: "manager", departmentId: depts[0].id, grade: "L5" } });
    await Promise.all([
      prisma.user.upsert({ where: { email: "alice@lop.internal" }, update: {}, create: { email: "alice@lop.internal", passwordHash: h4, name: "Alice Sharma", role: "employee", departmentId: depts[0].id, managerId: manager.id, grade: "L3" } }),
      prisma.user.upsert({ where: { email: "bob@lop.internal" }, update: {}, create: { email: "bob@lop.internal", passwordHash: h4, name: "Bob Mehta", role: "employee", departmentId: depts[0].id, managerId: manager.id, grade: "L4" } }),
    ]);
    results.push("✓ 5 users seeded");

    const version = await prisma.assessmentVersion.upsert({ where: { id: "version-1-0" }, update: {}, create: { id: "version-1-0", title: "Leadership Operating Profile Assessment", version: "1.0", isActive: true, createdById: admin.id } });
    for (const q of QUESTIONS) {
      await prisma.question.upsert({ where: { id: `${version.id}-${q.id}` }, update: { text: q.text }, create: { id: `${version.id}-${q.id}`, assessmentVersionId: version.id, text: q.text, dimension: q.dimension, dimensionLabel: q.dimensionLabel, orderIndex: q.orderIndex, weight: 1.0 } });
    }
    results.push(`✓ ${QUESTIONS.length} questions`);

    return NextResponse.json({ ok: true, results, login: "admin@lop.internal / Admin@2024!" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, results }, { status: 500 });
  }
}

const DEPARTMENTS = [
  { id: "dept-sales", name: "Sales" },
  { id: "dept-legal", name: "Legal" },
  { id: "dept-marketing", name: "Marketing" },
  { id: "dept-crm", name: "CRM" },
  { id: "dept-hr", name: "HR" },
  { id: "dept-transformation", name: "Transformation Office" },
  { id: "dept-construction", name: "Construction" },
  { id: "dept-accounts", name: "Accounts & Finance" },
  { id: "dept-other", name: "Other" },
];

export async function PATCH(req: Request) {
  const key = req.headers.get("x-setup-key");
  if (!key || key !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  for (const d of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: { name: d.name },
      create: { id: d.id, name: d.name },
    });
  }
  return NextResponse.json({ ok: true, departments: DEPARTMENTS.map((d) => d.name) });
}
