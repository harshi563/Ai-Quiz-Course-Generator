export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface SavedQuiz {
  id: string;
  created_at: string;
  topic: string;
  title: string;
  difficulty: string;
  estimated_minutes: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  title: string;
  summary: string;
  content: string;
}

export interface CourseModule {
  module_number: number;
  title: string;
  lessons: Lesson[];
}

export interface SavedCourse {
  id: string;
  created_at: string;
  topic: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_minutes: number;
  modules: CourseModule[];
}

export interface UserProfile {
  name: string;
  email: string;
  password: string;
}

export interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  topic: string;
  score: number;
  total: number;
  percent: number;
  takenAt: string;
}

export interface UserProgress {
  completedLessons: Record<string, string[]>;
  quizAttempts: QuizAttempt[];
  generatedIds: string[];
}