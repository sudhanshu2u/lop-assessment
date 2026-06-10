"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DataPoint {
  dimension: string;
  short: string;
  score: number;
}

export default function RadarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="short"
          tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#9ca3af" }} tickCount={5} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(v) => [`${String(v)}/100`, "Score"]}
          labelFormatter={(label, payload) =>
            payload?.[0]?.payload?.dimension ?? label
          }
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
