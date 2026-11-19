import os
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from pymongo import DESCENDING, MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

DB_NAME = "ai_quiz_course_db"

SEED_COURSES = [
    {
        "topic": "MongoDB Atlas & System Design",
        "title": "MongoDB Atlas & Distributed Data Modeling",
        "description": "Design document schemas, compound indexes, and resilient read/write patterns for cloud-native Python apps.",
        "difficulty": "Advanced",
        "estimated_minutes": 40,
        "modules": [
            {
                "module_number": 1,
                "title": "Document Schemas & Indexing",
                "lessons": [
                    {
                        "title": "Embedding vs. Referencing Documents",
                        "summary": "Learn when to embed nested arrays inside a document versus linking across collections.",
                        "content": "In MongoDB, data that is accessed together should usually live together. Embedding works best for bounded one-to-few relationships like quiz questions inside a quiz. Referencing shines when sub-documents grow unbounded or are shared across many records.",
                    },
                    {
                        "title": "Equality, Sort, Range (ESR) Index Rule",
                        "summary": "Order compound index fields properly so Atlas queries stay fast at scale.",
                        "content": "When creating a compound index in MongoDB Atlas, place fields tested for exact equality first, sort fields second, and range filters last. Following the ESR rule prevents full collection scans and keeps response latency predictable.",
                    },
                ],
            }
        ],
    },
    {
        "topic": "Machine Learning",
        "title": "Applied Machine Learning Foundations",
        "description": "Build intuition for gradient descent, bias-variance tradeoffs, loss landscapes, and model evaluation.",
        "difficulty": "Beginner",
        "estimated_minutes": 30,
        "modules": [
            {
                "module_number": 1,
                "title": "Core Supervised Learning Intuition",
                "lessons": [
                    {
                        "title": "How Gradient Descent Optimizes Loss",
                        "summary": "Understand how models iteratively adjust weights to minimize prediction error.",
                        "content": "A machine learning model starts with random weights and measures mistakes using a loss function. Gradient descent computes the slope of the loss and steps in the opposite direction. Choosing a balanced learning rate ensures smooth convergence without overshooting.",
                    },
                    {
                        "title": "Bias vs. Variance Tradeoff",
                        "summary": "Diagnose underfitting and overfitting using training and validation metrics.",
                        "content": "High bias happens when a model is too simple to capture real patterns, causing poor scores on both training and test data. High variance occurs when a complex model memorizes noise in training data and fails to generalize. Cross-validation and regularization help balance both.",
                    },
                ],
            }
        ],
    },
    {
        "topic": "Python Async & FastAPI",
        "title": "Python Async & FastAPI Concurrency",
        "description": "Master Python's asyncio event loop, non-blocking I/O patterns, and high-throughput FastAPI endpoints.",
        "difficulty": "Intermediate",
        "estimated_minutes": 35,
        "modules": [
            {
                "module_number": 1,
                "title": "Asyncio & FastAPI Request Lifecycle",
                "lessons": [
                    {
                        "title": "Coroutines and the Event Loop",
                        "summary": "See how async/await lets one Python thread juggle many network requests.",
                        "content": "Unlike CPU-bound work, waiting on an external AI API or database spends most of its time idle. With async def and await, the event loop pauses one waiting task and immediately serves another user request, boosting concurrency.",
                    },
                    {
                        "title": "Sync Def vs. Async Def in FastAPI",
                        "summary": "Pick the right endpoint definition when calling synchronous drivers like PyMongo.",
                        "content": "FastAPI runs regular def endpoints inside an automatic worker threadpool so blocking libraries like PyMongo do not freeze the event loop. Reserve async def for truly non-blocking async drivers such as httpx or Motor.",
                    },
                    {
                        "title": "Validating Payloads with Pydantic v2",
                        "summary": "Enforce strict request and response contracts automatically.",
                        "content": "Pydantic models verify incoming JSON types, lengths, and numeric bounds before your endpoint code executes. When invalid data arrives, FastAPI automatically returns a structured 422 validation response.",
                    },
                ],
            }
        ],
    },
]

