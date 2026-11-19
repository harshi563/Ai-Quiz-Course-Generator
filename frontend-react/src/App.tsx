import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Loader2,
  LogOut,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  UserPlus,
} from "lucide-react";
import {
  deleteCourse,
  deleteQuiz,
  fetchCourses,
  fetchQuizzes,
  generateCourse,
  generateQuiz,
} from "./api";
import { AuthModal } from "./components/AuthModal";
import { CourseView } from "./components/CourseView";
import { PastelCover } from "./components/PastelCovers";
import { QuizView } from "./components/QuizView";
import {
  getCurrentUser,
  loadProgress,
  logoutUser,
  markItemGenerated,
  recordQuizResult,
  toggleLessonProgress,
} from "./storage";
import type { SavedCourse, SavedQuiz, UserProfile, UserProgress } from "./types";

type PageView =
  | "library"
  | "course-studio"
  | "quiz-studio"
  | "progress"
  | "take-quiz"
  | "view-course";

export function App() {
  const [view, setView] = useState<PageView>("library");
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(() =>
    loadProgress(getCurrentUser())
  );

  // Data
  const [courses, setCourses] = useState<SavedCourse[]>([]);
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Library filters
  const [typeFilter, setTypeFilter] = useState<"all" | "courses" | "quizzes">(
    "all"
  );
  const [levelFilter, setLevelFilter] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced"
  >("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Active viewers
  const [activeCourse, setActiveCourse] = useState<SavedCourse | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<SavedQuiz | null>(null);

  // Studio generation
  const [courseTopic, setCourseTopic] = useState("");
  const [numModules, setNumModules] = useState(3);
  const [quizTopic, setQuizTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState<"course" | "quiz" | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [cList, qList] = await Promise.all([fetchCourses(), fetchQuizzes()]);
      setCourses(cList);
      setQuizzes(qList);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not load library from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAuthSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setProgress(loadProgress(loggedInUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setProgress(loadProgress(null));
  };

  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTopic.trim()) {
      setErrorMsg("Please enter a course topic.");
      return;
    }
    setErrorMsg(null);
    setGenerating("course");
    try {
      const created = await generateCourse(courseTopic.trim(), numModules);
      setCourses((prev) => [created, ...prev]);
      setProgress(markItemGenerated(user, created.id));
      setActiveCourse(created);
      setCourseTopic("");
      setView("view-course");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to generate course."
      );
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) {
      setErrorMsg("Please enter a quiz topic.");
      return;
    }
    setErrorMsg(null);
    setGenerating("quiz");
    try {
      const created = await generateQuiz(quizTopic.trim(), numQuestions);
      setQuizzes((prev) => [created, ...prev]);
      setProgress(markItemGenerated(user, created.id));
      setActiveQuiz(created);
      setQuizTopic("");
      setView("take-quiz");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to generate quiz."
      );
    } finally {
      setGenerating(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesLevel = levelFilter === "All" || c.difficulty === levelFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesLevel = levelFilter === "All" || q.difficulty === levelFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Progress Stats
  const totalLessonsCompleted = Object.values(progress.completedLessons).reduce(
    (sum, list) => sum + list.length,
    0
  );
  const avgQuizScore =
    progress.quizAttempts.length > 0
      ? Math.round(
          progress.quizAttempts.reduce((s, a) => s + a.percent, 0) /
            progress.quizAttempts.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => setView("library")}
            className="text-lg font-bold tracking-tight text-slate-900 cursor-pointer"
          >
            LearnBridge
          </button>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {(
              [
                ["library", "Library"],
                ["course-studio", "Course Studio"],
                ["quiz-studio", "Quiz Studio"],
                ["progress", "My Progress"],
              ] as const
            ).map(([key, label]) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className={`border-b-2 py-1 transition cursor-pointer ${
                    active
                      ? "border-slate-900 font-semibold text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] text-white">
                  {user.name[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden sm:inline">{user.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  className="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </button>
            )}

            <button
              type="button"
              onClick={() => setView("course-studio")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer sm:text-sm"
            >
              New Course
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {errorMsg && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW 1: LIBRARY */}
        {view === "library" && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Learning Library & Assessment Studio
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Study structured multi-module courses, track lesson mastery, and
                  generate custom multiple-choice quizzes powered by Google Gemini
                  and persisted in MongoDB Atlas.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setView("course-studio")}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  Generate Course
                </button>
                <button
                  type="button"
                  onClick={() => setView("quiz-studio")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  Generate Quiz
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
                  {(
                    [
                      ["all", `All (${courses.length + quizzes.length})`],
                      ["courses", `Courses (${courses.length})`],
                      ["quizzes", `Quizzes (${quizzes.length})`],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTypeFilter(val)}
                      className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                        typeFilter === val
                          ? "bg-white font-semibold text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
                  {(["All", "Beginner", "Intermediate", "Advanced"] as const).map(
                    (lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevelFilter(lvl)}
                        className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                          levelFilter === lvl
                            ? "bg-white font-semibold text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by topic or title..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
                Loading library from MongoDB Atlas...
              </div>
            ) : (
              <>
                {/* Courses Section */}
                {typeFilter !== "quizzes" && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900">
                        Courses
                      </h2>
                      <span className="text-xs text-slate-500">
                        {filteredCourses.length} courses
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredCourses.map((course, idx) => {
                        const totalLessons = course.modules.reduce(
                          (sum, m) => sum + m.lessons.length,
                          0
                        );
                        const doneCount = (
                          progress.completedLessons[course.id] || []
                        ).length;
                        const pct =
                          totalLessons > 0
                            ? Math.round((doneCount / totalLessons) * 100)
                            : 0;

                        return (
                          <div
                            key={course.id}
                            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                          >
                            <PastelCover index={idx} />

                            <div className="flex flex-1 flex-col justify-between p-5">
                              <div>
                                <p className="text-xs font-medium text-slate-500">
                                  {course.difficulty} · {course.modules.length}{" "}
                                  module{course.modules.length > 1 ? "s" : ""} ·{" "}
                                  {course.estimated_minutes} min
                                </p>
                                <h3 className="mt-1.5 text-base font-bold text-slate-900">
                                  {course.title}
                                </h3>
                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                                  {course.description}
                                </p>
                              </div>

                              <div className="mt-5 space-y-3">
                                <div>
                                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                                      {doneCount} / {totalLessons} lessons
                                    </span>
                                    <span>{pct}%</span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-blue-600 transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveCourse(course);
                                      setView("view-course");
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                  >
                                    Open Course
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleDeleteCourse(course.id)
                                    }
                                    title="Delete course"
                                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Quizzes Section */}
                {typeFilter !== "courses" && (
                  <section className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900">
                        Assessments & Quizzes
                      </h2>
                      <span className="text-xs text-slate-500">
                        {filteredQuizzes.length} quizzes
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredQuizzes.map((quiz) => {
                        const latestAttempt = progress.quizAttempts.find(
                          (a) => a.quizId === quiz.id
                        );

                        return (
                          <div
                            key={quiz.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-500">
                                {quiz.difficulty} · {quiz.questions.length}{" "}
                                questions · {quiz.topic}
                              </p>
                              <h3 className="mt-1.5 text-base font-bold text-slate-900">
                                {quiz.title}
                              </h3>
                              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                                Evaluate your understanding of {quiz.topic} with
                                instant answer grading and explanations.
                              </p>

                              {latestAttempt && (
                                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  Last score: {latestAttempt.score}/
                                  {latestAttempt.total} ({latestAttempt.percent}%)
                                </span>
                              )}
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuiz(quiz);
                                  setView("take-quiz");
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                                Start Quiz
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleDeleteQuiz(quiz.id)}
                                title="Delete quiz"
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* VIEW 2: COURSE STUDIO */}
        {view === "course-studio" && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> AI Course Studio
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              Generate a New Course
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Enter any subject. LearnBridge uses Google Gemini to build modules
              and lessons, then saves it to MongoDB Atlas.
            </p>

            <form onSubmit={(e) => void handleGenerateCourse(e)} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Course Topic
                </label>
                <input
                  type="text"
                  value={courseTopic}
                  onChange={(e) => setCourseTopic(e.target.value)}
                  placeholder="e.g., Python Decorators, Neural Networks, SQL Indexing"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700">
                  <span>Number of Modules</span>
                  <span className="text-blue-600">{numModules}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={numModules}
                  onChange={(e) => setNumModules(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={generating !== null}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
              >
                {generating === "course" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Course with Gemini...
                  </>
                ) : (
                  "Generate & Save Course"
                )}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: QUIZ STUDIO */}
        {view === "quiz-studio" && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <Sparkles className="h-3.5 w-3.5" /> AI Quiz Studio
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              Generate a New Assessment Quiz
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Create a custom multiple-choice quiz saved straight to MongoDB
              Atlas.
            </p>

            <form onSubmit={(e) => void handleGenerateQuiz(e)} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Quiz Topic
                </label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g., Python Lists, REST APIs, Database Normalization"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700">
                  <span>Number of Questions</span>
                  <span className="text-blue-600">{numQuestions}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={generating !== null}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
              >
                {generating === "quiz" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Quiz with Gemini...
                  </>
                ) : (
                  "Generate & Start Quiz"
                )}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 4: MY PROGRESS & RESULTS */}
        {view === "progress" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user ? `${user.name}'s Learning Progress` : "My Progress & Results"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Track every course you study, AI items you generated, and all
                quiz results.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-medium text-slate-500">
                  Lessons Completed
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalLessonsCompleted}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-blue-50/60 p-5">
                <p className="text-xs font-medium text-blue-700">
                  Quizzes Taken
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {progress.quizAttempts.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-emerald-50/60 p-5">
                <p className="text-xs font-medium text-emerald-700">
                  Average Quiz Score
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {avgQuizScore}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-violet-50/60 p-5">
                <p className="text-xs font-medium text-violet-700">
                  Generated by You
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {progress.generatedIds.length}
                </p>
              </div>
            </div>

            {/* Quiz Attempts History */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Trophy className="h-5 w-5 text-amber-500" />
                Quiz Results History
              </h2>
              {progress.quizAttempts.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No quizzes taken yet. Start any quiz from the Library!
                </p>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {progress.quizAttempts.map((a, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {a.quizTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {a.topic} ·{" "}
                          {new Date(a.takenAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          a.percent >= 70
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {a.score} / {a.total} ({a.percent}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: COURSE VIEWER */}
        {view === "view-course" && activeCourse && (
          <CourseView
            key={activeCourse.id}
            course={activeCourse}
            completedLessons={progress.completedLessons[activeCourse.id] || []}
            onToggleLesson={(lessonKey) =>
              setProgress(toggleLessonProgress(user, activeCourse.id, lessonKey))
            }
            onBack={() => setView("library")}
          />
        )}

        {/* VIEW 6: QUIZ PLAYER */}
        {view === "take-quiz" && activeQuiz && (
          <QuizView
            key={activeQuiz.id}
            quiz={activeQuiz}
            onBack={() => setView("library")}
            onSubmitAttempt={(score, total, percent) =>
              setProgress(
                recordQuizResult(user, {
                  quizId: activeQuiz.id,
                  quizTitle: activeQuiz.title,
                  topic: activeQuiz.topic,
                  score,
                  total,
                  percent,
                  takenAt: new Date().toISOString(),
                })
              )
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50 py-5 text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <span>LearnBridge — AI Quiz and Course Generator</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setView("library")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setView("course-studio")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Course Studio
            </button>
            <button
              type="button"
              onClick={() => setView("quiz-studio")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Quiz Studio
            </button>
            <button
              type="button"
              onClick={() => setView("progress")}
              className="hover:text-slate-900 cursor-pointer"
            >
              My Progress
            </button>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;