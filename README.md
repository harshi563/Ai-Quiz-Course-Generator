# LearnBridge - AI Quiz and Course Generator

A full-stack learning platform where you enter any topic and generate:
1. Interactive multiple-choice quizzes with instant grading and explanations.
2. Structured courses made of modules and lessons.
3. Personal progress tracking for completed lessons, generated items, and quiz results.

All generated quizzes and courses are saved to MongoDB Atlas so you can view or retake them anytime.

## Tech Stack
- Language: Python and TypeScript
- Backend: FastAPI and Uvicorn
- Primary Frontend: React, TypeScript, Tailwind CSS, and Vite (frontend-react)
- Alternative Frontend: Streamlit (frontend)
- AI: Google Gemini API (google-genai)
- Database: MongoDB Atlas (pymongo)
- Config: .env with python-dotenv

## Project Structure
```text
backend/
  main.py
  llm.py
  models.py
  db.py
frontend/
  app.py
frontend-react/
  src/
    components/
      AuthModal.tsx
      CourseView.tsx
      PastelCovers.tsx
      QuizView.tsx
    api.ts
    App.tsx
    index.css
    storage.ts
    types.ts
  vite.config.ts
.env.example
requirements.txt
README.md