SEED_QUIZZES = [
    {
        "topic": "MongoDB Atlas & System Design",
        "title": "MongoDB Atlas Schema & Indexing Quiz",
        "difficulty": "Advanced",
        "estimated_minutes": 10,
        "questions": [
            {
                "question": "In MongoDB's ESR rule for compound indexes, what order should fields follow?",
                "options": [
                    "Equality, Sort, Range",
                    "Equality, Range, Sort",
                    "Sort, Equality, Range",
                    "Range, Sort, Equality",
                ],
                "correct_answer": "Equality, Sort, Range",
                "explanation": "Placing Equality fields first, Sort second, and Range last lets MongoDB filter and sort using the index efficiently.",
            },
            {
                "question": "When is embedding sub-documents generally preferred over referencing?",
                "options": [
                    "When data is bounded and always read together",
                    "When sub-documents grow into millions of entries",
                    "When sub-documents are updated independently by many users",
                    "When you want to force extra joins",
                ],
                "correct_answer": "When data is bounded and always read together",
                "explanation": "Embedding bounded data retrieved together avoids extra queries and gives single-document atomicity.",
            },
            {
                "question": "Which MongoDB URI prefix enables DNS seed-list discovery for Atlas clusters?",
                "options": ["mongodb+srv://", "mongodb+tls://", "atlas://", "pymongo://"],
                "correct_answer": "mongodb+srv://",
                "explanation": "Atlas uses mongodb+srv:// with dnspython (pymongo[srv]) to discover replica set nodes automatically.",
            },
        ],
    },
    {
        "topic": "Machine Learning & Optimization",
        "title": "Applied ML Optimization Assessment",
        "difficulty": "Beginner",
        "estimated_minutes": 8,
        "questions": [
            {
                "question": "What happens if a model has high training accuracy but poor validation accuracy?",
                "options": [
                    "Overfitting (high variance)",
                    "Underfitting (high bias)",
                    "Perfect generalization",
                    "Zero learning rate",
                ],
                "correct_answer": "Overfitting (high variance)",
                "explanation": "Memorizing training noise without generalizing to unseen validation data is classic overfitting.",
            },
            {
                "question": "What is the main risk of setting a gradient descent learning rate too high?",
                "options": [
                    "Overshooting the minimum and failing to converge",
                    "Always finding the global minimum in 1 step",
                    "Reducing dataset size automatically",
                    "Eliminating all variance",
                ],
                "correct_answer": "Overshooting the minimum and failing to converge",
                "explanation": "Steps that are too large jump past the bottom of the loss valley and can diverge.",
            },
            {
                "question": "Which technique helps detect overfitting during model development?",
                "options": [
                    "K-fold cross-validation",
                    "Removing all test data",
                    "Increasing polynomial degree endlessly",
                    "Training for 10x more epochs without checking validation loss",
                ],
                "correct_answer": "K-fold cross-validation",
                "explanation": "Cross-validation tests the model across multiple held-out folds to measure real generalization.",
            },
        ],
    },
    {
        "topic": "Asynchronous Python & FastAPI",
        "title": "Python Async & FastAPI Mastery Check",
        "difficulty": "Intermediate",
        "estimated_minutes": 12,
        "questions": [
            {
                "question": "How does FastAPI execute a normal synchronous `def` route handler?",
                "options": [
                    "Inside an external threadpool so it doesn't block the event loop",
                    "By spawning a brand-new OS container per request",
                    "It converts synchronous code into async automatically",
                    "It rejects synchronous routes at startup",
                ],
                "correct_answer": "Inside an external threadpool so it doesn't block the event loop",
                "explanation": "FastAPI runs blocking `def` endpoints in AnyIO's worker threadpool safely.",
            },
            {
                "question": "Which HTTP status code does FastAPI return automatically when Pydantic request validation fails?",
                "options": ["422", "200", "301", "503"],
                "correct_answer": "422",
                "explanation": "422 Unprocessable Entity is FastAPI's built-in response for invalid request schemas.",
            },
            {
                "question": "Why should you use `response_model` on a FastAPI endpoint?",
                "options": [
                    "To validate, filter, and document the outgoing JSON shape",
                    "To connect directly to MongoDB without PyMongo",
                    "To disable Swagger /docs",
                    "To bypass CORS checks in browsers",
                ],
                "correct_answer": "To validate, filter, and document the outgoing JSON shape",
                "explanation": "response_model guarantees output matches your Pydantic schema and populates OpenAPI /docs.",
            },
            {
                "question": "Which library runs the ASGI server for FastAPI?",
                "options": ["Uvicorn", "Streamlit", "Pytest", "Tkinter"],
                "correct_answer": "Uvicorn",
                "explanation": "Uvicorn is the lightning-fast ASGI server commonly used to serve FastAPI apps.",
            },
        ],
    },
]


