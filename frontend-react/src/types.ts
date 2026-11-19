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
  modules: CourseModule[];
}