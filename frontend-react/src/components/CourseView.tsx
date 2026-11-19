import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import type { SavedCourse } from "../types";

interface CourseViewProps {
  course: SavedCourse;
  completedLessons: string[];
  onToggleLesson: (lessonKey: string) => void;
  onBack: () => void;
}

export function CourseView({
  course,
  completedLessons,
  onToggleLesson,
  onBack,
}: CourseViewProps) {
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({
    "0-0": true,
  });

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  const completedCount = completedLessons.length;
  const percent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </button>

      {/* Course Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 font-semibold">
            {course.difficulty}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> {course.modules.length} modules
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.estimated_minutes} min
          </span>
        </div>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {course.title}
        </h2>
        {course.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {course.description}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
            <span>
              {completedCount} / {totalLessons} lessons completed
            </span>
            <span className="font-semibold text-slate-800">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {course.modules.map((mod, mIdx) => (
          <div
            key={mIdx}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                {mod.module_number}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
            </div>

            <div className="space-y-2.5">
              {mod.lessons.map((lesson, lIdx) => {
                const key = `${mIdx}-${lIdx}`;
                const isOpen = !!openLessons[key];
                const isDone = completedLessons.includes(key);

                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenLessons((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        className="flex flex-1 items-center gap-2 text-left text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                        )}
                        <span>{lesson.title}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleLesson(key)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          isDone
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {isDone ? "Completed" : "Mark Complete"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-700 space-y-2">
                        {lesson.summary && (
                          <p className="rounded-lg bg-blue-50/70 px-3 py-2 text-xs font-medium text-blue-800">
                            Summary: {lesson.summary}
                          </p>
                        )}
                        <p className="whitespace-pre-line">{lesson.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}