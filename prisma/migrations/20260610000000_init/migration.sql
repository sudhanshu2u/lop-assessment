-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "function" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'employee',
    "department_id" TEXT,
    "manager_id" TEXT,
    "grade" TEXT,
    "location" TEXT,
    "tenure_start" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_versions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "assessment_version_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "dimension_label" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_assignments" (
    "id" TEXT NOT NULL,
    "assessment_version_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_sessions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "time_taken_seconds" INTEGER,
    "last_saved_at" TIMESTAMP(3),
    "progress_json" JSONB,

    CONSTRAINT "survey_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_results" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "dimension_scores" JSONB NOT NULL,
    "zone_scores" JSONB NOT NULL,
    "dominant_zone" TEXT NOT NULL,
    "secondary_zone" TEXT NOT NULL,
    "leadership_maturity_score" DOUBLE PRECISION NOT NULL,
    "delegation_index" DOUBLE PRECISION NOT NULL,
    "strategic_thinking_index" DOUBLE PRECISION NOT NULL,
    "execution_index" DOUBLE PRECISION NOT NULL,
    "burnout_risk_score" DOUBLE PRECISION NOT NULL,
    "succession_readiness_score" DOUBLE PRECISION NOT NULL,
    "ai_insights" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_assignment_id_question_id_key" ON "survey_responses"("assignment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_sessions_assignment_id_key" ON "survey_sessions"("assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_results_assignment_id_key" ON "assessment_results"("assignment_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_versions" ADD CONSTRAINT "assessment_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_assessment_version_id_fkey" FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_assignments" ADD CONSTRAINT "survey_assignments_assessment_version_id_fkey" FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_assignments" ADD CONSTRAINT "survey_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_assignments" ADD CONSTRAINT "survey_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_sessions" ADD CONSTRAINT "survey_sessions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "survey_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

