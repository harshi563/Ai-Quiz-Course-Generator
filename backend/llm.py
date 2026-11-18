import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from backend.models import Course, Quiz

# Load variables from the .env file into environment variables
load_dotenv()


class AIServiceError(Exception):
    """Custom error raised when the AI config is missing or the AI reply is invalid."""


def _get_gemini_client_and_model() -> tuple[genai.Client, str]:
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL")

    if not api_key:
        raise AIServiceError("GEMINI_API_KEY is missing. Please set it in your .env file.")
    if not model_name:
        raise AIServiceError("GEMINI_MODEL is missing. Please set it in your .env file.")

    client = genai.Client(api_key=api_key)
    return client, model_name


def _generate_structured_json(prompt: str, schema: type[BaseModel]) -> BaseModel:
    """Sends a prompt to Gemini, requires JSON matching `schema`, and validates the result."""
    client, model_name = _get_gemini_client_and_model()

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
    except Exception as exc:
        raise AIServiceError(f"Failed to contact Gemini API: {exc}") from exc

    raw_text = response.text
    if not raw_text:
        raise AIServiceError("Gemini returned an empty response.")

    # Step 1: Make sure the text is valid JSON
    try:
        parsed_json = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise AIServiceError(
            f"AI did not return valid JSON. Error: {exc}"
        ) from exc

    # Step 2: Make sure the JSON matches our Pydantic blueprint (Quiz or Course)
    try:
        return schema.model_validate(parsed_json)
    except ValidationError as exc:
        raise AIServiceError(
            f"AI JSON did not match the expected structure: {exc}"
        ) from exc


def generate_quiz(topic: str, num_questions: int = 5) -> Quiz:
    prompt = f"""
    Create a beginner-friendly multiple-choice quiz about: "{topic}".

    Rules:
    - Generate exactly {num_questions} questions.
    - Each question must have exactly 4 options.
    - "correct_answer" must match one of the 4 strings in "options" word-for-word.
    - "explanation" should briefly explain why the correct answer is right.
    - Set "topic" to "{topic}".
    """
    return _generate_structured_json(prompt=prompt, schema=Quiz)


def generate_course(topic: str, num_modules: int = 4) -> Course:
    prompt = f"""
    Create a beginner-friendly, well-structured course about: "{topic}".

    Rules:
    - Set "topic" to "{topic}".
    - Write a clear course "title" and a short 2-sentence "description".
    - Create exactly {num_modules} modules, numbered 1 to {num_modules}.
    - Each module should have 2 to 3 lessons.
    - Each lesson must have:
      - "title": a clear lesson name
      - "summary": 1 sentence summarizing what the student will learn
      - "content": a helpful, beginner-friendly explanation (around 3 to 5 sentences, with a simple example if useful).
    """
    return _generate_structured_json(prompt=prompt, schema=Course)