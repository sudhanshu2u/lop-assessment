import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Polygon,
  Circle,
  Path,
} from "@react-pdf/renderer";
import { ZONE_PROFILES } from "@/lib/scoring/zone-profiles";
import { DIMENSIONS, DIMENSION_LABELS } from "@/lib/scoring/types";
import type { Zone, DimensionScores, ZoneScores, CompositeIndices, Dimension } from "@/lib/scoring/types";

const C = {
  indigo: "#4f46e5",
  indigoLight: "#eef2ff",
  slate: "#0f172a",
  gray: "#6b7280",
  grayLight: "#f3f4f6",
  emerald: "#059669",
  amber: "#d97706",
  red: "#dc2626",
  white: "#ffffff",
};

const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: C.white, padding: 40 },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.slate, marginBottom: 4 },
  h2: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.slate, marginBottom: 8 },
  h3: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.slate, marginBottom: 6 },
  body: { fontSize: 9, color: C.gray, lineHeight: 1.5 },
  label: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray, textTransform: "uppercase", letterSpacing: 0.8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, fontSize: 9, fontFamily: "Helvetica-Bold" },
  card: { backgroundColor: C.grayLight, borderRadius: 6, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
  section: { marginBottom: 16 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
});

function Header({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <View style={{ backgroundColor: C.indigo, margin: -40, padding: 40, marginBottom: 24 }}>
      <Text style={{ fontSize: 8, color: C.indigoLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
        Leadership Operating Profile Assessment
      </Text>
      <Text style={{ ...S.h1, color: C.white, fontSize: 20 }}>{name}</Text>
      <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{subtitle}</Text>
    </View>
  );
}

function Footer({ pageNum }: { pageNum: number }) {
  return (
    <View style={S.footer} fixed>
      <Text style={{ fontSize: 7, color: C.gray }}>LOP Assessment — Confidential</Text>
      <Text style={{ fontSize: 7, color: C.gray }}>Page {pageNum}</Text>
    </View>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? C.emerald : score >= 50 ? C.indigo : C.amber;
  return (
    <View style={{ marginBottom: 5 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
        <Text style={{ fontSize: 8, color: C.slate }}>{label}</Text>
        <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color }}>{score}</Text>
      </View>
      <View style={{ height: 5, backgroundColor: C.grayLight, borderRadius: 3 }}>
        <View style={{ height: 5, width: `${score}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

function RadarSVG({ scores }: { scores: Record<Dimension, number> }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const dims = DIMENSIONS;
  const n = dims.length;

  function point(i: number, val: number) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const radius = (val / 100) * r;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function gridPoints(scale: number) {
    return dims.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return `${cx + scale * r * Math.cos(angle)},${cy + scale * r * Math.sin(angle)}`;
    }).join(" ");
  }

  const dataPoints = dims.map((d, i) => point(i, scores[d] ?? 0));
  const dataStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={size} height={size}>
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <Polygon
          key={scale}
          points={gridPoints(scale)}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          fill="none"
        />
      ))}
      {/* Data polygon */}
      <Polygon points={dataStr} fill={`${C.indigo}33`} stroke={C.indigo} strokeWidth={1.5} />
      {/* Axis labels */}
      {dims.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 12) * Math.cos(angle);
        const ly = cy + (r + 12) * Math.sin(angle);
        return (
          <Text
            key={d}
            style={{ fontSize: 6, fill: C.gray }}
            x={lx - 4}
            y={ly + 2}
          >
            {d}
          </Text>
        );
      })}
    </Svg>
  );
}

interface Props {
  name: string;
  grade: string;
  department: string;
  assessmentTitle: string;
  assessmentVersion: string;
  completedAt: string;
  dominantZone: Zone;
  secondaryZone: Zone;
  dimensionScores: DimensionScores;
  zoneScores: ZoneScores;
  compositeIndices: CompositeIndices;
  aiInsights: Record<string, string> | null;
}

export default function LOPReportDocument({
  name,
  grade,
  department,
  assessmentTitle,
  assessmentVersion,
  completedAt,
  dominantZone,
  secondaryZone,
  dimensionScores,
  zoneScores,
  compositeIndices,
  aiInsights,
}: Props) {
  const domProfile = ZONE_PROFILES[dominantZone];
  const secProfile = ZONE_PROFILES[secondaryZone];

  const zonesSorted = Object.entries(zoneScores).sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <Document title={`LOP Report — ${name}`} author="LOP Assessment Platform">

      {/* Page 1: Cover */}
      <Page size="A4" style={S.page}>
        <Header name={name} subtitle={`${grade} · ${department}`} />

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: C.indigoLight, borderRadius: 8, padding: 12 }}>
            <Text style={S.label}>Primary Zone</Text>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: C.indigo, marginTop: 4 }}>
              {domProfile.emoji} {dominantZone.replace("CrisisMaker", "Crisis Maker")}
            </Text>
            <Text style={{ fontSize: 8, color: C.gray, marginTop: 3 }}>{domProfile.tagline}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.grayLight, borderRadius: 8, padding: 12 }}>
            <Text style={S.label}>Secondary Zone</Text>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: C.slate, marginTop: 4 }}>
              {secProfile.emoji} {secondaryZone.replace("CrisisMaker", "Crisis Maker")}
            </Text>
            <Text style={{ fontSize: 8, color: C.gray, marginTop: 3 }}>{secProfile.tagline}</Text>
          </View>
        </View>

        <View style={S.card}>
          <Text style={S.label}>Assessment</Text>
          <Text style={{ fontSize: 9, color: C.slate, marginTop: 3 }}>
            {assessmentTitle} · Version {assessmentVersion} · Completed {completedAt}
          </Text>
        </View>

        {/* Composite indices overview */}
        <Text style={{ ...S.h3, marginTop: 12 }}>Composite Leadership Indices</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Leadership Maturity", value: compositeIndices.leadershipMaturityScore },
            { label: "Delegation Index", value: compositeIndices.delegationIndex },
            { label: "Strategic Thinking", value: compositeIndices.strategicThinkingIndex },
            { label: "Execution Index", value: compositeIndices.executionIndex },
            { label: "Burnout Risk", value: compositeIndices.burnoutRiskScore, invert: true },
            { label: "Succession Readiness", value: compositeIndices.successionReadinessScore },
          ].map(({ label, value, invert }) => {
            const v = Math.round(value);
            const color = invert
              ? v > 65 ? C.red : v > 40 ? C.amber : C.emerald
              : v >= 70 ? C.emerald : v >= 40 ? C.indigo : C.amber;
            return (
              <View key={label} style={{ width: "30%", backgroundColor: C.grayLight, borderRadius: 6, padding: 8 }}>
                <Text style={{ fontSize: 7, color: C.gray }}>{label}</Text>
                <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color, marginTop: 2 }}>{v}</Text>
                <Text style={{ fontSize: 6, color: C.gray }}>/100</Text>
              </View>
            );
          })}
        </View>

        <Footer pageNum={1} />
      </Page>

      {/* Page 2: Dimension profile */}
      <Page size="A4" style={S.page}>
        <Text style={S.h2}>Dimension Profile · {name}</Text>

        <View style={{ flexDirection: "row", gap: 24 }}>
          <View style={{ flex: 1 }}>
            <RadarSVG scores={dimensionScores} />
          </View>
          <View style={{ flex: 1 }}>
            {DIMENSIONS.map((d) => (
              <ScoreBar key={d} score={Math.round(dimensionScores[d])} label={`${d}. ${DIMENSION_LABELS[d]}`} />
            ))}
          </View>
        </View>

        <View style={S.divider} />

        <Text style={S.h3}>Zone Score Distribution</Text>
        {zonesSorted.map(([zone, score]) => (
          <ScoreBar key={zone} score={Math.round(score as number)} label={zone.replace("CrisisMaker", "Crisis Maker")} />
        ))}

        <Footer pageNum={2} />
      </Page>

      {/* Page 3: Primary zone analysis */}
      <Page size="A4" style={S.page}>
        <Text style={S.h2}>Primary Zone Analysis · {dominantZone.replace("CrisisMaker", "Crisis Maker")}</Text>
        <Text style={{ ...S.body, marginBottom: 12 }}>{domProfile.description}</Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, ...S.card }}>
            <Text style={{ ...S.h3, color: C.emerald }}>Strengths</Text>
            {domProfile.strengths.map((s) => (
              <Text key={s} style={{ ...S.body, marginBottom: 4 }}>✓ {s}</Text>
            ))}
          </View>
          <View style={{ flex: 1, ...S.card }}>
            <Text style={{ ...S.h3, color: C.amber }}>Development Areas</Text>
            {domProfile.risks.map((r) => (
              <Text key={r} style={{ ...S.body, marginBottom: 4 }}>△ {r}</Text>
            ))}
          </View>
        </View>

        {aiInsights?.leadershipStyleAnalysis && (
          <View style={{ marginTop: 16 }}>
            <Text style={S.h3}>Leadership Style Analysis</Text>
            <Text style={S.body}>{aiInsights.leadershipStyleAnalysis}</Text>
          </View>
        )}

        {aiInsights?.stressResponseAnalysis && (
          <View style={{ marginTop: 12 }}>
            <Text style={S.h3}>Stress Response Analysis</Text>
            <Text style={S.body}>{aiInsights.stressResponseAnalysis}</Text>
          </View>
        )}

        <Footer pageNum={3} />
      </Page>

      {/* Page 4: AI Insights — Executive Summary + Strengths */}
      <Page size="A4" style={S.page}>
        <Text style={S.h2}>Executive Summary</Text>
        <Text style={{ ...S.body, marginBottom: 16 }}>
          {aiInsights?.executiveSummary ?? "AI insights pending generation."}
        </Text>

        <View style={S.divider} />

        <Text style={S.h2}>Strengths & Development Areas</Text>
        <Text style={S.body}>
          {aiInsights?.strengthsAndDevelopmentAreas ?? "—"}
        </Text>

        <Footer pageNum={4} />
      </Page>

      {/* Page 5: Decision Making, Communication, Team Contribution */}
      <Page size="A4" style={S.page}>
        <Text style={S.h2}>Decision Making Profile</Text>
        <Text style={{ ...S.body, marginBottom: 12 }}>{aiInsights?.decisionMakingProfile ?? "—"}</Text>

        <View style={S.divider} />

        <Text style={S.h2}>Communication Style</Text>
        <Text style={{ ...S.body, marginBottom: 12 }}>{aiInsights?.communicationStyle ?? "—"}</Text>

        <View style={S.divider} />

        <Text style={S.h2}>Team Contribution Style</Text>
        <Text style={S.body}>{aiInsights?.teamContributionStyle ?? "—"}</Text>

        <Footer pageNum={5} />
      </Page>

      {/* Page 6: Coaching + Development Plan */}
      <Page size="A4" style={S.page}>
        <Text style={S.h2}>Coaching Actions & Career Path</Text>
        <Text style={{ ...S.body, marginBottom: 12 }}>{aiInsights?.coachingActionsAndCareerPath ?? "—"}</Text>

        <View style={S.divider} />

        <Text style={S.h2}>Manager Discussion Points</Text>
        <Text style={{ ...S.body, marginBottom: 12 }}>{aiInsights?.managerDiscussionPoints ?? "—"}</Text>

        <View style={S.divider} />

        <Text style={S.h2}>Development Plan</Text>
        <Text style={S.body}>{aiInsights?.developmentPlan ?? "—"}</Text>

        <Footer pageNum={6} />
      </Page>

    </Document>
  );
}
