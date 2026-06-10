import type { Dimension } from "./types";

export interface QuestionDef {
  id: string; // used as seed key
  dimension: Dimension;
  dimensionLabel: string;
  text: string;
  orderIndex: number;
}

export const QUESTIONS: QuestionDef[] = [
  // A. Strategic Thinking
  {
    id: "A1",
    dimension: "A",
    dimensionLabel: "Strategic Thinking",
    text: "I regularly step back from day-to-day tasks to think about long-term direction and implications.",
    orderIndex: 1,
  },
  {
    id: "A2",
    dimension: "A",
    dimensionLabel: "Strategic Thinking",
    text: "When making decisions, I actively consider how they align with broader organisational goals.",
    orderIndex: 2,
  },
  {
    id: "A3",
    dimension: "A",
    dimensionLabel: "Strategic Thinking",
    text: "I anticipate future challenges and prepare contingency plans before problems arise.",
    orderIndex: 3,
  },
  {
    id: "A4",
    dimension: "A",
    dimensionLabel: "Strategic Thinking",
    text: "I connect information from different areas to identify emerging patterns and opportunities.",
    orderIndex: 4,
  },

  // B. Attention to Detail
  {
    id: "B1",
    dimension: "B",
    dimensionLabel: "Attention to Detail",
    text: "I review my work carefully to catch errors before submitting or presenting it.",
    orderIndex: 5,
  },
  {
    id: "B2",
    dimension: "B",
    dimensionLabel: "Attention to Detail",
    text: "I track small but important details even when working under tight deadlines.",
    orderIndex: 6,
  },
  {
    id: "B3",
    dimension: "B",
    dimensionLabel: "Attention to Detail",
    text: "When processes break down, I trace the root cause methodically rather than patching symptoms.",
    orderIndex: 7,
  },
  {
    id: "B4",
    dimension: "B",
    dimensionLabel: "Attention to Detail",
    text: "I maintain accuracy and quality standards even when speed is prioritised.",
    orderIndex: 8,
  },

  // C. Delegation Capability
  {
    id: "C1",
    dimension: "C",
    dimensionLabel: "Delegation Capability",
    text: "I assign tasks to team members based on their strengths rather than doing the work myself.",
    orderIndex: 9,
  },
  {
    id: "C2",
    dimension: "C",
    dimensionLabel: "Delegation Capability",
    text: "I provide clear outcomes and context when delegating rather than micromanaging the method.",
    orderIndex: 10,
  },
  {
    id: "C3",
    dimension: "C",
    dimensionLabel: "Delegation Capability",
    text: "I feel comfortable handing over important responsibilities to capable colleagues.",
    orderIndex: 11,
  },
  {
    id: "C4",
    dimension: "C",
    dimensionLabel: "Delegation Capability",
    text: "I follow up on delegated work at appropriate intervals without taking it back unnecessarily.",
    orderIndex: 12,
  },

  // D. Stress Handling
  {
    id: "D1",
    dimension: "D",
    dimensionLabel: "Stress Handling",
    text: "I remain calm and focused when multiple urgent demands arrive simultaneously.",
    orderIndex: 13,
  },
  {
    id: "D2",
    dimension: "D",
    dimensionLabel: "Stress Handling",
    text: "After a stressful period, I recover my energy and motivation relatively quickly.",
    orderIndex: 14,
  },
  {
    id: "D3",
    dimension: "D",
    dimensionLabel: "Stress Handling",
    text: "I make clear-headed decisions even when pressure is high and stakes are significant.",
    orderIndex: 15,
  },
  {
    id: "D4",
    dimension: "D",
    dimensionLabel: "Stress Handling",
    text: "I manage my emotional reactions effectively so they do not disrupt my team.",
    orderIndex: 16,
  },

  // E. Initiative
  {
    id: "E1",
    dimension: "E",
    dimensionLabel: "Initiative",
    text: "I proactively identify and address problems before I am asked to.",
    orderIndex: 17,
  },
  {
    id: "E2",
    dimension: "E",
    dimensionLabel: "Initiative",
    text: "I introduce new ideas or process improvements without waiting for permission.",
    orderIndex: 18,
  },
  {
    id: "E3",
    dimension: "E",
    dimensionLabel: "Initiative",
    text: "When I see an unmet need, I take ownership of solving it even if it is outside my role.",
    orderIndex: 19,
  },
  {
    id: "E4",
    dimension: "E",
    dimensionLabel: "Initiative",
    text: "I push forward on goals even when I encounter resistance or lack of support.",
    orderIndex: 20,
  },

  // F. Change Acceptance
  {
    id: "F1",
    dimension: "F",
    dimensionLabel: "Change Acceptance",
    text: "I adapt my approach quickly when priorities or circumstances shift.",
    orderIndex: 21,
  },
  {
    id: "F2",
    dimension: "F",
    dimensionLabel: "Change Acceptance",
    text: "I view organisational change as an opportunity rather than a disruption.",
    orderIndex: 22,
  },
  {
    id: "F3",
    dimension: "F",
    dimensionLabel: "Change Acceptance",
    text: "I actively help others navigate transitions rather than resisting or avoiding them.",
    orderIndex: 23,
  },
  {
    id: "F4",
    dimension: "F",
    dimensionLabel: "Change Acceptance",
    text: "I experiment with new methods even when familiar approaches feel more comfortable.",
    orderIndex: 24,
  },

  // G. Accountability
  {
    id: "G1",
    dimension: "G",
    dimensionLabel: "Accountability",
    text: "I take full responsibility for outcomes in my area, including failures.",
    orderIndex: 25,
  },
  {
    id: "G2",
    dimension: "G",
    dimensionLabel: "Accountability",
    text: "I follow through on commitments reliably, even when circumstances become difficult.",
    orderIndex: 26,
  },
  {
    id: "G3",
    dimension: "G",
    dimensionLabel: "Accountability",
    text: "I communicate proactively when a deadline or commitment is at risk, rather than waiting.",
    orderIndex: 27,
  },
  {
    id: "G4",
    dimension: "G",
    dimensionLabel: "Accountability",
    text: "I hold my team members accountable for agreed standards without being passive or avoidant.",
    orderIndex: 28,
  },

  // H. Crisis Dependence
  {
    id: "H1",
    dimension: "H",
    dimensionLabel: "Crisis Dependence",
    text: "I perform at my best when there is a sense of urgency or an active problem to solve.",
    orderIndex: 29,
  },
  {
    id: "H2",
    dimension: "H",
    dimensionLabel: "Crisis Dependence",
    text: "I feel most energised and engaged during high-stakes situations or emergencies.",
    orderIndex: 30,
  },
  {
    id: "H3",
    dimension: "H",
    dimensionLabel: "Crisis Dependence",
    text: "I find it difficult to sustain focus and motivation during calm, routine periods.",
    orderIndex: 31,
  },
  {
    id: "H4",
    dimension: "H",
    dimensionLabel: "Crisis Dependence",
    text: "I tend to create a sense of urgency in my team even when the situation does not require it.",
    orderIndex: 32,
  },

  // I. Collaboration
  {
    id: "I1",
    dimension: "I",
    dimensionLabel: "Collaboration",
    text: "I actively seek out different perspectives and include others in decision-making.",
    orderIndex: 33,
  },
  {
    id: "I2",
    dimension: "I",
    dimensionLabel: "Collaboration",
    text: "I share information, resources, and credit openly with colleagues and peers.",
    orderIndex: 34,
  },
  {
    id: "I3",
    dimension: "I",
    dimensionLabel: "Collaboration",
    text: "I invest time in building relationships across teams, not just within my own.",
    orderIndex: 35,
  },
  {
    id: "I4",
    dimension: "I",
    dimensionLabel: "Collaboration",
    text: "I adapt my communication style to work effectively with people of different preferences.",
    orderIndex: 36,
  },

  // J. Workload Management
  {
    id: "J1",
    dimension: "J",
    dimensionLabel: "Workload Management",
    text: "I accurately estimate effort and allocate my time to match priorities.",
    orderIndex: 37,
  },
  {
    id: "J2",
    dimension: "J",
    dimensionLabel: "Workload Management",
    text: "I recognise when my workload is unsustainable and take steps to address it.",
    orderIndex: 38,
  },
  {
    id: "J3",
    dimension: "J",
    dimensionLabel: "Workload Management",
    text: "I complete high-priority tasks without allowing lower-priority ones to crowd them out.",
    orderIndex: 39,
  },
  {
    id: "J4",
    dimension: "J",
    dimensionLabel: "Workload Management",
    text: "I maintain consistent output quality even when I have a heavy volume of work.",
    orderIndex: 40,
  },
];
