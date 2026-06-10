import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AssessmentGatePage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { assignmentId } = await params;

  const assignment = await prisma.surveyAssignment.findUnique({
    where: { id: assignmentId, userId: session.user.userId },
    include: {
      assessmentVersion: { select: { title: true, version: true } },
      result: { select: { id: true } },
      session: { select: { startedAt: true, lastSavedAt: true } },
      _count: { select: { responses: true } },
    },
  });

  if (!assignment) redirect("/dashboard");
  if (assignment.status === "completed" && assignment.result) {
    redirect(`/report/${assignment.result.id}`);
  }

  const totalQuestions = 40;
  const answered = assignment._count.responses;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {assignment.assessmentVersion.title}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Version {assignment.assessmentVersion.version} · {totalQuestions} questions · ~15 minutes
        </p>

        {assignment.status === "in_progress" && answered > 0 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
            <strong>{answered}/{totalQuestions}</strong> questions answered.
            Your progress has been saved — you can continue where you left off.
          </div>
        )}

        <div className="text-left mb-6 space-y-3">
          <div className="flex gap-3">
            <span className="text-indigo-500">✓</span>
            <span className="text-sm text-gray-700">Rate each statement from 1 (Never) to 10 (Always)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-indigo-500">✓</span>
            <span className="text-sm text-gray-700">Your progress is saved automatically every 5 questions</span>
          </div>
          <div className="flex gap-3">
            <span className="text-indigo-500">✓</span>
            <span className="text-sm text-gray-700">Answer honestly — there are no right or wrong responses</span>
          </div>
        </div>

        <Link
          href={`/assessment/${assignmentId}/questions`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {assignment.status === "in_progress" ? "Continue Assessment" : "Begin Assessment"}
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
