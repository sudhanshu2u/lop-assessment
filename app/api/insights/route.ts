import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWithGemini } from "@/lib/ai/gemini";
import { buildInsightPrompt } from "@/lib/ai/insight-prompts";

export async function POST(req: NextRequest) {
  const { resultId } = await req.json();
  if (!resultId) return NextResponse.json({ error: "resultId required" }, { status: 400 });

  const result = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: { assignment: { include: { user: { select: { name: true, grade: true } } } } },
  });
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (result.aiInsights) return NextResponse.json({ ok: true, cached: true });

  try {
    const prompt = buildInsightPrompt(result as Parameters<typeof buildInsightPrompt>[0]);
    const insights = await generateWithGemini<Record<string, string>>(prompt, {
      type: "object",
      properties: {
        executiveSummary: { type: "string" },
        strengthsAndDevelopmentAreas: { type: "string" },
        leadershipStyleAnalysis: { type: "string" },
        stressResponseAnalysis: { type: "string" },
        decisionMakingProfile: { type: "string" },
        communicationStyle: { type: "string" },
        teamContributionStyle: { type: "string" },
        coachingActionsAndCareerPath: { type: "string" },
        managerDiscussionPoints: { type: "string" },
        developmentPlan: { type: "string" },
      },
      required: [
        "executiveSummary",
        "strengthsAndDevelopmentAreas",
        "leadershipStyleAnalysis",
        "stressResponseAnalysis",
        "decisionMakingProfile",
        "communicationStyle",
        "teamContributionStyle",
        "coachingActionsAndCareerPath",
        "managerDiscussionPoints",
        "developmentPlan",
      ],
    });

    await prisma.assessmentResult.update({
      where: { id: resultId },
      data: { aiInsights: insights as object },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Insight generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
