import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import { DIMENSION_LABELS, DIMENSIONS } from "@/lib/scoring/types";
import type { Zone, Dimension, DimensionScores, ZoneScores } from "@/lib/scoring/types";
import RadarChart from "@/components/charts/RadarChart";
import ZoneBarChart from "@/components/charts/ZoneBarChart";
import MaturityGauge from "@/components/charts/MaturityGauge";
import AIInsightsPanel from "@/components/report/AIInsightsPanel";
import Link from "next/link";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { resultId } = await params;

  const result = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      assignment: {
        include: {
          user: { select: { id: true, name: true, email: true, grade: true, department: { select: { name: true } } } },
          assessmentVersion: { select: { title: true, version: true } },
        },
      },
    },
  });

  if (!result) notFound();

  const { userId, role } = session.user;
  const isOwn = result.assignment.userId === userId;
  const isPrivileged = ["super_admin", "hr_admin", "manager"].includes(role);
  if (!isOwn && !isPrivileged) redirect("/dashboard");

  const dims = result.dimensionScores as DimensionScores;
  const zones = result.zoneScores as ZoneScores;
  const dom = result.dominantZone as Zone;
  const sec = result.secondaryZone as Zone;
  const domProfile = ZONE_PROFILES[dom];
  const secProfile = ZONE_PROFILES[sec];

  const radarData = DIMENSIONS.map((d) => ({
    dimension: DIMENSION_LABELS[d],
    short: d,
    score: Math.round(dims[d]),
  }));

  const zoneData = Object.entries(zones)
    .map(([z, s]) => ({ zone: z.replace("CrisisMaker", "Crisis Maker"), score: Math.round(s as number) }))
    .sort((a, b) => b.score - a.score);

  const aiInsights = result.aiInsights as Record<string, string> | null;

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{result.assignment.user.name}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm text-gray-500">
              {result.assignment.user.grade ?? "—"} · {result.assignment.user.department?.name ?? "—"}
            </span>
            <span className="text-xs text-gray-400">
              {result.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${domProfile.color} ${domProfile.textColor}`}>
              {domProfile.emoji} {dom.replace("CrisisMaker", "Crisis Maker")} (Primary)
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${secProfile.color} ${secProfile.textColor}`}>
              {secProfile.emoji} {sec.replace("CrisisMaker", "Crisis Maker")} (Secondary)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/pdf/${resultId}`}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Zone profiles */}
      <div className="grid grid-cols-2 gap-4">
        {[{ z: dom, label: "Primary Zone", profile: domProfile }, { z: sec, label: "Secondary Zone", profile: secProfile }].map(({ label, profile }) => (
          <div key={label} className={`rounded-2xl p-5 ${profile.color}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${profile.textColor} opacity-70`}>
              {label}
            </div>
            <div className={`text-xl font-bold ${profile.textColor} mb-1`}>
              {profile.emoji} {profile.label}
            </div>
            <div className={`text-sm italic ${profile.textColor} mb-3`}>{profile.tagline}</div>
            <p className={`text-sm ${profile.textColor} opacity-90`}>{profile.description}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Dimension Profile</h3>
          <RadarChart data={radarData} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Operating Zone Scores</h3>
          <ZoneBarChart data={zoneData} />
        </div>
      </div>

      {/* Composite Indices */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Composite Indices</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Leadership Maturity", value: result.leadershipMaturityScore, color: "bg-indigo-50 text-indigo-700", icon: "🎖️" },
            { label: "Delegation Index", value: result.delegationIndex, color: "bg-emerald-50 text-emerald-700", icon: "🤝" },
            { label: "Strategic Thinking", value: result.strategicThinkingIndex, color: "bg-violet-50 text-violet-700", icon: "🌟" },
            { label: "Execution Index", value: result.executionIndex, color: "bg-blue-50 text-blue-700", icon: "⚡" },
            { label: "Burnout Risk", value: result.burnoutRiskScore, color: result.burnoutRiskScore > 65 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700", icon: "🔥" },
            { label: "Succession Readiness", value: result.successionReadinessScore, color: "bg-teal-50 text-teal-700", icon: "📈" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className={`rounded-xl p-4 ${color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <span className="text-xs font-medium opacity-80">{label}</span>
              </div>
              <MaturityGauge value={Math.round(value)} size={80} />
            </div>
          ))}
        </div>
      </div>

      {/* Dimension scores table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Dimension Breakdown</h3>
        <div className="space-y-3">
          {DIMENSIONS.map((d) => {
            const score = Math.round(dims[d]);
            const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-indigo-400" : "bg-amber-400";
            return (
              <div key={d} className="flex items-center gap-3">
                <div className="w-6 text-xs font-bold text-gray-400 text-center">{d}</div>
                <div className="flex-1 text-sm text-gray-700 w-40">{DIMENSION_LABELS[d]}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
                </div>
                <div className="w-8 text-sm font-semibold text-gray-700 text-right">{score}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Risks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Strengths</h3>
          <ul className="space-y-2">
            {domProfile.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-gray-700">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Development Areas</h3>
          <ul className="space-y-2">
            {domProfile.risks.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5">△</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel resultId={resultId} initialInsights={aiInsights} />
    </div>
  );
}
