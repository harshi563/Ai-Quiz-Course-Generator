import os
import requests
import streamlit as st
from dotenv import load_dotenv

# Load settings from .env
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "").strip().rstrip("/")

st.set_page_config(
    page_title="AI Quiz & Course Generator",
    page_icon="🎓",
    layout="wide",
)

st.title("🎓 AI Quiz and Course Generator")
st.caption("Powered by FastAPI, Google Gemini, MongoDB Atlas, and Streamlit")

# Stop clearly if BACKEND_URL is not configured in .env
if not BACKEND_URL:
    st.error(
        "BACKEND_URL is not set. Please add BACKEND_URL to your .env file "
        "(for example: BACKEND_URL=http://127.0.0.1:8000)."
    )
    st.stop()


def extract_error_message(response: requests.Response) -> str:
    """Gets a readable error message from the backend response."""
    try:
        data = response.json()
        if isinstance(data, dict) and "detail" in data:
            return str(data["detail"])
    except ValueError:
        pass
    return response.text or f"Request failed with status {response.status_code}"


def display_quiz(quiz: dict, key_prefix: str):
    """Shows an interactive multiple-choice quiz with answer checking."""
    st.subheader(quiz.get("title", "Quiz"))
    st.write(f"**Topic:** {quiz.get('topic', '')}")

    questions = quiz.get("questions", [])
    if not questions:
        st.warning("This quiz has no questions.")
        return

    user_answers = {}
    for index, q in enumerate(questions, start=1):
        st.markdown(f"**Q{index}. {q['question']}**")
        user_answers[index] = st.radio(
            label=f"Choose an answer for Question {index}",
            options=q["options"],
            index=None,
            key=f"{key_prefix}_q_{index}",
            label_visibility="collapsed",
        )

    if st.button("Check Answers", key=f"{key_prefix}_check_btn", type="primary"):
        score = 0
        for index, q in enumerate(questions, start=1):
            chosen = user_answers[index]
            correct = q["correct_answer"]
            explanation = q.get("explanation", "")

            if chosen == correct:
                score += 1
                st.success(f"Q{index}: Correct! — {explanation}")
            elif chosen is None:
                st.warning(
                    f"Q{index}: No answer selected. Correct answer: **{correct}**. {explanation}"
                )
            else:
                st.error(
                    f"Q{index}: Incorrect (you chose '{chosen}'). "
                    f"Correct answer: **{correct}**. {explanation}"
                )

        st.info(f"Your Score: **{score} / {len(questions)}**")


def display_course(course: dict):
    """Shows a structured course made of modules and lessons."""
    st.subheader(course.get("title", "Course"))
    st.write(f"**Topic:** {course.get('topic', '')}")
    if course.get("description"):
        st.write(course["description"])

    for module in course.get("modules", []):
        st.markdown(f"### Module {module['module_number']}: {module['title']}")
        for lesson in module.get("lessons", []):
            with st.expander(f"📘 {lesson['title']}"):
                if lesson.get("summary"):
                    st.markdown(f"**Summary:** {lesson['summary']}")
                st.write(lesson.get("content", ""))


# Three simple tabs on the screen
tab_generate, tab_saved_quizzes, tab_saved_courses = st.tabs(
    ["✨ Generate New", "📝 Saved Quizzes", "📚 Saved Courses"]
)

# --- TAB 1: Generate New Quiz or Course ---
with tab_generate:
    topic = st.text_input(
        "Enter a topic",
        placeholder="e.g., Python Loops, Photosynthesis, World War II",
    )

    col1, col2 = st.columns(2)

    with col1:
        num_questions = st.slider("Number of quiz questions", min_value=1, max_value=15, value=5)
        if st.button("Generate Quiz", use_container_width=True):
            if not topic.strip():
                st.warning("Please enter a topic first.")
            else:
                with st.spinner("Generating quiz with Gemini AI..."):
                    try:
                        res = requests.post(
                            f"{BACKEND_URL}/generate-quiz",
                            json={"topic": topic.strip(), "num_questions": num_questions},
                            timeout=60,
                        )
                        if res.status_code == 200:
                            st.session_state["latest_quiz"] = res.json()
                            st.session_state.pop("latest_course", None)
                            st.success("Quiz generated and saved to MongoDB!")
                        else:
                            st.error(extract_error_message(res))
                    except requests.exceptions.RequestException as exc:
                        st.error(f"Could not reach backend at {BACKEND_URL}: {exc}")

    with col2:
        num_modules = st.slider("Number of course modules", min_value=1, max_value=8, value=4)
        if st.button("Generate Course", use_container_width=True):
            if not topic.strip():
                st.warning("Please enter a topic first.")
            else:
                with st.spinner("Generating course with Gemini AI..."):
                    try:
                        res = requests.post(
                            f"{BACKEND_URL}/generate-course",
                            json={"topic": topic.strip(), "num_modules": num_modules},
                            timeout=60,
                        )
                        if res.status_code == 200:
                            st.session_state["latest_course"] = res.json()
                            st.session_state.pop("latest_quiz", None)
                            st.success("Course generated and saved to MongoDB!")
                        else:
                            st.error(extract_error_message(res))
                    except requests.exceptions.RequestException as exc:
                        st.error(f"Could not reach backend at {BACKEND_URL}: {exc}")

    st.divider()

    if "latest_quiz" in st.session_state:
        quiz_data = st.session_state["latest_quiz"]
        display_quiz(quiz_data, key_prefix=f"latest_{quiz_data.get('id', 'quiz')}")

    if "latest_course" in st.session_state:
        display_course(st.session_state["latest_course"])

# --- TAB 2: View Saved Quizzes ---
with tab_saved_quizzes:
    if st.button("🔄 Refresh Quizzes"):
        st.rerun()

    try:
        res = requests.get(f"{BACKEND_URL}/quizzes", timeout=15)
        if res.status_code == 200:
            quizzes = res.json()
            if not quizzes:
                st.info("No saved quizzes yet. Generate one in the first tab!")
            else:
                quiz_labels = [
                    f"{q.get('title', 'Untitled')} — {q.get('topic', '')}" for q in quizzes
                ]
                selected_idx = st.selectbox(
                    "Choose a saved quiz",
                    options=range(len(quizzes)),
                    format_func=lambda i: quiz_labels[i],
                )
                selected_quiz = quizzes[selected_idx]
                display_quiz(
                    selected_quiz,
                    key_prefix=f"saved_{selected_quiz.get('id', selected_idx)}",
                )
        else:
            st.error(extract_error_message(res))
    except requests.exceptions.RequestException as exc:
        st.error(f"Could not reach backend at {BACKEND_URL}: {exc}")

# --- TAB 3: View Saved Courses ---
with tab_saved_courses:
    if st.button("🔄 Refresh Courses"):
        st.rerun()

    try:
        res = requests.get(f"{BACKEND_URL}/courses", timeout=15)
        if res.status_code == 200:
            courses = res.json()
            if not courses:
                st.info("No saved courses yet. Generate one in the first tab!")
            else:
                course_labels = [
                    f"{c.get('title', 'Untitled')} — {c.get('topic', '')}" for c in courses
                ]
                selected_idx = st.selectbox(
                    "Choose a saved course",
                    options=range(len(courses)),
                    format_func=lambda i: course_labels[i],
                )
                display_course(courses[selected_idx])
        else:
            st.error(extract_error_message(res))
    except requests.exceptions.RequestException as exc:
        st.error(f"Could not reach backend at {BACKEND_URL}: {exc}")