import type { QuizAttempt, UserProfile, UserProgress } from "./types";

const USERS_KEY = "learnbridge_users_v1";
const SESSION_KEY = "learnbridge_current_user_v1";
const PROGRESS_PREFIX = "learnbridge_progress_v1_";

function emptyProgress(): UserProgress {
  return { completedLessons: {}, quizAttempts: [], generatedIds: [] };
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function signUpUser(
  name: string,
  email: string,
  password: string
): { user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users: UserProfile[] = JSON.parse(
    localStorage.getItem(USERS_KEY) || "[]"
  );

  if (users.some((u) => u.email === cleanEmail)) {
    return { error: "An account with this email already exists. Please log in." };
  }

  const newUser: UserProfile = {
    name: name.trim(),
    email: cleanEmail,
    password,
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return { user: newUser };
}

export function loginUser(
  email: string,
  password: string
): { user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users: UserProfile[] = JSON.parse(
    localStorage.getItem(USERS_KEY) || "[]"
  );
  const found = users.find(
    (u) => u.email === cleanEmail && u.password === password
  );

  if (!found) {
    return { error: "Invalid email or password." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(found));
  return { user: found };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

function progressStorageKey(user: UserProfile | null): string {
  return `${PROGRESS_PREFIX}${user ? user.email : "guest"}`;
}

export function loadProgress(user: UserProfile | null): UserProgress {
  try {
    const raw = localStorage.getItem(progressStorageKey(user));
    return raw ? (JSON.parse(raw) as UserProgress) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(
  user: UserProfile | null,
  progress: UserProgress
): void {
  localStorage.setItem(progressStorageKey(user), JSON.stringify(progress));
}

export function toggleLessonProgress(
  user: UserProfile | null,
  courseId: string,
  lessonKey: string
): UserProgress {
  const current = loadProgress(user);
  const existing = current.completedLessons[courseId] || [];
  const updated = existing.includes(lessonKey)
    ? existing.filter((k) => k !== lessonKey)
    : [...existing, lessonKey];

  const next: UserProgress = {
    ...current,
    completedLessons: { ...current.completedLessons, [courseId]: updated },
  };
  saveProgress(user, next);
  return next;
}

export function recordQuizResult(
  user: UserProfile | null,
  attempt: QuizAttempt
): UserProgress {
  const current = loadProgress(user);
  const next: UserProgress = {
    ...current,
    quizAttempts: [attempt, ...current.quizAttempts],
  };
  saveProgress(user, next);
  return next;
}

export function markItemGenerated(
  user: UserProfile | null,
  itemId: string
): UserProgress {
  const current = loadProgress(user);
  if (current.generatedIds.includes(itemId)) return current;
  const next: UserProgress = {
    ...current,
    generatedIds: [itemId, ...current.generatedIds],
  };
  saveProgress(user, next);
  return next;
}