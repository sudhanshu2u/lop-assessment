"use client";

import Link from "next/link";
import { DIMENSIONS, DIMENSION_LABELS } from "@/lib/scoring/types";
import type { Zone, DimensionScores } from "@/lib/scoring/types";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";

interface HeatMapRow {
  userId: string;
  name: string;
  grade: string;
  department: string;
  dimensionScores: DimensionScores;
  dominantZone: Zone;
  burnoutRiskScore: number;
  resultId: string;
}

function scoreToColor(score: number): string {
  if (score >= 80) return "bg-emerald-500 text-white";
  if (score >= 65) return "bg-emerald-300 text-emerald-900";
  if (score >= 50) return "bg-yellow-200 text-yellow-900";
  if (score >= 35) return "bg-orange-300 text-orange-900";
  return "bg-red-400 text-white";
}

export default function TeamHeatMap({ data }: { data: HeatMapRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-3 text-gray-500 font-medium w-36">Name</th>
            <th className="text-left pb-2 pr-3 text-gray-500 font-medium w-20">Zone</th>
            {DIMENSIONS.map((d) => (
              <th key={d} className="pb-2 px-1 text-gray-400 font-medium text-center w-8" title={DIMENSION_LABELS[d]}>
                {d}
              </th>
            ))}
            <th className="pb-2 px-1 text-gray-400 font-medium text-center w-12">Burnout</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => {
            const profile = ZONE_PROFILES[row.dominantZone];
            return (
              <tr key={row.userId} className="hover:bg-gray-50">
                <td className="py-1.5 pr-3">
                  <Link href={`/dashboard/report/${row.resultId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {row.name}
                  </Link>
                  {row.grade && <div className="text-gray-400">{row.grade}</div>}
                </td>
                <td className="py-1.5 pr-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${profile.color} ${profile.textColor}`}>
                    {profile.emoji} {row.dominantZone.replace("CrisisMaker", "CM")}
                  </span>
                </td>
                {DIMENSIONS.map((d) => {
                  const score = Math.round(row.dimensionScores[d]);
                  return (
                    <td key={d} className="py-1.5 px-0.5">
                      <div className={`w-7 h-7 rounded flex items-center justify-center font-semibold mx-auto ${scoreToColor(score)}`}>
                        {score}
                      </div>
                    </td>
                  );
                })}
                <td className="py-1.5 px-1 text-center">
                  <span className={`font-semibold ${row.burnoutRiskScore > 65 ? "text-red-600" : row.burnoutRiskScore > 40 ? "text-amber-600" : "text-emerald-600"}`}>
                    {Math.round(row.burnoutRiskScore)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Score scale:</span>
        {[
          { label: "≥80", color: "bg-emerald-500" },
          { label: "65–79", color: "bg-emerald-300" },
          { label: "50–64", color: "bg-yellow-200" },
          { label: "35–49", color: "bg-orange-300" },
          { label: "<35", color: "bg-red-400" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
