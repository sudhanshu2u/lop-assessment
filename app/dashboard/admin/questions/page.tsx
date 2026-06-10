import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DIMENSION_LABELS } from "@/lib/scoring/types";
import type { Dimension } from "@/lib/scoring/types";

export default async function QuestionsAdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "super_admin") redirect("/dashboard");

  const questions = await prisma.question.findMany({
    orderBy: [{ dimension: "asc" }, { orderIndex: "asc" }],
    include: { assessmentVersion: { select: { version: true } } },
  });

  const byDimension = questions.reduce<Record<string, typeof questions>>(
    (acc, q) => {
      if (!acc[q.dimension]) acc[q.dimension] = [];
      acc[q.dimension].push(q);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <p className="text-gray-500 mt-1">{questions.length} questions across 10 dimensions</p>
      </div>

      {Object.entries(byDimension).map(([dim, qs]) => (
        <div key={dim} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center">
              {dim}
            </span>
            <span className="font-semibold text-gray-900">
              {DIMENSION_LABELS[dim as Dimension]}
            </span>
            <span className="text-xs text-gray-500 ml-auto">{qs.length} questions</span>
          </div>
          <div className="divide-y divide-gray-50">
            {qs.map((q) => (
              <div key={q.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{q.orderIndex}</span>
                  <p className="text-sm text-gray-700">{q.text}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                  q.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {q.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
