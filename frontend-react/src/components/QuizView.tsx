import { useState } from "react";
import {
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { SavedQuiz } from "../types";

interface QuizViewProps {
  quiz: SavedQuiz;
}

export function QuizView({ quiz }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  const score = quiz.questions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correct_answer ? 1 : 0);
  }, 0);

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleSelect = (qIndex: number, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              {quiz.topic}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">{quiz.title}</h2>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-400">
              {submitted ? "Final Score" : "Progress"}
            </p>
            <p className="text-xl font-bold text-white">
              {submitted
                ? `${score} / ${total} (${percent}%)`
                : `${answeredCount} / ${total} answered`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              submitted
                ? percent >= 70
                  ? "bg-emerald-500"
                  : "bg-amber-500"
                : "bg-gradient-to-r from-indigo-500 to-fuchsia-500"
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
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-white/15"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Question {qIdx + 1} of {total}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-slate-100">
                    {q.question}
                  </h3>
                </div>

                {submitted && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isCorrect
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-rose-500/15 text-rose-300"
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
                    "border-white/10 bg-slate-950/60 text-slate-200 hover:border-indigo-400/50 hover:bg-slate-800/70";

                  if (!submitted && isSelected) {
                    style =
                      "border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500/50";
                  } else if (submitted && isAnswer) {
                    style =
                      "border-emerald-500/60 bg-emerald-500/15 text-emerald-200";
                  } else if (submitted && isSelected && !isAnswer) {
                    style = "border-rose-500/60 bg-rose-500/15 text-rose-200";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, opt)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${style}`}
                    >
                      <span>{opt}</span>
                      {submitted && isAnswer && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                      {submitted && isSelected && !isAnswer && (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-slate-950/70 p-3.5 text-sm text-slate-300">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  <p>
                    <span className="font-semibold text-white">Explanation: </span>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        {!submitted ? (
          <>
            <p className="text-sm text-slate-400">
              Select your answers above, then submit to see explanations.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 cursor-pointer"
            >
              Check Answers
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-bold text-white">
                You scored {score} out of {total} ({percent}%)
              </p>
              <p className="text-sm text-slate-400">
                {percent >= 80
                  ? "Awesome job! You nailed this topic."
                  : "Review the explanations above and try again anytime!"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
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