import type { Zone } from "./types";

export interface ZoneProfile {
  label: string;
  tagline: string;
  description: string;
  strengths: string[];
  risks: string[];
  color: string; // Tailwind bg color
  textColor: string; // Tailwind text color
  emoji: string;
}

export const ZONE_PROFILES: Record<Zone, ZoneProfile> = {
  Dreamer: {
    label: "Dreamer",
    tagline: "Visionary thinker with long-range perspective",
    description:
      "Dreamers excel at identifying future opportunities and thinking strategically about where the organisation needs to go. They are inspiring and forward-looking but may struggle with translating vision into day-to-day execution.",
    strengths: [
      "Long-range strategic thinking",
      "Identifying emerging opportunities",
      "Inspiring others with vision",
      "Connecting dots across complex problems",
    ],
    risks: [
      "May struggle to convert ideas into action",
      "Can lose focus on present deliverables",
      "May overlook operational detail",
      "Risk of delegation without follow-through",
    ],
    color: "bg-violet-100",
    textColor: "text-violet-800",
    emoji: "🌟",
  },
  Perfectionist: {
    label: "Perfectionist",
    tagline: "Meticulous standards-keeper",
    description:
      "Perfectionists deliver exceptional quality and hold themselves and others to high standards. Their attention to detail is a powerful asset but can become a bottleneck when it prevents timely delegation or decision-making.",
    strengths: [
      "Exceptional quality of output",
      "Rigorous root-cause analysis",
      "High personal accountability",
      "Reliable and consistent delivery",
    ],
    risks: [
      "Reluctance to delegate important tasks",
      "Risk of over-engineering solutions",
      "Can slow team velocity with excessive review",
      "May create anxiety around perceived imperfection",
    ],
    color: "bg-blue-100",
    textColor: "text-blue-800",
    emoji: "🎯",
  },
  Delegate: {
    label: "Delegate",
    tagline: "Team-builder who empowers others",
    description:
      "Delegates are natural multipliers — they build capability in those around them, distribute ownership effectively, and foster collaborative environments. The risk is occasional detachment from critical detail or personal execution.",
    strengths: [
      "Building high-performing teams",
      "Empowering others with trust",
      "Strong cross-functional collaboration",
      "Scalable leadership approach",
    ],
    risks: [
      "May be too removed from key deliverables",
      "Risk of over-delegating sensitive work",
      "Can be perceived as disengaged",
      "May miss critical detail in delegated work",
    ],
    color: "bg-emerald-100",
    textColor: "text-emerald-800",
    emoji: "🤝",
  },
  Rebel: {
    label: "Rebel",
    tagline: "Bold change-agent and disruptor",
    description:
      "Rebels are drivers of transformation — they challenge the status quo, push boundaries, and bring energy and initiative to change efforts. Without structured follow-through, their disruption can outpace implementation.",
    strengths: [
      "Challenging outdated processes",
      "Driving innovation and change",
      "High initiative and bias for action",
      "Energising teams around new ideas",
    ],
    risks: [
      "May create resistance and friction",
      "Risk of change for change's sake",
      "Can struggle with rule-based environments",
      "Follow-through may lag behind enthusiasm",
    ],
    color: "bg-orange-100",
    textColor: "text-orange-800",
    emoji: "⚡",
  },
  CrisisMaker: {
    label: "Crisis Maker",
    tagline: "Thrives under pressure, may manufacture it",
    description:
      "Crisis Makers perform exceptionally well when stakes are high and urgency is real. The risk is that without genuine emergencies, they may unconsciously create pressure situations that drain team energy and sustainability.",
    strengths: [
      "Exceptional performance under pressure",
      "Fast decisive action in emergencies",
      "High resilience in chaotic situations",
      "Energising teams in genuine crises",
    ],
    risks: [
      "May generate artificial urgency",
      "Can normalise unsustainable pace",
      "Risk of burnout in self and team",
      "Struggles to perform in stable environments",
    ],
    color: "bg-red-100",
    textColor: "text-red-800",
    emoji: "🔥",
  },
  Avoider: {
    label: "Avoider",
    tagline: "Cautious stabiliser who resists disruption",
    description:
      "Avoiders provide stability and consistency to their teams. They are thoughtful and risk-averse, but may miss important opportunities for growth or change, and may struggle with conflict or difficult conversations.",
    strengths: [
      "Providing organisational stability",
      "Careful and measured decision-making",
      "Low disruption to team rhythm",
      "Consistent and predictable output",
    ],
    risks: [
      "May avoid necessary conflict or change",
      "Risk of missing strategic opportunities",
      "Can be overly cautious under ambiguity",
      "May disengage when change is unavoidable",
    ],
    color: "bg-slate-100",
    textColor: "text-slate-800",
    emoji: "🛡️",
  },
  Overwhelmed: {
    label: "Overwhelmed",
    tagline: "Over-extended and struggling with sustainability",
    description:
      "Overwhelmed individuals take on significant responsibility and care deeply about outcomes, but may struggle with prioritisation, boundary-setting, and sustainable output. Without intervention, burnout risk is elevated.",
    strengths: [
      "Deep commitment to outcomes",
      "Willingness to take on responsibility",
      "Broad organisational knowledge",
      "Strong loyalty and dedication",
    ],
    risks: [
      "High burnout risk",
      "Difficulty prioritising under load",
      "May struggle to ask for help",
      "Risk of quality decline under volume",
    ],
    color: "bg-amber-100",
    textColor: "text-amber-800",
    emoji: "⚠️",
  },
};
