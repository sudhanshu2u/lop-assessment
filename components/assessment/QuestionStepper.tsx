"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@prisma/client";
import { DIMENSION_LABELS } from "@/lib/scoring/types";
import type { Dimension } from "@/lib/scoring/types";
import { QUESTIONS } from "@/lib/scoring/dimensions";

interface Props {
  assignmentId: string;
  questions: Question[];
  savedAnswers: Record<string, number>;
}

const DIMENSION_LABELS_HI: Record<string, string> = {
  A: "रणनीतिक सोच", B: "विवरण पर ध्यान", C: "प्रत्यायोजन क्षमता",
  D: "तनाव प्रबंधन", E: "पहल", F: "परिवर्तन स्वीकृति",
  G: "जवाबदेही", H: "संकट निर्भरता", I: "सहयोग", J: "कार्यभार प्रबंधन",
};

const hiMap: Record<string, string> = Object.fromEntries(
  QUESTIONS.map((q) => [`version-1-0-${q.id}`, q.textHi])
);

export default function QuestionStepper({ assignmentId, questions, savedAnswers }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(savedAnswers);
  const [current, setCurrent] = useState(() => {
    const answered = Object.keys(savedAnswers);
    const firstUnanswered = questions.findIndex((q) => !answered.includes(q.id));
    return Math.max(0, firstUnanswered === -1 ? questions.length - 1 : firstUnanswered);
  });
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const q = questions[current];
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100);
  const currentScore = answers[q.id];

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
    if (Object.keys(newAnswers).length % 5 === 0 || answers[q.id] !== score) {
      triggerSave(newAnswers);
    }
    // Auto-advance after a short delay
    if (current < totalQuestions - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 350);
    }
  }

  function goNext() { if (current < totalQuestions - 1) setCurrent(current + 1); }
  function goPrev() { if (current > 0) setCurrent(current - 1); }

  async function handleSubmit() {
    if (totalAnswered < totalQuestions) return;
    setSubmitting(true);
    try {
      await fetch(`/api/assessment/${assignmentId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, progress: { currentIndex: current, answeredCount: totalAnswered } }),
      });
      const res = await fetch(`/api/assessment/${assignmentId}/submit`, { method: "POST" });
      const data = await res.json();
      if (data.ok) router.push(`/dashboard/report/${data.resultId}`);
    } finally {
      setSubmitting(false);
    }
  }

  const dimLabel = lang === "hi"
    ? (DIMENSION_LABELS_HI[q.dimension] ?? DIMENSION_LABELS[q.dimension as Dimension])
    : DIMENSION_LABELS[q.dimension as Dimension];

  const questionText = lang === "hi" ? (hiMap[q.id] ?? q.text) : q.text;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Top bar: progress + lang toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{totalAnswered}</span> / {totalQuestions} answered
        </div>
        {/* Language toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === "en" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("hi")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === "hi" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{progressPct}% complete</span>
          <span className={`${saveStatus === "saving" ? "text-amber-500" : saveStatus === "saved" ? "text-emerald-600" : "text-gray-400"}`}>
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Auto-save on"}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-0.5">
              {lang === "hi" ? "आयाम" : "Dimension"}
            </p>
            <p className="text-white font-semibold text-sm">{dimLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-0.5">
              {lang === "hi" ? "प्रश्न" : "Question"}
            </p>
            <p className="text-white font-semibold text-sm">{current + 1} / {totalQuestions}</p>
          </div>
        </div>

        {/* Question text */}
        <div className="px-8 py-7">
          <p className={`text-gray-900 leading-relaxed mb-8 ${lang === "hi" ? "text-xl" : "text-lg"}`}>
            {questionText}
          </p>

          {/* Scale */}
          <div className="space-y-4">
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handleAnswer(n)}
                  className={`h-12 rounded-xl text-sm font-bold transition-all duration-150 ${
                    currentScore === n
                      ? "bg-indigo-600 text-white shadow-lg scale-110 ring-2 ring-indigo-300"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-0.5">
              <span>{lang === "hi" ? "१ = कभी नहीं" : "1 = Never"}</span>
              <span>{lang === "hi" ? "१० = हमेशा" : "10 = Always"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          ← {lang === "hi" ? "पिछला" : "Previous"}
        </button>

        {current < totalQuestions - 1 ? (
          <button
            onClick={goNext}
            disabled={!answers[q.id]}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {lang === "hi" ? "अगला" : "Next"} →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={totalAnswered < totalQuestions || submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {submitting
              ? (lang === "hi" ? "सबमिट हो रहा है…" : "Submitting…")
              : (lang === "hi" ? `मूल्यांकन जमा करें (${totalAnswered}/${totalQuestions})` : `Submit Assessment (${totalAnswered}/${totalQuestions})`)}
          </button>
        )}
      </div>
    </div>
  );
}