class DatabaseError(Exception):
    """Custom error raised when MongoDB config is missing or database operations fail."""


def _get_database():
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise DatabaseError(
            "MONGODB_URI is missing. Please add your MongoDB Atlas link to the .env file."
        )

    try:
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        return client[DB_NAME]
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to connect to MongoDB Atlas: {exc}") from exc


def _seed_starter_data_once(db):
    """Seeds initial demo courses & quizzes once if the database has never been seeded."""
    if db["meta"].find_one({"_id": "seeded_v1"}):
        return

    now = datetime.now(timezone.utc).isoformat()
    if db["courses"].count_documents({}) == 0:
        docs = [{**course, "created_at": now} for course in SEED_COURSES]
        db["courses"].insert_many(docs)

    if db["quizzes"].count_documents({}) == 0:
        docs = [{**quiz, "created_at": now} for quiz in SEED_QUIZZES]
        db["quizzes"].insert_many(docs)

    db["meta"].update_one({"_id": "seeded_v1"}, {"$set": {"done": True}}, upsert=True)


def _format_document(doc: dict) -> dict:
    formatted = dict(doc)
    formatted["id"] = str(formatted.pop("_id"))
    return formatted


def save_quiz(quiz_data: dict) -> dict:
    db = _get_database()
    document = dict(quiz_data)
    document["created_at"] = datetime.now(timezone.utc).isoformat()
    try:
        result = db["quizzes"].insert_one(document)
        document["_id"] = result.inserted_id
        return _format_document(document)
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to save quiz to MongoDB: {exc}") from exc


def get_all_quizzes() -> list[dict]:
    db = _get_database()
    try:
        _seed_starter_data_once(db)
        cursor = db["quizzes"].find().sort("created_at", DESCENDING)
        return [_format_document(doc) for doc in cursor]
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to fetch quizzes from MongoDB: {exc}") from exc


def delete_quiz(quiz_id: str) -> bool:
    db = _get_database()
    try:
        obj_id = ObjectId(quiz_id)
    except InvalidId:
        return False
    try:
        res = db["quizzes"].delete_one({"_id": obj_id})
        return res.deleted_count > 0
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to delete quiz: {exc}") from exc


def save_course(course_data: dict) -> dict:
    db = _get_database()
    document = dict(course_data)
    document["created_at"] = datetime.now(timezone.utc).isoformat()
    try:
        result = db["courses"].insert_one(document)
        document["_id"] = result.inserted_id
        return _format_document(document)
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to save course to MongoDB: {exc}") from exc


def get_all_courses() -> list[dict]:
    db = _get_database()
    try:
        _seed_starter_data_once(db)
        cursor = db["courses"].find().sort("created_at", DESCENDING)
        return [_format_document(doc) for doc in cursor]
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to fetch courses from MongoDB: {exc}") from exc


def delete_course(course_id: str) -> bool:
    db = _get_database()
    try:
        obj_id = ObjectId(course_id)
    except InvalidId:
        return False
    try:
        res = db["courses"].delete_one({"_id": obj_id})
        return res.deleted_count > 0
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to delete course: {exc}") from exc