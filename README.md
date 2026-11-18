# AI Quiz and Course Generator

A web app where you enter any topic and generate:
1. An interactive multiple-choice quiz with instant scoring and explanations.
2. A structured course made of modules and lessons.

All generated quizzes and courses are saved to MongoDB Atlas so you can view or retake them anytime.

## Tech Stack
- Language: Python
- Backend: FastAPI and Uvicorn
- Frontend: Streamlit
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
.env.example
requirements.txt
README.md