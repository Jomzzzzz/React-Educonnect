import { useEffect, useState, Suspense, lazy } from "react";
import { getJSON } from "/utils/api";

// Lazy-load heavier modal components so they are code-split and only
// downloaded when the user opens a quiz or review.
const QuizModal = lazy(() => import("./QuizModal"));
const QuizReviewModal = lazy(() => import("./QuizReviewModal"));

export default function Quizzes({ initialLessonId, user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [reviewQuiz, setReviewQuiz] = useState(null);

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
  }, []);

  // Auto-select quiz if initialLessonId is provided
  useEffect(() => {
    if (initialLessonId && quizzes.length > 0) {
      const relatedQuiz = quizzes.find((q) => q.lesson_id === initialLessonId);
      if (relatedQuiz && !relatedQuiz.locked) setSelectedQuiz(relatedQuiz);
    }
  }, [initialLessonId, quizzes]);

  // Load quizzes from API
  const loadQuizzes = async () => {
    setError("");
    try {
      const res = await getJSON("api/get_quizzes.php");
      if (res.success) {
        setQuizzes(res.quizzes || []);
        const completed = res.student_quiz_results
          ? res.student_quiz_results.map((r) => r.quiz_id)
          : [];
        setCompletedQuizzes(completed);
      } else {
        setError(res.message || "Failed to load quizzes.");
      }
    } catch (err) {
      setError("Failed to fetch quizzes.");
      console.error(err);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) => q.grade_level_id === Number(selectedGrade)
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">🧠 Quizzes</h2>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(Number(e.target.value))}
          className="border p-2 rounded text-sm"
        >
          {[1, 2, 3, 4, 5, 6].map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Quizzes grid */}
      {filteredQuizzes.length === 0 ? (
        <p className="text-gray-500">
          No quizzes available for Grade {selectedGrade}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((q) => {
            const isCompleted = completedQuizzes.includes(q.quiz_id);
            return (
              <div
                key={q.quiz_id}
                className={`p-5 border rounded-lg bg-white transition shadow-sm ${
                  q.locked ? "opacity-70" : "hover:shadow-md"
                }`}
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  {q.quiz_title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">Lesson: {q.lesson_title}</p>
                <p className="text-xs text-gray-500 mb-3">Grade Level: {q.grade_level_id}</p>

                {q.locked ? (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-600 px-3 py-2 rounded text-sm cursor-not-allowed w-full"
                  >
                    🔒 Locked — Complete the lesson first
                  </button>
                ) : isCompleted ? (
                  <>
                    <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm text-center w-full font-semibold mb-2">
                      ✅ Completed
                    </div>
                    <button
                      onClick={() => setReviewQuiz(q)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm w-full"
                    >
                      Review Quiz
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedQuiz(q)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded text-sm w-full"
                  >
                    Take Quiz
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Modal (lazy) */}
      {selectedQuiz && (
        <Suspense fallback={<div className="p-4 text-center">Loading quiz…</div>}>
          <QuizModal
            lessonId={selectedQuiz.lesson_id}
            quizId={selectedQuiz.quiz_id}
            title={selectedQuiz.quiz_title}
            onClose={() => setSelectedQuiz(null)}
            onQuizComplete={(result) => {
              if (result.passed) {
                setCompletedQuizzes((prev) => [...prev, result.quizId]);
              }
            }}
          />
        </Suspense>
      )}

      {/* Review Quiz Modal (lazy) */}
      {reviewQuiz && (
        <Suspense fallback={<div className="p-4 text-center">Loading review…</div>}>
          <QuizReviewModal
            quizId={reviewQuiz.quiz_id}
            studentId={user?.id}
            title={reviewQuiz.quiz_title}
            onClose={() => setReviewQuiz(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
