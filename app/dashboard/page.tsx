import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import type { Zone } from "@/lib/scoring/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const { userId, role, name } = session.user;

  // Employee: show pending assignments
  if (role === "employee") {
    const assignments = await prisma.surveyAssignment.findMany({
      where: { userId },
      include: {
        assessmentVersion: { select: { title: true, version: true } },
        result: { select: { id: true, dominantZone: true } },
        session: { select: { completedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const pending = assignments.filter((a) => a.status !== "completed");
    const completed = assignments.filter((a) => a.status === "completed");

    return (
      <div className="max-w-3xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name}</h1>
          <p className="text-gray-500 mt-1">Your leadership assessment portal</p>
        </div>

        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Pending Assessments
            </h2>
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-amber-200 p-5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{a.assessmentVersion.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Version {a.assessmentVersion.version} · {a.status === "in_progress" ? "In progress" : "Not started"}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/assessment/${a.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {a.status === "in_progress" ? "Continue" : "Start"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Completed Assessments
            </h2>
            <div className="space-y-3">
              {completed.map((a) => {
                const zone = a.result?.dominantZone as Zone | undefined;
                const profile = zone ? ZONE_PROFILES[zone] : null;
                return (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{a.assessmentVersion.title}</div>
                      {zone && profile && (
                        <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${profile.color} ${profile.textColor}`}>
                          {profile.emoji} {zone.replace("CrisisMaker", "Crisis Maker")}
                        </div>
                      )}
                    </div>
                    {a.result && (
                      <Link
                        href={`/report/${a.result.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
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
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-gray-900 font-medium">No assessments yet</div>
            <div className="text-gray-500 text-sm mt-1">Your HR team will assign an assessment when ready.</div>
          </div>
        )}
      </div>
    );
  }

  // Manager/HR/Admin: show org overview
  const [totalEmployees, totalCompleted, recentResults] = await Promise.all([
    prisma.user.count({ where: { isActive: true, role: "employee" } }),
    prisma.assessmentResult.count(),
    prisma.assessmentResult.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        assignment: { include: { user: { select: { name: true, grade: true } } } },
      },
    }),
  ]);

  const zoneCounts: Record<string, number> = {};
  const allResults = await prisma.assessmentResult.findMany({ select: { dominantZone: true } });
  for (const r of allResults) {
    zoneCounts[r.dominantZone] = (zoneCounts[r.dominantZone] ?? 0) + 1;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organisation Overview</h1>
        <p className="text-gray-500 mt-1">Leadership Operating Profile dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: totalEmployees, color: "bg-indigo-50 text-indigo-700" },
          { label: "Assessments Completed", value: totalCompleted, color: "bg-emerald-50 text-emerald-700" },
          { label: "Completion Rate", value: totalEmployees > 0 ? `${Math.round((totalCompleted / totalEmployees) * 100)}%` : "—", color: "bg-amber-50 text-amber-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 ${stat.color}`}>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Zone Distribution */}
      {Object.keys(zoneCounts).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Zone Distribution</h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(zoneCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([zone, count]) => {
                const z = zone as Zone;
                const profile = ZONE_PROFILES[z];
                return (
                  <div key={zone} className={`p-3 rounded-lg ${profile?.color ?? "bg-gray-50"}`}>
                    <div className={`text-lg font-bold ${profile?.textColor ?? "text-gray-700"}`}>
                      {count}
                    </div>
                    <div className={`text-xs mt-0.5 ${profile?.textColor ?? "text-gray-500"}`}>
                      {profile?.emoji} {zone.replace("CrisisMaker", "Crisis Maker")}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent completions */}
      {recentResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Completions</h2>
          <div className="divide-y divide-gray-100">
            {recentResults.map((r) => {
              const zone = r.dominantZone as Zone;
              const profile = ZONE_PROFILES[zone];
              return (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{r.assignment.user.name}</div>
                    <div className="text-xs text-gray-500">{r.assignment.user.grade ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile?.color} ${profile?.textColor}`}>
                      {profile?.emoji} {zone.replace("CrisisMaker", "Crisis Maker")}
                    </span>
                    <Link href={`/dashboard/report/${r.id}`} className="text-xs text-indigo-600 hover:underline">
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
