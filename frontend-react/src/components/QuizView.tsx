import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { SavedQuiz } from "../types";

interface QuizViewProps {
  quiz: SavedQuiz;
  onBack: () => void;
  onSubmitAttempt: (score: number, total: number, percent: number) => void;
}

export function QuizView({ quiz, onBack, onSubmitAttempt }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const score = quiz.questions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correct_answer ? 1 : 0),
    0
  );
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmitAttempt(score, total, percent);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </button>

      {/* Quiz Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {quiz.difficulty} · {total} questions · {quiz.topic}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {quiz.title}
            </h2>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-2 text-right border border-slate-200">
            <p className="text-xs text-slate-500">
              {submitted ? "Result" : "Progress"}
            </p>
            <p className="text-lg font-bold text-slate-900">
              {submitted
                ? `${score} / ${total} (${percent}%)`
                : `${answeredCount} / ${total}`}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              submitted
                ? percent >= 70
                  ? "bg-emerald-500"
                  : "bg-amber-500"
                : "bg-blue-600"
            }`}
            style={{
              width: `${
                submitted
                  ? percent
                  : total > 0
                  ? Math.round((answeredCount / total) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((q, qIdx) => {
          const chosen = answers[qIdx];
          const isCorrect = chosen === q.correct_answer;

          return (
            <div
              key={qIdx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Question {qIdx + 1} of {total}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {q.question}
                  </h3>
                </div>

                {submitted && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />{" "}
                        {chosen ? "Incorrect" : "Skipped"}
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="grid gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = chosen === opt;
                  const isAnswer = opt === q.correct_answer;

                  let style =
                    "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40";
                  if (!submitted && isSelected) {
                    style =
                      "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600";
                  } else if (submitted && isAnswer) {
                    style =
                      "border-emerald-500 bg-emerald-50 text-emerald-900";
                  } else if (submitted && isSelected && !isAnswer) {
                    style = "border-rose-400 bg-rose-50 text-rose-900";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [qIdx]: opt }))
                      }
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${style}`}
                    >
                      <span>{opt}</span>
                      {submitted && isAnswer && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {submitted && isSelected && !isAnswer && (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <p>
                    <span className="font-semibold text-slate-900">
                      Explanation:{" "}
                    </span>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        {!submitted ? (
          <>
            <p className="text-sm text-slate-500">
              Your result will be saved automatically to My Progress.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Submit Answers
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-bold text-slate-900">
                Score saved: {score} / {total} ({percent}%)
              </p>
              <p className="text-sm text-slate-500">
                {percent >= 75
                  ? "Great mastery! Recorded in your progress log."
                  : "Review the explanations above and try again anytime."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
}