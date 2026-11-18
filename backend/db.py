import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import DESCENDING, MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

DB_NAME = "ai_quiz_course_db"


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
        # Quick ping so connection problems are caught clearly right away
        client.admin.command("ping")
        return client[DB_NAME]
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to connect to MongoDB Atlas: {exc}") from exc


def _format_document(doc: dict) -> dict:
    """Converts MongoDB's special `_id` ObjectId into a plain string `id`."""
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
        cursor = db["quizzes"].find().sort("created_at", DESCENDING)
        return [_format_document(doc) for doc in cursor]
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to fetch quizzes from MongoDB: {exc}") from exc


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
        cursor = db["courses"].find().sort("created_at", DESCENDING)
        return [_format_document(doc) for doc in cursor]
    except PyMongoError as exc:
        raise DatabaseError(f"Failed to fetch courses from MongoDB: {exc}") from exc