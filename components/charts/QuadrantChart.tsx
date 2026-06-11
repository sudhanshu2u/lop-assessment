"use client";

interface Props {
  executionScore: number;   // x-axis  0–100
  strategicScore: number;   // y-axis  0–100
  name: string;
}

const QUADRANTS = [
  {
    x: 0, y: 0, w: "50%", h: "50%",
    label: "Operator",
    sub: "Strong executor; needs strategic elevation",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  {
    x: "50%", y: 0, w: "50%", h: "50%",
    label: "Strategic Leader",
    sub: "High vision + high delivery — ideal zone",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "#22c55e",
  },
  {
    x: 0, y: "50%", w: "50%", h: "50%",
    label: "Developing",
    sub: "Building both strategic and execution muscles",
    bg: "#fff7ed",
    border: "#fed7aa",
    dot: "#f97316",
  },
  {
    x: "50%", y: "50%", w: "50%", h: "50%",
    label: "Visionary",
    sub: "Ideas-rich; needs stronger delivery follow-through",
    bg: "#faf5ff",
    border: "#e9d5ff",
    dot: "#a855f7",
  },
];

export default function QuadrantChart({ executionScore, strategicScore, name }: Props) {
  // SVG coordinate system: origin top-left, y increases downward
  // User dot: x = executionScore%, y = (100 - strategicScore)%
  const dotXPct = executionScore;
  const dotYPct = 100 - strategicScore;

  // Active quadrant
  const isHighExecution = executionScore >= 50;
  const isHighStrategic = strategicScore >= 50;
  let activeLabel = "Developing";
  if (isHighExecution && isHighStrategic) activeLabel = "Strategic Leader";
  else if (isHighExecution && !isHighStrategic) activeLabel = "Operator";
  else if (!isHighExecution && isHighStrategic) activeLabel = "Visionary";

  return (
    <div className="space-y-3">
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {/* Quadrant fills */}
          {/* Bottom-left: Developing */}
          <rect x="0" y="200" width="200" height="200" fill="#fff7ed" />
          <rect x="0" y="200" width="200" height="200" fill="none" stroke="#fed7aa" strokeWidth="1" />
          {/* Bottom-right: Operator */}
          <rect x="200" y="200" width="200" height="200" fill="#eff6ff" />
          <rect x="200" y="200" width="200" height="200" fill="none" stroke="#bfdbfe" strokeWidth="1" />
          {/* Top-left: Visionary */}
          <rect x="0" y="0" width="200" height="200" fill="#faf5ff" />
          <rect x="0" y="0" width="200" height="200" fill="none" stroke="#e9d5ff" strokeWidth="1" />
          {/* Top-right: Strategic Leader */}
          <rect x="200" y="0" width="200" height="200" fill="#f0fdf4" />
          <rect x="200" y="0" width="200" height="200" fill="none" stroke="#bbf7d0" strokeWidth="1" />

          {/* Axis lines */}
          <line x1="200" y1="0" x2="200" y2="400" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 4" />

          {/* Quadrant labels */}
          <text x="10" y="20" fontSize="12" fontWeight="700" fill="#a855f7">Visionary</text>
          <text x="10" y="36" fontSize="9" fill="#7e22ce" opacity="0.8">High vision, low execution</text>

          <text x="210" y="20" fontSize="12" fontWeight="700" fill="#16a34a">Strategic Leader</text>
          <text x="210" y="36" fontSize="9" fill="#166534" opacity="0.8">High vision + high execution</text>

          <text x="10" y="220" fontSize="12" fontWeight="700" fill="#ea580c">Developing</text>
          <text x="10" y="236" fontSize="9" fill="#9a3412" opacity="0.8">Building both capabilities</text>

          <text x="210" y="220" fontSize="12" fontWeight="700" fill="#2563eb">Operator</text>
          <text x="210" y="236" fontSize="9" fill="#1e40af" opacity="0.8">Strong executor, needs strategy</text>

          {/* Axis tick marks */}
          <text x="196" y="196" fontSize="9" fill="#94a3b8" textAnchor="end">50</text>

          {/* User dot */}
          <circle
            cx={(dotXPct / 100) * 400}
            cy={(dotYPct / 100) * 400}
            r="12"
            fill="#4f46e5"
            stroke="white"
            strokeWidth="3"
            style={{ filter: "drop-shadow(0 2px 4px rgba(79,70,229,0.4))" }}
          />
          <text
            x={(dotXPct / 100) * 400}
            y={(dotYPct / 100) * 400 - 18}
            fontSize="10"
            fontWeight="700"
            fill="#4f46e5"
            textAnchor="middle"
          >
            {name.split(" ")[0]}
          </text>

          {/* Axis labels */}
          <text x="200" y="395" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="600">
            ← Low Execution · High Execution →
          </text>
          <text
            x="10"
            y="200"
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
            fontWeight="600"
            transform="rotate(-90, 10, 200)"
          >
            ← Low Strategy · High Strategy →
          </text>
        </svg>
      </div>

      {/* Active quadrant callout */}
      <div className={`rounded-xl p-3 text-sm ${
        activeLabel === "Strategic Leader" ? "bg-emerald-50 border border-emerald-200" :
        activeLabel === "Visionary" ? "bg-violet-50 border border-violet-200" :
        activeLabel === "Operator" ? "bg-blue-50 border border-blue-200" :
        "bg-orange-50 border border-orange-200"
      }`}>
        <span className="font-semibold">Currently in: {activeLabel}</span>
        <span className="text-gray-600"> — {
          activeLabel === "Strategic Leader" ? "Strong on both vision and delivery. Focus on sustaining this balance." :
          activeLabel === "Visionary" ? "Ideas-rich leader. Priority: strengthen execution and follow-through." :
          activeLabel === "Operator" ? "Reliable executor. Priority: elevate strategic thinking and longer-range planning." :
          "Development opportunity on both axes. Coaching on strategy and execution will unlock significant growth."
        }</span>
      </div>
    </div>
  );
}
