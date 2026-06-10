"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@prisma/client";
import { DIMENSION_LABELS } from "@/lib/scoring/types";
import type { Dimension } from "@/lib/scoring/types";

interface Props {
  assignmentId: string;
  questions: Question[];
  savedAnswers: Record<string, number>;
}

const SCALE_LABELS: Record<number, string> = {
  1: "Never",
  2: "",
  3: "Rarely",
  4: "",
  5: "Sometimes",
  6: "",
  7: "Often",
  8: "",
  9: "",
  10: "Always",
};

export default function QuestionStepper({ assignmentId, questions, savedAnswers }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(savedAnswers);
  const [current, setCurrent] = useState(() => {
    // Resume from last unanswered
    const answered = Object.keys(savedAnswers);
    const firstUnanswered = questions.findIndex((q) => !answered.includes(q.id));
    return Math.max(0, firstUnanswered === -1 ? questions.length - 1 : firstUnanswered);
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const q = questions[current];

  const triggerSave = useCallback(
    async (newAnswers: Record<string, number>) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await fetch(`/api/assessment/${assignmentId}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: newAnswers,
              progress: { currentIndex: current, answeredCount: Object.keys(newAnswers).length },
            }),
          });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
        }
      }, 800);
    },
    [assignmentId, current]
  );

  function handleAnswer(score: number) {
    const newAnswers = { ...answers, [q.id]: score };
    setAnswers(newAnswers);

    // Auto-save every 5 answers or on update
    if (Object.keys(newAnswers).length % 5 === 0 || answers[q.id] !== score) {
      triggerSave(newAnswers);
    }
  }

  function goNext() {
    if (current < totalQuestions - 1) setCurrent(current + 1);
  }
  function goPrev() {
    if (current > 0) setCurrent(current - 1);
  }

  async function handleSubmit() {
    if (totalAnswered < totalQuestions) return;
    setSubmitting(true);
    try {
      // Final save
      await fetch(`/api/assessment/${assignmentId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          progress: { currentIndex: current, answeredCount: totalAnswered },
        }),
      });

      const res = await fetch(`/api/assessment/${assignmentId}/submit`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        router.push(`/dashboard/report/${data.resultId}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Group questions by dimension for progress
  const dimensionGroups = questions.reduce<Record<string, { total: number; answered: number }>>(
    (acc, q) => {
      const dim = q.dimension as Dimension;
      if (!acc[dim]) acc[dim] = { total: 0, answered: 0 };
      acc[dim].total++;
      if (answers[q.id]) acc[dim].answered++;
      return acc;
    },
    {}
  );

  const currentScore = answers[q.id];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Question {current + 1} of {totalQuestions}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              saveStatus === "saving"
                ? "bg-amber-100 text-amber-700"
                : saveStatus === "saved"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Auto-save on"}
          </span>
        </div>

        {/* Dimension progress dots */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(dimensionGroups).map(([dim, { total, answered }]) => (
            <div key={dim} title={DIMENSION_LABELS[dim as Dimension]} className="flex gap-0.5">
              {Array.from({ length: total }).map((_, i) => {
                const qIdx = questions.findIndex(
                  (q) => q.dimension === dim && questions.filter((qq) => qq.dimension === dim).indexOf(q) === i
                );
                const isAnswered = i < answered;
                return (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-sm ${isAnswered ? "bg-indigo-500" : "bg-gray-200"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {totalAnswered}/{totalQuestions} answered
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="mb-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {DIMENSION_LABELS[q.dimension as Dimension]}
          </span>
        </div>
        <p className="text-lg text-gray-900 leading-relaxed mb-8">{q.text}</p>

        {/* 1-10 scale */}
        <div className="space-y-3">
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => handleAnswer(n)}
                className={`h-12 rounded-lg text-sm font-semibold transition-all ${
                  currentScore === n
                    ? "bg-indigo-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-0.5">
            <span>1 = Never / Strongly Disagree</span>
            <span>10 = Always / Strongly Agree</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        {current < totalQuestions - 1 ? (
          <button
            onClick={goNext}
            disabled={!answers[q.id]}
            className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={totalAnswered < totalQuestions || submitting}
            className="px-6 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? "Submitting…" : `Submit Assessment (${totalAnswered}/${totalQuestions})`}
          </button>
        )}
      </div>
    </div>
  );
}
