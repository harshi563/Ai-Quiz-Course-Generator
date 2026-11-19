import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
} from "lucide-react";
import type { SavedCourse } from "../types";

interface CourseViewProps {
  course: SavedCourse;
}

export function CourseView({ course }: CourseViewProps) {
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({
    "0-0": true,
  });

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  const toggleLesson = (key: string) => {
    setOpenLessons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-fuchsia-300 ring-1 ring-fuchsia-500/30">
          <BookOpen className="h-3.5 w-3.5" />
          {course.topic}
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white">{course.title}</h2>
        {course.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {course.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-slate-200">
            <Layers className="h-4 w-4 text-fuchsia-400" />
            {course.modules.length} Modules
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-slate-200">
            <FileText className="h-4 w-4 text-indigo-400" />
            {totalLessons} Lessons
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        {course.modules.map((mod, mIdx) => (
          <div
            key={mIdx}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-sm font-bold text-white">
                {mod.module_number}
              </span>
              <h3 className="text-lg font-bold text-white">{mod.title}</h3>
            </div>

            <div className="space-y-2.5">
              {mod.lessons.map((lesson, lIdx) => {
                const key = `${mIdx}-${lIdx}`;
                const isOpen = !!openLessons[key];

                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60"
                  >
                    <button
                      type="button"
                      onClick={() => toggleLesson(key)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-800/50 cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-slate-100">
                        {lesson.title}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10 px-4 py-4 text-sm leading-relaxed text-slate-300 space-y-2">
                        {lesson.summary && (
                          <p className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 ring-1 ring-indigo-500/20">
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