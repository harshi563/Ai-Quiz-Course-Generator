from fastapi import FastAPI, HTTPException

from backend.db import (
    DatabaseError,
    get_all_courses,
    get_all_quizzes,
    save_course,
    save_quiz,
)
from backend.llm import AIServiceError, generate_course, generate_quiz
from backend.models import (
    CourseRequest,
    QuizRequest,
    SavedCourse,
    SavedQuiz,
)

app = FastAPI(
    title="AI Quiz and Course Generator API",
    description="Generates multiple-choice quizzes and structured courses using Google Gemini and saves them to MongoDB.",
    version="1.0.0",
)


@app.get("/")
def read_root():
    return {"message": "AI Quiz and Course Generator API is running!"}


@app.post("/generate-quiz", response_model=SavedQuiz)
def create_quiz(request: QuizRequest):
    try:
        quiz = generate_quiz(
            topic=request.topic,
            num_questions=request.num_questions,
        )
        saved_quiz = save_quiz(quiz.model_dump())
        return saved_quiz
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/generate-course", response_model=SavedCourse)
def create_course(request: CourseRequest):
    try:
        course = generate_course(
            topic=request.topic,
            num_modules=request.num_modules,
        )
        saved_course = save_course(course.model_dump())
        return saved_course
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/quizzes", response_model=list[SavedQuiz])
def list_quizzes():
    try:
        return get_all_quizzes()
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/courses", response_model=list[SavedCourse])
def list_courses():
    try:
        return get_all_courses()
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc