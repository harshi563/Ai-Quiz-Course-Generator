import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  fetchCourses,
  fetchQuizzes,
  generateCourse,
  generateQuiz,
} from "./api";
import { CourseView } from "./components/CourseView";
import { QuizView } from "./components/QuizView";
import type { SavedCourse, SavedQuiz } from "./types";

type Tab = "create" | "quizzes" | "courses";

const SAMPLE_TOPICS = [
  "Python Loops",
  "Machine Learning",
  "Solar System",
  "SQL Basics",
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("create");

  // Generator state
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [numModules, setNumModules] = useState(4);
  const [generating, setGenerating] = useState<"quiz" | "course" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeQuiz, setActiveQuiz] = useState<SavedQuiz | null>(null);
  const [activeCourse, setActiveCourse] = useState<SavedCourse | null>(null);

  // Saved library state
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSavedQuiz, setSelectedSavedQuiz] = useState<SavedQuiz | null>(
    null
  );
  const [selectedSavedCourse, setSelectedSavedCourse] =
    useState<SavedCourse | null>(null);

  const loadLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const [quizzes, courses] = await Promise.all([
        fetchQuizzes(),
        fetchCourses(),
      ]);
      setSavedQuizzes(quizzes);
      setSavedCourses(courses);
      if (quizzes.length > 0 && !selectedSavedQuiz) {
        setSelectedSavedQuiz(quizzes[0]);
      }
      if (courses.length > 0 && !selectedSavedCourse) {
        setSelectedSavedCourse(courses[0]);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load saved library."
      );
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    void loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setErrorMsg("Please enter a topic first.");
      return;
    }
    setErrorMsg(null);
    setGenerating("quiz");
    try {
      const quiz = await generateQuiz(topic.trim(), numQuestions);
      setActiveQuiz(quiz);
      setActiveCourse(null);
      setSavedQuizzes((prev) => [quiz, ...prev]);
      setSelectedSavedQuiz(quiz);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to generate quiz."
      );
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateCourse = async () => {
    if (!topic.trim()) {
      setErrorMsg("Please enter a topic first.");
      return;
    }
    setErrorMsg(null);
    setGenerating("course");
    try {
      const course = await generateCourse(topic.trim(), numModules);
      setActiveCourse(course);
      setActiveQuiz(null);
      setSavedCourses((prev) => [course, ...prev]);
      setSelectedSavedCourse(course);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to generate course."
      );
    } finally {
      setGenerating(null);
    }
  };

  const filteredQuizzes = savedQuizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = savedCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-64 right-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-md shadow-indigo-500/25">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                LearnForge AI
              </span>
              <p className="hidden text-xs text-slate-400 sm:block">
                Quiz & Course Studio
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer sm:text-sm ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quizzes")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer sm:text-sm ${
                activeTab === "quizzes"
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              Quizzes ({savedQuizzes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer sm:text-sm ${
                activeTab === "courses"
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Courses ({savedCourses.length})
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs font-semibold text-rose-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: CREATE */}
        {activeTab === "create" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/60 p-6 shadow-2xl sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by Gemini AI & MongoDB Atlas
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Learn any topic in seconds.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Type any subject below to generate an interactive multiple-choice
                quiz or a multi-module course—automatically saved to your library.
              </p>

              {/* Sample Topic Chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-400">
                  Try:
                </span>
                {SAMPLE_TOPICS.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setTopic(sample)}
                    className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-indigo-400/50 hover:bg-slate-800 cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Topic Input */}
              <div className="mt-4">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter any topic (e.g., Python Decorators, Photosynthesis, World War II)..."
                  className="w-full rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 sm:text-base"
                />
              </div>

              {/* Two Generator Cards */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {/* Quiz Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">
                          Multiple-Choice Quiz
                        </h2>
                        <p className="text-xs text-slate-400">
                          Instant scoring & explanations
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-300">
                        <span>Questions</span>
                        <span className="font-bold text-indigo-300">
                          {numQuestions}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={15}
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={generating !== null}
                    onClick={() => void handleGenerateQuiz()}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
                  >
                    {generating === "quiz" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        Generate Quiz
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Course Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">
                          Structured Course
                        </h2>
                        <p className="text-xs text-slate-400">
                          Modules with bite-sized lessons
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-300">
                        <span>Modules</span>
                        <span className="font-bold text-fuchsia-300">
                          {numModules}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        value={numModules}
                        onChange={(e) => setNumModules(Number(e.target.value))}
                        className="w-full accent-fuchsia-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={generating !== null}
                    onClick={() => void handleGenerateCourse()}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
                  >
                    {generating === "course" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Building Course...
                      </>
                    ) : (
                      <>
                        Generate Course
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Generated Result */}
            {activeQuiz && <QuizView key={activeQuiz.id} quiz={activeQuiz} />}
            {activeCourse && (
              <CourseView key={activeCourse.id} course={activeCourse} />
            )}
          </div>
        )}

        {/* TAB 2: SAVED QUIZZES */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search saved quizzes by title or topic..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => void loadLibrary()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingLibrary ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
                No saved quizzes found. Create your first one in the Create tab!
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="space-y-2">
                  {filteredQuizzes.map((q) => {
                    const isSelected = selectedSavedQuiz?.id === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedSavedQuiz(q)}
                        className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/15"
                            : "border-white/10 bg-slate-900/60 hover:border-white/20"
                        }`}
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-white">
                          {q.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {q.topic} • {q.questions.length} Qs
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div>
                  {selectedSavedQuiz && (
                    <QuizView
                      key={selectedSavedQuiz.id}
                      quiz={selectedSavedQuiz}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED COURSES */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search saved courses by title or topic..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-fuchsia-500"
                />
              </div>
              <button
                type="button"
                onClick={() => void loadLibrary()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingLibrary ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
                No saved courses found. Create your first one in the Create tab!
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="space-y-2">
                  {filteredCourses.map((c) => {
                    const isSelected = selectedSavedCourse?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedSavedCourse(c)}
                        className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-fuchsia-500 bg-fuchsia-500/15"
                            : "border-white/10 bg-slate-900/60 hover:border-white/20"
                        }`}
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-white">
                          {c.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {c.topic} • {c.modules.length} modules
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div>
                  {selectedSavedCourse && (
                    <CourseView
                      key={selectedSavedCourse.id}
                      course={selectedSavedCourse}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;