import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.db import (
    DatabaseError,
    delete_course,
    delete_quiz,
    get_all_courses,
    get_all_quizzes,
    save_course,
    save_quiz,
)
from backend.llm import AIServiceError, generate_course, generate_quiz
from backend.models import CourseRequest, QuizRequest, SavedCourse, SavedQuiz

load_dotenv()

app = FastAPI(
    title="LearnBridge — AI Quiz and Course Generator API",
    description="Generates multiple-choice quizzes and structured courses using Google Gemini and saves them to MongoDB.",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
def read_root():
    return {"message": "LearnBridge API is running!"}


@app.post("/generate-quiz", response_model=SavedQuiz)
def create_quiz(request: QuizRequest):
    try:
        quiz = generate_quiz(topic=request.topic, num_questions=request.num_questions)
        return save_quiz(quiz.model_dump())
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/generate-course", response_model=SavedCourse)
def create_course(request: CourseRequest):
    try:
        course = generate_course(topic=request.topic, num_modules=request.num_modules)
        return save_course(course.model_dump())
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


@app.delete("/quizzes/{quiz_id}")
def remove_quiz(quiz_id: str):
    try:
        if not delete_quiz(quiz_id):
            raise HTTPException(status_code=404, detail="Quiz not found")
        return {"deleted": True}
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/courses", response_model=list[SavedCourse])
def list_courses():
    try:
        return get_all_courses()
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.delete("/courses/{course_id}")
def remove_course(course_id: str):
    try:
        if not delete_course(course_id):
            raise HTTPException(status_code=404, detail="Course not found")
        return {"deleted": True}
    except DatabaseError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc