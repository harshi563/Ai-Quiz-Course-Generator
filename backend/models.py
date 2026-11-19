from pydantic import BaseModel, Field


# --- Quiz Models ---
class QuizRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=150)
    num_questions: int = Field(default=5, ge=1, le=15)


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: str
    explanation: str


class Quiz(BaseModel):
    topic: str
    title: str
    difficulty: str = "Beginner"
    estimated_minutes: int = 10
    questions: list[QuizQuestion]


class SavedQuiz(Quiz):
    id: str
    created_at: str


# --- Course Models ---
class CourseRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=150)
    num_modules: int = Field(default=4, ge=1, le=8)


class Lesson(BaseModel):
    title: str
    summary: str
    content: str


class CourseModule(BaseModel):
    module_number: int
    title: str
    lessons: list[Lesson]


class Course(BaseModel):
    topic: str
    title: str
    description: str
    difficulty: str = "Beginner"
    estimated_minutes: int = 30
    modules: list[CourseModule]


class SavedCourse(Course):
    id: str
    created_at: str