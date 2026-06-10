"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ZONE_COLORS: Record<string, string> = {
  Dreamer: "#7c3aed",
  Perfectionist: "#2563eb",
  Delegate: "#059669",
  Rebel: "#ea580c",
  "Crisis Maker": "#dc2626",
  Avoider: "#64748b",
  Overwhelmed: "#d97706",
};

interface DataPoint {
  zone: string;
  score: number;
}

export default function ZoneBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 8 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="zone" width={90} tick={{ fontSize: 11, fill: "#374151" }} />
        <Tooltip formatter={(v) => [`${String(v)}`, "Score"]} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell key={d.zone} fill={ZONE_COLORS[d.zone] ?? "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
