import type { SavedCourse, SavedQuiz } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data.detail) {
        message = data.detail;
      }
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function generateQuiz(
  topic: string,
  numQuestions: number
): Promise<SavedQuiz> {
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, num_questions: numQuestions }),
  });
  return handleResponse<SavedQuiz>(res);
}

export async function generateCourse(
  topic: string,
  numModules: number
): Promise<SavedCourse> {
  const res = await fetch(`${API_BASE}/generate-course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, num_modules: numModules }),
  });
  return handleResponse<SavedCourse>(res);
}

export async function fetchQuizzes(): Promise<SavedQuiz[]> {
  const res = await fetch(`${API_BASE}/quizzes`);
  return handleResponse<SavedQuiz[]>(res);
}

export async function fetchCourses(): Promise<SavedCourse[]> {
  const res = await fetch(`${API_BASE}/courses`);
  return handleResponse<SavedCourse[]>(res);
}