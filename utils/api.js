// ==========================================================
// 🧠 EduConnect Frontend - Centralized API Utility (Final Updated)
// ==========================================================

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "http://localhost/educonnect-backend");

/* ----------------------------------------------------------
   🧩 Core Helpers
---------------------------------------------------------- */

/**
 * ✅ Safely parse JSON without breaking on invalid responses.
 *    Handles unexpected HTML errors (e.g., PHP warnings).
 */
async function safeJSON(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("❌ Invalid JSON from server:", text);
    return { success: false, message: "Invalid JSON response from server" };
  }
}

/**
 * ✅ Wrapper for fetch with consistent error handling.
 *    Automatically includes credentials for PHP session cookies.
 */
export async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // keeps PHP sessions active
    });

    if (!res.ok) {
      console.error("❌ Server error:", res.status, res.statusText);
      return {
        success: false,
        message: `Server error: ${res.status} ${res.statusText}`,
      };
    }

    return await safeJSON(res);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    return {
      success: false,
      message: err.message || "Network connection failed",
    };
  }
}

/**
 * ✅ Helper for GET requests with query params.
 */
export async function getJSON(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null)
      url.searchParams.append(key, value);
  });
  return safeFetch(url);
}

/**
 * ✅ Helper for POST requests (JSON body).
 */
export async function postJSON(endpoint, payload = {}) {
  return safeFetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * ✅ Helper for file uploads (FormData).
 */
export async function uploadFile(endpoint, formData) {
  return safeFetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    body: formData,
  });
}

/* ----------------------------------------------------------
   📚 Student APIs
---------------------------------------------------------- */

/**
 * 🏫 Fetch all lessons by grade level.
 */
export const fetchLessonsByGrade = (grade_id) =>
  getJSON("api/get_lessons.php", { grade: grade_id });

// ==========================================================
// NEW: Functions for Grade -> Subject -> Topic flow
// ==========================================================

/**
 * 🧑‍🏫 Fetch all available subjects for a specific grade.
 * dinagdag ko to pre
 */
export const fetchSubjectsByGrade = (gradeId) =>
  getJSON("api/get_subjects.php", { grade_id: gradeId });

/**
 * 📖 Fetch recommended topics (lessons) for a specific subject.
 * This is the "AI" endpoint that provides the correct difficulty.
 * inedit ko to pre
 */
// src/utils/api.js

// ... previous code ...

// 🆕 UPDATED: Added context param (defaults to 'lesson')
export const fetchTopicsBySubject = async (subjectId, studentId, grade, context = 'lesson') => {
  return await getJSON("api/get_recommended_topics.php", { 
    subject_id: subjectId, 
    student_id: studentId,
    grade_id: grade,
    context: context // Pass it to PHP
  });
};

// ... rest of code ...
// =Gg========================================================
// (End of new functions)
/**
 * 📖 Get specific lesson details.
 */
export const getLessonDetails = (lessonId) =>
  getJSON("api/get_lesson_details.php", { id: lessonId });

/**
 * ✅ Mark a lesson as completed.
 */
export const markLessonComplete = (lessonId) =>
  postJSON("api/mark_complete.php", { lesson_id: lessonId });

/**
 * 📈 Get current student progress.
 */
export const getProgress = () => getJSON("api/get_progress.php");

/* ----------------------------------------------------------
   🧠 Quiz APIs
---------------------------------------------------------- */

/**
 * 🔍 Get all quizzes for a specific lesson.
 */
export const getLessonQuiz = (lessonId) =>
  getJSON("api/get_quizzes.php", { lesson_id: lessonId });

/**
 * 📝 Get all questions for a quiz.
 */
export const getQuizQuestions = (quizId) =>
  getJSON("api/get_quiz_questions.php", { quiz_id: quizId });
/**
 * 👋 Get the AI Welcome Message for Dashboard.
 * Points to api/get_dashboard_welcome.php
 */
export const getDashboardWelcome = (studentId) =>
  getJSON("api/get_dashboard_welcome.php", { student_id: studentId });
/**
 * 🚀 Submit quiz answers for grading and saving.
 * Backend automatically calculates correct/wrong answers,
 * feedback, and saves results in `student_quiz_results`.
 */
export const submitQuiz = async (quizId, lessonId, answers, studentId = null) => {
  try {
    const payload = {
      quiz_id: quizId,
      lesson_id: lessonId,
      answers,
      ...(studentId ? { student_id: studentId } : {}),
    };

    const res = await safeFetch(`${BASE_URL}/api/submit_quiz.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // ✅ Keep PHP session active
      body: JSON.stringify(payload),
    });

    if (res.success) {
      console.log("✅ Quiz submitted successfully:", res);
    } else {
      console.warn("⚠️ Quiz submission failed:", res.message);
    }

    return res;
  } catch (err) {
    console.error("❌ Error submitting quiz:", err);
    return { success: false, message: "Failed to submit quiz." };
  }
};

/**
 * 🔍 Get quiz review results (for past attempts).
 * Returns stored score, feedback, and per-question results.
 */
export const getQuizReview = async (quizId, studentId = null) => {
  try {
    const params = { quiz_id: quizId };
    if (studentId) params.student_id = studentId;

    const res = await safeFetch(`${BASE_URL}/api/get_quiz_result.php?` + new URLSearchParams(params), {
      method: "GET",
      credentials: "include", // ✅ Keep session for fetching results
    });

    if (res.success) {
      console.log("✅ Quiz review data loaded:", res);
    } else {
      console.warn("⚠️ Failed to load quiz review:", res.message);
    }

    return res;
  } catch (err) {
    console.error("❌ Error fetching quiz review:", err);
    return { success: false, message: "Failed to fetch quiz review." };
  }
};

/**
 * 🤖 Personalized AI-based learning recommendations.
 */
export const getAIRecommendations = (studentId) =>
  getJSON("api/get_ai_recommendations.php", { student_id: studentId });


/* ----------------------------------------------------------
   🧑‍🏫 Admin APIs
---------------------------------------------------------- */

/**
 * 🗂️ Fetch all lessons (for admin dashboard).
 */
export const fetchAdminLessons = () => getJSON("api/get_admin_lessons.php");

/**
 * 💾 Save or update a lesson.
 */
export const saveLesson = (lessonData) =>
  postJSON("api/save_lesson.php", lessonData);

/**
 * 🗑️ Delete a specific lesson by ID.
 */
export const deleteLesson = (id) =>
  postJSON("api/delete_lesson.php", { id });

/**
 * 📤 Upload a lesson file (PDF, video, or document).
 */
export const uploadLessonFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return uploadFile("api/upload_lesson_file.php", formData);
};

/* ----------------------------------------------------------
   ⚙️ Utilities
---------------------------------------------------------- */

/**
 * 🌐 Get full file URL from filename (uploads folder).
 */
export const getFileURL = (filename) =>
  filename ? `${BASE_URL}/uploads/${filename}` : "";

/**
 * 🚪 Log out current user.
 */
export async function logoutUser() {
  try {
    const res = await fetch(`${BASE_URL}/logout.php`, {
      method: "POST",
      credentials: "include",
    });
    return await safeJSON(res);
  } catch {
    return { success: false, message: "Logout failed" };
  }
}
