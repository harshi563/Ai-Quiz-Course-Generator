import os
import requests
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "").strip().rstrip("/")

st.set_page_config(
    page_title="AI Quiz & Course Studio",
    page_icon="🎓",
    layout="wide",
)

# --- Custom Modern Styling ---
st.markdown(
    """
    <style>
    /* Center the main content nicely instead of stretching too wide */
    .block-container {
        max-width: 1000px;
        padding-top: 2rem;
        padding-bottom: 3rem;
    }

    /* Hide default Streamlit hamburger menu & footer for a cleaner look */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Gradient Hero Banner */
    .hero-banner {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #ec4899 100%);
        padding: 2rem 2.2rem;
        border-radius: 18px;
        color: white;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(79, 70, 229, 0.25);
    }
    .hero-banner h1 {
        margin: 0;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: -0.5px;
    }
    .hero-banner p {
        margin: 0.5rem 0 1rem 0;
        font-size: 1.02rem;
        opacity: 0.92;
    }
    .badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .tech-badge {
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(6px);
        padding: 0.28rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.25);
    }

    /* Upgrade Primary Buttons */
    div.stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 10px;
        padding: 0.6rem 1.2rem;
        font-weight: 600;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    div.stButton > button[kind="primary"]:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
    }

    /* Secondary / Quick-topic buttons */
    div.stButton > button[kind="secondary"] {
        border-radius: 10px;
        font-weight: 500;
    }

    /* Cleaner Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0.75rem;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 10px 10px 0 0;
        padding: 0.6rem 1.1rem;
        font-weight: 600;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# --- Stop clearly if BACKEND_URL is missing ---
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


def fetch_saved_items(endpoint: str) -> tuple[list[dict], str | None]:
    """Fetches saved quizzes or courses safely from the FastAPI backend."""
    try:
        res = requests.get(f"{BACKEND_URL}/{endpoint}", timeout=15)
        if res.status_code == 200:
            return res.json(), None
        return [], extract_error_message(res)
    except requests.exceptions.RequestException as exc:
        return [], f"Could not reach backend at {BACKEND_URL}: {exc}"


def set_sample_topic(sample_topic: str):
    st.session_state["topic_input"] = sample_topic


def display_quiz(quiz: dict, key_prefix: str):
    """Shows an interactive multiple-choice quiz with cards and a score bar."""
    st.markdown(f"### 📝 {quiz.get('title', 'Quiz')}")
    st.caption(f"Topic: {quiz.get('topic', '')}")

    questions = quiz.get("questions", [])
    if not questions:
        st.warning("This quiz has no questions.")
        return

    user_answers = {}
    for index, q in enumerate(questions, start=1):
        with st.container(border=True):
            st.markdown(f"**Question {index} of {len(questions)}**")
            st.markdown(f"##### {q['question']}")
            user_answers[index] = st.radio(
                label=f"Choose an answer for Question {index}",
                options=q["options"],
                index=None,
                key=f"{key_prefix}_q_{index}",
                label_visibility="collapsed",
            )

    if st.button("✅ Check Answers", key=f"{key_prefix}_check_btn", type="primary"):
        score = 0
        for index, q in enumerate(questions, start=1):
            chosen = user_answers[index]
            correct = q["correct_answer"]
            explanation = q.get("explanation", "")

            if chosen == correct:
                score += 1
                st.success(f"**Q{index}: Correct!** — {explanation}")
            elif chosen is None:
                st.warning(
                    f"**Q{index}: Skipped.** Correct answer: **{correct}**. {explanation}"
                )
            else:
                st.error(
                    f"**Q{index}: Incorrect** (you chose '{chosen}'). "
                    f"Correct answer: **{correct}**. {explanation}"
                )

        percent = score / len(questions)
        st.markdown("---")
        st.markdown(f"### 🏆 Your Score: {score} / {len(questions)} ({int(percent * 100)}%)")
        st.progress(percent)
        if percent >= 0.8:
            st.balloons()


def display_course(course: dict):
    """Shows a structured course with summary metrics and module cards."""
    modules = course.get("modules", [])
    total_lessons = sum(len(m.get("lessons", [])) for m in modules)

    st.markdown(f"### 📚 {course.get('title', 'Course')}")
    st.caption(f"Topic: {course.get('topic', '')}")
    if course.get("description"):
        st.info(course["description"])

    m_col1, m_col2 = st.columns(2)
    m_col1.metric("Modules", len(modules))
    m_col2.metric("Total Lessons", total_lessons)

    for module in modules:
        with st.container(border=True):
            st.markdown(f"#### Module {module['module_number']}: {module['title']}")
            for lesson in module.get("lessons", []):
                with st.expander(f"📘 {lesson['title']}"):
                    if lesson.get("summary"):
                        st.markdown(f"**Summary:** {lesson['summary']}")
                    st.write(lesson.get("content", ""))


# Fetch saved counts for sidebar & tab badges
saved_quizzes, quizzes_err = fetch_saved_items("quizzes")
saved_courses, courses_err = fetch_saved_items("courses")

# --- Sidebar ---
with st.sidebar:
    st.markdown("## 🎓 Quiz & Course Studio")
    st.caption("Your AI-powered learning hub")
    st.divider()

    st.markdown("### 📊 Your Library")
    s_col1, s_col2 = st.columns(2)
    s_col1.metric("Quizzes", len(saved_quizzes))
    s_col2.metric("Courses", len(saved_courses))

    st.divider()
    st.markdown("### ⚡ How it works")
    st.markdown(
        "1. Enter any topic (or pick a quick sample).\n"
        "2. Generate a **Quiz** or **Course**.\n"
        "3. Everything auto-saves to **MongoDB Atlas** so you can revisit anytime."
    )

# --- Hero Banner ---
st.markdown(
    """
    <div class="hero-banner">
        <h1>🎓 AI Quiz & Course Studio</h1>
        <p>Turn any topic into an interactive multiple-choice quiz or a structured multi-module course in seconds.</p>
        <div class="badge-row">
            <span class="tech-badge">⚡ FastAPI</span>
            <span class="tech-badge">✨ Google Gemini</span>
            <span class="tech-badge">🍃 MongoDB Atlas</span>
            <span class="tech-badge">🎨 Streamlit</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# --- Main Tabs ---
tab_generate, tab_saved_quizzes, tab_saved_courses = st.tabs(
    [
        "✨ Generate New",
        f"📝 Saved Quizzes ({len(saved_quizzes)})",
        f"📚 Saved Courses ({len(saved_courses)})",
    ]
)

# --- TAB 1: Generate New ---
with tab_generate:
    st.markdown("#### What do you want to learn today?")
    st.caption("Try a quick topic or type your own below:")

    sample_topics = ["Python Loops", "Machine Learning", "Solar System", "SQL Basics"]
    q_cols = st.columns(len(sample_topics))
    for i, sample in enumerate(sample_topics):
        q_cols[i].button(
            f"💡 {sample}",
            key=f"sample_{i}",
            use_container_width=True,
            on_click=set_sample_topic,
            args=(sample,),
        )

    topic = st.text_input(
        "Topic",
        key="topic_input",
        placeholder="e.g., Python Decorators, Photosynthesis, World War II...",
        label_visibility="collapsed",
    )

    col1, col2 = st.columns(2)

    with col1:
        with st.container(border=True):
            st.markdown("#### 📝 Multiple-Choice Quiz")
            st.caption("Test your knowledge with instant scoring and explanations.")
            num_questions = st.slider(
                "Number of questions", min_value=1, max_value=15, value=5
            )
            if st.button("✨ Generate Quiz", type="primary", use_container_width=True):
                if not topic.strip():
                    st.warning("Please enter a topic first.")
                else:
                    with st.spinner("Crafting your quiz with Gemini AI..."):
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
        with st.container(border=True):
            st.markdown("#### 📚 Structured Course")
            st.caption("Learn step-by-step with organized modules and lessons.")
            num_modules = st.slider(
                "Number of modules", min_value=1, max_value=8, value=4
            )
            if st.button("✨ Generate Course", type="primary", use_container_width=True):
                if not topic.strip():
                    st.warning("Please enter a topic first.")
                else:
                    with st.spinner("Building your course with Gemini AI..."):
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

    if "latest_quiz" in st.session_state or "latest_course" in st.session_state:
        st.divider()

    if "latest_quiz" in st.session_state:
        quiz_data = st.session_state["latest_quiz"]
        display_quiz(quiz_data, key_prefix=f"latest_{quiz_data.get('id', 'quiz')}")

    if "latest_course" in st.session_state:
        display_course(st.session_state["latest_course"])

# --- TAB 2: Saved Quizzes ---
with tab_saved_quizzes:
    top_l, top_r = st.columns([4, 1])
    top_l.markdown("### Your Saved Quizzes")
    if top_r.button("🔄 Refresh", key="refresh_quizzes", use_container_width=True):
        st.rerun()

    if quizzes_err:
        st.error(quizzes_err)
    elif not saved_quizzes:
        st.info("No saved quizzes yet. Generate one in the first tab!")
    else:
        quiz_labels = [
            f"{q.get('title', 'Untitled')} ({q.get('topic', '')})" for q in saved_quizzes
        ]
        selected_idx = st.selectbox(
            "Choose a saved quiz",
            options=range(len(saved_quizzes)),
            format_func=lambda i: quiz_labels[i],
        )
        selected_quiz = saved_quizzes[selected_idx]
        display_quiz(
            selected_quiz,
            key_prefix=f"saved_{selected_quiz.get('id', selected_idx)}",
        )

# --- TAB 3: Saved Courses ---
with tab_saved_courses:
    top_l, top_r = st.columns([4, 1])
    top_l.markdown("### Your Saved Courses")
    if top_r.button("🔄 Refresh", key="refresh_courses", use_container_width=True):
        st.rerun()

    if courses_err:
        st.error(courses_err)
    elif not saved_courses:
        st.info("No saved courses yet. Generate one in the first tab!")
    else:
        course_labels = [
            f"{c.get('title', 'Untitled')} ({c.get('topic', '')})" for c in saved_courses
        ]
        selected_idx = st.selectbox(
            "Choose a saved course",
            options=range(len(saved_courses)),
            format_func=lambda i: course_labels[i],
        )
        display_course(saved_courses[selected_idx])