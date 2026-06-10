import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeamHeatMap from "@/components/charts/TeamHeatMap";
import Link from "next/link";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import type { Zone, DimensionScores } from "@/lib/scoring/types";

export default async function TeamPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;
  if (!["super_admin", "hr_admin", "manager"].includes(role)) redirect("/dashboard");

  const results = await prisma.assessmentResult.findMany({
    where: role === "manager"
      ? { assignment: { user: { managerId: session.user.userId } } }
      : undefined,
    include: {
      assignment: {
        include: {
          user: { select: { id: true, name: true, grade: true, department: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Deduplicate — most recent per user
  const seen = new Set<string>();
  const unique = results.filter((r) => {
    const uid = r.assignment.userId;
    if (seen.has(uid)) return false;
    seen.add(uid);
    return true;
  });

  const heatmapData = unique.map((r) => ({
    userId: r.assignment.userId,
    name: r.assignment.user.name,
    grade: r.assignment.user.grade ?? "",
    department: r.assignment.user.department?.name ?? "",
    dimensionScores: r.dimensionScores as DimensionScores,
    dominantZone: r.dominantZone as Zone,
    burnoutRiskScore: r.burnoutRiskScore,
    resultId: r.id,
  }));

  const burnoutRisks = heatmapData.filter((d) => d.burnoutRiskScore > 65);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
        <p className="text-gray-500 mt-1">{unique.length} team members with completed assessments</p>
      </div>

      {/* Burnout alerts */}
      {burnoutRisks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600">🔥</span>
            <span className="text-sm font-semibold text-red-800">High Burnout Risk Detected</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {burnoutRisks.map((m) => (
              <Link key={m.userId} href={`/dashboard/report/${m.resultId}`} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200">
                {m.name} ({Math.round(m.burnoutRiskScore)})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Zone distribution */}
      {unique.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Zone Distribution</h2>
          <div className="flex gap-2 flex-wrap">
            {unique.map((m) => {
              const zone = m.dominantZone as Zone;
              const profile = ZONE_PROFILES[zone];
              return (
                <Link key={m.id} href={`/dashboard/report/${m.id}`}>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${profile.color} ${profile.textColor} hover:opacity-80 transition-opacity cursor-pointer`}>
                    {profile.emoji} {m.assignment.user.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Heat map */}
      {heatmapData.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Behavioral Heat Map</h2>
          <TeamHeatMap data={heatmapData} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-gray-900 font-medium">No completed assessments yet</div>
          <div className="text-gray-500 text-sm mt-1">Heat map appears once team members complete their assessments.</div>
        </div>
      )}
    </div>
  );
}
