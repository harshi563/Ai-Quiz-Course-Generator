import json
import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from backend.models import Course, Quiz

load_dotenv()


class AIServiceError(Exception):
    """Custom error raised when the AI config is missing or the AI reply is invalid."""


def _get_gemini_client_and_model() -> tuple[genai.Client, str]:
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL")

    if not api_key:
        raise AIServiceError("GEMINI_API_KEY is missing in .env.")
    if not model_name:
        raise AIServiceError("GEMINI_MODEL is missing in .env.")

    return genai.Client(api_key=api_key), model_name


def _generate_structured_json(prompt: str, schema: type[BaseModel]) -> BaseModel:
    client, model_name = _get_gemini_client_and_model()

    last_exc: Exception | None = None
    response = None

    # Retry up to 3 times if Gemini returns a temporary 503 overload
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
            break
        except Exception as exc:
            last_exc = exc
            if "503" in str(exc) or "UNAVAILABLE" in str(exc):
                if attempt < 2:
                    time.sleep(1.5 * (attempt + 1))
                    continue
            raise AIServiceError(f"Failed to contact Gemini API: {exc}") from exc

    if response is None:
        raise AIServiceError(f"Failed to contact Gemini API: {last_exc}")

    raw_text = response.text
    if not raw_text:
        raise AIServiceError("Gemini returned an empty response.")

    try:
        parsed_json = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise AIServiceError(f"AI did not return valid JSON: {exc}") from exc

    try:
        return schema.model_validate(parsed_json)
    except ValidationError as exc:
        raise AIServiceError(f"AI JSON did not match expected structure: {exc}") from exc


def generate_quiz(topic: str, num_questions: int = 5) -> Quiz:
    prompt = f"""
    Create a clear multiple-choice quiz about: "{topic}".

    Rules:
    - Set "topic" to "{topic}".
    - Set "difficulty" to one of: "Beginner", "Intermediate", or "Advanced".
    - Set "estimated_minutes" to a realistic integer (e.g. 5 to 20).
    - Generate exactly {num_questions} questions, each with 4 options.
    - "correct_answer" must match one of the 4 options word-for-word.
    - "explanation" should briefly explain why the correct answer is right.
    """
    return _generate_structured_json(prompt=prompt, schema=Quiz)


def generate_course(topic: str, num_modules: int = 4) -> Course:
    prompt = f"""
    Create a well-structured course about: "{topic}".

    Rules:
    - Set "topic" to "{topic}".
    - Set "difficulty" to one of: "Beginner", "Intermediate", or "Advanced".
    - Set "estimated_minutes" to a realistic integer (e.g. 20 to 60).
    - Write a clear course "title" and a concise 2-sentence "description".
    - Create exactly {num_modules} modules, numbered 1 to {num_modules}.
    - Each module must have 2 to 3 lessons with "title", 1-sentence "summary", and helpful 3-5 sentence "content".
    """
    return _generate_structured_json(prompt=prompt, schema=Course)