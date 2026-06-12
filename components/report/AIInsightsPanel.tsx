"use client";

import { useState, useEffect } from "react";

interface Props {
  resultId: string;
  initialInsights: Record<string, string> | null;
}

const SECTIONS = [
  { key: "executiveSummary", label: "Executive Summary" },
  { key: "strengthsAndDevelopmentAreas", label: "Strengths & Development" },
  { key: "leadershipStyleAnalysis", label: "Leadership Style" },
  { key: "stressResponseAnalysis", label: "Stress Response" },
  { key: "decisionMakingProfile", label: "Decision Making" },
  { key: "communicationStyle", label: "Communication Style" },
  { key: "teamContributionStyle", label: "Team Contribution" },
  { key: "coachingActionsAndCareerPath", label: "Coaching & Career Path" },
  { key: "managerDiscussionPoints", label: "Manager Discussion" },
  { key: "developmentPlan", label: "Development Plan" },
];

export default function AIInsightsPanel({ resultId, initialInsights }: Props) {
  const [insights, setInsights] = useState(initialInsights);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(!initialInsights);

  useEffect(() => {
    if (insights) return;

    // Trigger generation from client — fire-and-forget in serverless gets killed on response
    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultId }),
    }).catch(() => {});

    // Poll every 4s until insights arrive
    const poll = async () => {
      try {
        const res = await fetch(`/api/results/${resultId}`);
        const data = await res.json();
        if (data.data?.aiInsights) {
          setInsights(data.data.aiInsights);
          setLoading(false);
        }
      } catch {}
    };

    const interval = setInterval(poll, 4000);
    poll();
    return () => clearInterval(interval);
  }, [resultId, insights]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">AI-Generated Insights</h3>
        {loading && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            Generating insights…
          </span>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex overflow-x-auto border-b border-gray-100">
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === i
                ? "border-indigo-600 text-indigo-700 bg-indigo-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 min-h-48">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
            ))}
            <p className="text-sm text-gray-500 mt-4">
              AI is analysing this leadership profile. This usually takes 15–30 seconds…
            </p>
          </div>
        ) : insights ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {insights[SECTIONS[activeTab].key] ?? "No insights available for this section."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Insights could not be generated. Please try again later.</p>
        )}
      </div>
    </div>
  );
}
