import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import { DIMENSION_LABELS, DIMENSIONS } from "@/lib/scoring/types";
import type { Zone, Dimension, DimensionScores, ZoneScores } from "@/lib/scoring/types";
const DIMENSION_GUIDANCE: Record<string, { high: string; mid: string; low: string; focus: string }> = {
  A: {
    high: "You consistently think ahead and align decisions with long-term goals. A clear strategic asset.",
    mid: "You think strategically in familiar contexts but may default to tactical mode under pressure.",
    low: "Day-to-day tasks tend to dominate. Long-term thinking may be crowded out by immediate demands.",
    focus: "Dedicate 30 min weekly to review where your team/role will be in 12 months. Practice asking 'why' before 'how'.",
  },
  B: {
    high: "You catch errors, maintain quality standards, and trace root causes methodically.",
    mid: "Quality is generally good but can slip under tight deadlines or competing demands.",
    low: "Detail and accuracy may be inconsistent, especially under time pressure.",
    focus: "Build a personal review checklist for key deliverables. Slow down before submitting critical work.",
  },
  C: {
    high: "You empower others effectively, assign based on strengths, and follow up without micromanaging.",
    mid: "You delegate in theory but may hold back key tasks or struggle to fully let go.",
    low: "Most work stays with you. This limits team growth and can create bottlenecks.",
    focus: "Identify one task this week you can fully hand over. Brief clearly, agree on the outcome, then step back.",
  },
  D: {
    high: "You remain composed under pressure and recover quickly from stressful periods.",
    mid: "You manage stress adequately in most situations but some high-pressure scenarios knock you off balance.",
    low: "Stress is visibly affecting your decision-making, energy, or how you show up for your team.",
    focus: "Build a 'pressure protocol' — a personal routine for when things escalate (e.g. pause, prioritise, communicate).",
  },
  E: {
    high: "You proactively drive improvements, take ownership beyond your role, and push forward despite resistance.",
    mid: "You show initiative in your comfort zone but may wait for permission or clearer signals in new areas.",
    low: "Tasks tend to wait for direction. Opportunities to lead and improve may be missed.",
    focus: "Each week, identify one problem you can solve without being asked. Start small — initiative compounds.",
  },
  F: {
    high: "You adapt quickly, embrace change as opportunity, and actively help others through transitions.",
    mid: "You accept change intellectually but may need time to fully adjust your approach in practice.",
    low: "Change feels disruptive and may trigger resistance or disengagement.",
    focus: "When change is announced, write down one thing it could improve. Reframing disruption as opportunity is a skill.",
  },
  G: {
    high: "You take full ownership of outcomes, follow through reliably, and hold others to agreed standards.",
    mid: "Accountability is generally present but may weaken when situations get difficult or ambiguous.",
    low: "Commitments may slip or responsibility may shift under pressure.",
    focus: "For every commitment you make, log it with a deadline. Review weekly. Proactive communication beats missed deadlines.",
  },
  H: {
    high: "You perform exceptionally in crises — but watch for manufacturing urgency in stable periods.",
    mid: "You engage well under pressure but can sustain focus in routine environments too.",
    low: "Routine work engages you well. Be aware that some urgency-creation can motivate, but excess drains teams.",
    focus: "Notice when you escalate urgency unnecessarily. In stable periods, focus energy on prevention over response.",
  },
  I: {
    high: "You build strong cross-functional relationships, share openly, and adapt your communication to others.",
    mid: "Collaboration works within your team but cross-functional relationships may be underdeveloped.",
    low: "Working in silos is a risk. Others may not feel informed, included, or heard.",
    focus: "Schedule one cross-team conversation per week. Ask for input on decisions before they are finalised.",
  },
  J: {
    high: "You estimate accurately, protect high-priority work, and sustain quality even under volume.",
    mid: "Priorities are generally managed but reactive tasks can crowd out important work at busy times.",
    low: "Workload feels unsustainable. Quality or priority alignment may be suffering.",
    focus: "Start each week by listing your top 3 priorities. Protect time for them before reactive tasks fill the calendar.",
  },
};

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

      {/* Dimension breakdown — rich cards */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Dimension Breakdown</h3>
        <p className="text-xs text-gray-400 mb-5">Each dimension is scored 0–100. Green = strength · Amber = developing · Red = focus area</p>
        <div className="space-y-4">
          {DIMENSIONS.map((d) => {
            const score = Math.round(dims[d]);
            const isStrength = score >= 70;
            const isDeveloping = score >= 45 && score < 70;
            const isFocus = score < 45;
            const barColor = isStrength ? "bg-emerald-500" : isDeveloping ? "bg-indigo-400" : "bg-amber-400";
            const badge = isStrength
              ? { label: "Strength", cls: "bg-emerald-100 text-emerald-700" }
              : isDeveloping
              ? { label: "Developing", cls: "bg-indigo-100 text-indigo-700" }
              : { label: "Focus Area", cls: "bg-amber-100 text-amber-700" };
            const guidance = DIMENSION_GUIDANCE[d as Dimension];
            return (
              <div key={d} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center flex-shrink-0">{d}</span>
                  <span className="font-semibold text-gray-900 text-sm flex-1">{DIMENSION_LABELS[d as Dimension]}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{score}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 mb-1">✓ What this means</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {isStrength ? guidance.high : isDeveloping ? guidance.mid : guidance.low}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-indigo-700 mb-1">→ Focus area</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{guidance.focus}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel resultId={resultId} initialInsights={aiInsights} />
    </div>
  );
}
