import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import { DIMENSION_LABELS, DIMENSIONS } from "@/lib/scoring/types";
import type { Zone, Dimension, DimensionScores, ZoneScores } from "@/lib/scoring/types";
import RadarChart from "@/components/charts/RadarChart";
import ZoneBarChart from "@/components/charts/ZoneBarChart";
import MaturityGauge from "@/components/charts/MaturityGauge";
import QuadrantChart from "@/components/charts/QuadrantChart";
import AIInsightsPanel from "@/components/report/AIInsightsPanel";

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

  // Quadrant axes
  const executionScore = Math.round((dims.G + dims.J) / 2);
  const strategicScore = Math.round((dims.A + dims.C + dims.I) / 3);
  const userName = result.assignment.user.name;

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{result.assignment.user.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-sm text-gray-500">
              {result.assignment.user.grade ?? "—"} · {result.assignment.user.department?.name ?? "—"}
            </span>
            <span className="text-xs text-gray-400">
              Completed {result.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${domProfile.color} ${domProfile.textColor}`}>
              {domProfile.emoji} {dom.replace("CrisisMaker", "Crisis Maker")} (Primary)
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${secProfile.color} ${secProfile.textColor}`}>
              {secProfile.emoji} {sec.replace("CrisisMaker", "Crisis Maker")} (Secondary)
            </span>
          </div>
        </div>
        <a
          href={`/api/pdf/${resultId}`}
          className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Download PDF
        </a>
      </div>

      {/* Zone explainer */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4">
        <p className="text-sm text-indigo-900 leading-relaxed">
          <span className="font-semibold">What are Operating Zones?</span> Based on your 40 responses, the scoring engine maps your leadership behaviour across 7 operating patterns.
          Your <span className="font-semibold">Primary Zone</span> is the style that dominates your day-to-day approach — how you instinctively lead, decide, and respond under pressure.
          Your <span className="font-semibold">Secondary Zone</span> is a supporting pattern that also shows up, often in different contexts or when the primary style is under stress.
          Together they paint a picture of your natural operating range.
        </p>
      </div>

      {/* Zone cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Primary Zone", sublabel: "Your dominant day-to-day style", profile: domProfile },
          { label: "Secondary Zone", sublabel: "Your supporting / situational style", profile: secProfile },
        ].map(({ label, sublabel, profile }) => (
          <div key={label} className={`rounded-2xl p-5 ${profile.color}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider ${profile.textColor} opacity-60`}>
              {label}
            </div>
            <div className={`text-xs ${profile.textColor} opacity-70 mb-2`}>{sublabel}</div>
            <div className={`text-xl font-bold ${profile.textColor} mb-1`}>
              {profile.emoji} {profile.label}
            </div>
            <p className={`text-sm italic ${profile.textColor} opacity-80 mb-2`}>{profile.tagline}</p>
            <p className={`text-sm ${profile.textColor} opacity-90 leading-relaxed`}>{profile.description}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1: Radar + Quadrant */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Dimension Profile</h3>
          <p className="text-xs text-gray-400 mb-4">Scores across all 10 leadership dimensions (0–100)</p>
          <RadarChart data={radarData} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Leadership Quadrant</h3>
          <p className="text-xs text-gray-400 mb-4">
            X: Execution (Accountability + Workload) · Y: Strategy (Strategic Thinking + Delegation + Collaboration)
          </p>
          <QuadrantChart executionScore={executionScore} strategicScore={strategicScore} name={userName} />
        </div>
      </div>

      {/* Operating Zone Scores with strengths/improvements */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Operating Zone Scores</h3>
        <p className="text-xs text-gray-400 mb-5">Each zone score shows how strongly this operating style is present. Higher = more dominant.</p>
        <div className="space-y-4">
          {zoneData.map(({ zone, score }) => {
            const zoneKey = zone.replace("Crisis Maker", "CrisisMaker") as Zone;
            const profile = ZONE_PROFILES[zoneKey];
            const isDominant = zone === dom.replace("CrisisMaker", "Crisis Maker");
            const isSecondary = zone === sec.replace("CrisisMaker", "Crisis Maker");
            const barColor = score >= 70 ? "bg-indigo-500" : score >= 50 ? "bg-indigo-400" : "bg-gray-300";
            const isPositiveZone = ["Dreamer", "Perfectionist", "Delegate", "Rebel"].includes(zoneKey);
            return (
              <div key={zone} className={`rounded-xl border p-4 transition-all ${isDominant ? "border-indigo-300 bg-indigo-50/50" : isSecondary ? "border-gray-200 bg-gray-50/50" : "border-gray-100"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{profile.emoji}</span>
                    <span className="font-semibold text-gray-900 text-sm">{zone}</span>
                    {isDominant && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Primary</span>}
                    {isSecondary && <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">Secondary</span>}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
                </div>
                {(isDominant || isSecondary) && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 mb-1.5">✓ What works well</p>
                      <ul className="space-y-1">
                        {profile.strengths.map((s) => (
                          <li key={s} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-emerald-400 flex-shrink-0 mt-0.5">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-1.5">△ Scope for improvement</p>
                      <ul className="space-y-1">
                        {profile.risks.map((r) => (
                          <li key={r} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {!isDominant && !isSecondary && score >= 40 && (
                  <p className="text-xs text-gray-500 italic mt-1">{profile.tagline}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Composite Indices */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Composite Leadership Indices</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Leadership Maturity", value: result.leadershipMaturityScore, icon: "🎖️", high: false },
            { label: "Delegation Index", value: result.delegationIndex, icon: "🤝", high: false },
            { label: "Strategic Thinking", value: result.strategicThinkingIndex, icon: "🌟", high: false },
            { label: "Execution Index", value: result.executionIndex, icon: "⚡", high: false },
            { label: "Burnout Risk", value: result.burnoutRiskScore, icon: "🔥", high: true },
            { label: "Succession Readiness", value: result.successionReadinessScore, icon: "📈", high: false },
          ].map(({ label, value, icon, high }) => {
            const v = Math.round(value);
            const bg = high
              ? v > 65 ? "bg-red-50" : v > 40 ? "bg-amber-50" : "bg-emerald-50"
              : v >= 70 ? "bg-emerald-50" : v >= 40 ? "bg-indigo-50" : "bg-amber-50";
            const tc = high
              ? v > 65 ? "text-red-700" : v > 40 ? "text-amber-700" : "text-emerald-700"
              : v >= 70 ? "text-emerald-700" : v >= 40 ? "text-indigo-700" : "text-amber-700";
            return (
              <div key={label} className={`rounded-xl p-4 ${bg} flex flex-col items-center gap-2`}>
                <div className={`text-xs font-medium ${tc} opacity-80 text-center`}>
                  {icon} {label}
                </div>
                <MaturityGauge value={v} size={80} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Dimension Breakdown</h3>
        <div className="space-y-3">
          {DIMENSIONS.map((d) => {
            const score = Math.round(dims[d]);
            const barColor = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-indigo-400" : "bg-amber-400";
            return (
              <div key={d} className="flex items-center gap-3">
                <div className="w-5 text-xs font-bold text-gray-400">{d}</div>
                <div className="w-44 text-sm text-gray-700 truncate">{DIMENSION_LABELS[d as Dimension]}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${barColor} h-2 rounded-full`} style={{ width: `${score}%` }} />
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
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
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
                <span className="text-amber-500 mt-0.5 flex-shrink-0">△</span>
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
