import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import type { Zone } from "@/lib/scoring/types";

export default async function MyAssessmentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { userId } = session.user;

  const assignments = await prisma.surveyAssignment.findMany({
    where: { userId },
    include: {
      assessmentVersion: { select: { title: true, version: true } },
      result: { select: { id: true, dominantZone: true, leadershipMaturityScore: true, createdAt: true } },
      session: { select: { completedAt: true, lastSavedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = assignments.filter((a) => a.status !== "completed");
  const completed = assignments.filter((a) => a.status === "completed");

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
        <p className="text-gray-500 mt-1">{assignments.length} total · {completed.length} completed</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pending</h2>
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-amber-200 p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{a.assessmentVersion.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    v{a.assessmentVersion.version}
                    {a.status === "in_progress" && a.session?.lastSavedAt
                      ? ` · Last saved ${new Date(a.session.lastSavedAt).toLocaleDateString("en-GB")}`
                      : " · Not started"}
                  </div>
                </div>
                <Link
                  href={`/dashboard/assessment/${a.id}`}
                  className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {a.status === "in_progress" ? "Continue →" : "Start →"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((a) => {
              const zone = a.result?.dominantZone as Zone | undefined;
              const profile = zone ? ZONE_PROFILES[zone] : null;
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{a.assessmentVersion.title}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {zone && profile && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile.color} ${profile.textColor}`}>
                          {profile.emoji} {zone.replace("CrisisMaker", "Crisis Maker")}
                        </span>
                      )}
                      {a.result?.leadershipMaturityScore != null && (
                        <span className="text-xs text-gray-500">
                          Maturity score: <strong>{Math.round(a.result.leadershipMaturityScore)}</strong>/100
                        </span>
                      )}
                      {a.result?.createdAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(a.result.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  {a.result && (
                    <Link
                      href={`/dashboard/report/${a.result.id}`}
                      className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Report
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <div className="text-gray-900 font-semibold text-lg">No assessments assigned yet</div>
          <div className="text-gray-500 text-sm mt-2">Your HR team will assign an assessment when ready.</div>
        </div>
      )}
    </div>
  );
}
