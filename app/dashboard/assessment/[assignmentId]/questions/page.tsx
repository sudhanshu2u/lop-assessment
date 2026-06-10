import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuestionStepper from "@/components/assessment/QuestionStepper";

export default async function QuestionsPage({
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
      assessmentVersion: {
        include: { questions: { where: { isActive: true }, orderBy: { orderIndex: "asc" } } },
      },
      responses: true,
    },
  });

  if (!assignment) redirect("/dashboard");
  if (assignment.status === "completed") redirect(`/dashboard/assessment/${assignmentId}`);

  // Ensure session started
  if (assignment.status === "pending") {
    await prisma.surveyAssignment.update({ where: { id: assignmentId }, data: { status: "in_progress" } });
    await prisma.surveySession.upsert({
      where: { assignmentId },
      update: { lastSavedAt: new Date() },
      create: { assignmentId },
    });
  }

  const savedAnswers: Record<string, number> = {};
  for (const r of assignment.responses) {
    savedAnswers[r.questionId] = r.score;
  }

  return (
    <QuestionStepper
      assignmentId={assignmentId}
      questions={assignment.assessmentVersion.questions}
      savedAnswers={savedAnswers}
    />
  );
}
