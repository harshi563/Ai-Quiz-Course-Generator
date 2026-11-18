from fastapi import FastAPI, HTTPException

from backend.llm import AIServiceError, generate_course, generate_quiz
from backend.models import Course, CourseRequest, Quiz, QuizRequest

app = FastAPI(
    title="AI Quiz and Course Generator API",
    description="Generates multiple-choice quizzes and structured courses using Google Gemini.",
    version="1.0.0",
)


@app.get("/")
def read_root():
    return {"message": "AI Quiz and Course Generator API is running!"}


@app.post("/generate-quiz", response_model=Quiz)
def create_quiz(request: QuizRequest):
    try:
        quiz = generate_quiz(
            topic=request.topic,
            num_questions=request.num_questions,
        )
        return quiz
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/generate-course", response_model=Course)
def create_course(request: CourseRequest):
    try:
        course = generate_course(
            topic=request.topic,
            num_modules=request.num_modules,
        )
        return course
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc