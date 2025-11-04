import { useEffect, useState } from "react";
import { getQuizQuestions, submitQuiz, getQuizReview } from "/utils/api";

export default function QuizModal({
  lessonId,
  quizId,
  title,
  onClose,
  reviewMode: initialReview = false,
}) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [scoreFraction, setScoreFraction] = useState("");
  const [scorePercent, setScorePercent] = useState("");
  const [reviewMode, setReviewMode] = useState(initialReview);
  const [results, setResults] = useState([]);

  // 🧠 Load quiz data or review mode
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (initialReview) {
        const res = await getQuizReview(quizId);
        if (res.success && res.questions) {
          setQuestions(res.questions);
          setResults(
            res.questions.map((q) => ({
              question: q.question_text,
              correct_answer: q.correct_option,
              selected_answer: q.selected_option,
            }))
          );
          setScoreFraction(res.score_fraction || "");
          setScorePercent(res.score_percent || "");
          setReviewMode(true);
        } else {
          alert(res.message || "Failed to load quiz review.");
        }
      } else {
        const res = await getQuizQuestions(quizId);
        if (res.success && Array.isArray(res.questions)) {
          setQuestions(res.questions);
        } else {
          alert(res.message || "Failed to load quiz questions.");
        }
      }

      setLoading(false);
    };

    loadData();
  }, [quizId, initialReview]);

  // 📋 Track selected answers
  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  // 🚀 Submit quiz and display results instantly
  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const res = await submitQuiz(quizId, lessonId, answers);

    if (res.success) {
      const correct = res.correct_count ?? 0;
      const total = res.total_questions ?? questions.length;
      const fraction = res.score_fraction || `${correct}/${total}`;
      const percent = res.score_percent || `${Math.round((correct / total) * 100)}%`;

      setScoreFraction(fraction);
      setScorePercent(percent);

      if (Array.isArray(res.results)) {
        setResults(
          res.results.map((r) => ({
            question: r.question,
            correct_answer: r.correct_answer,
            selected_answer: r.user_answer,
          }))
        );
      }

      setReviewMode(true);
    } else {
      alert(res.message || "Failed to submit quiz.");
    }
  };

  // ⏳ Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8">
          <p className="text-gray-600 animate-pulse">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // ✅ Review Mode
  if (reviewMode && results.length > 0) {
    return (
      <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative border border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
          >
            ✖
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 mb-6">
            <p className="text-lg font-semibold">
              🧾 Score: {scoreFraction}{" "}
              <span className="text-blue-600">({scorePercent})</span>
            </p>
          </div>

          <div className="space-y-5">
            {results.map((r, idx) => {
              const isCorrect =
                r.selected_answer?.toLowerCase() ===
                r.correct_answer?.toLowerCase();
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition ${
                    isCorrect
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  <p className="font-medium text-gray-800 mb-2">
                    {idx + 1}. {r.question}
                  </p>
                  <p className="mb-1">
                    Your Answer:{" "}
                    <span
                      className={`font-semibold ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {r.selected_answer
                        ? r.selected_answer.toUpperCase()
                        : "No Answer"}
                    </span>{" "}
                    {isCorrect ? "✅" : "❌"}
                  </p>
                  {!isCorrect && (
                    <p className="text-gray-700">
                      Correct Answer:{" "}
                      <span className="text-green-700 font-semibold">
                        {r.correct_answer.toUpperCase()}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🧠 Quiz-taking Mode
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🧠 {title}
        </h2>

        <form className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
            >
              <p className="font-medium text-gray-800 mb-2">
                {index + 1}. {q.question}
              </p>
              {["a", "b", "c", "d"].map(
                (opt) =>
                  q[`option_${opt}`] && (
                    <label
                      key={opt}
                      className="block mb-1 cursor-pointer text-gray-700"
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={opt.toUpperCase()}
                        checked={answers[q.id] === opt.toUpperCase()}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                        className="mr-2 accent-blue-600"
                      />
                      {q[`option_${opt}`]}
                    </label>
                  )
              )}
            </div>
          ))}
        </form>

        <div className="mt-6 text-right">
          <button
            onClick={handleSubmit}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
