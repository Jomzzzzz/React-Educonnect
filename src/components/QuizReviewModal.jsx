import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { getQuizReview } from "/utils/api";

export default function QuizReviewModal({ quizId, studentId, title, onClose }) {
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreFraction, setScoreFraction] = useState("");
  const [scorePercent, setScorePercent] = useState("");

  useEffect(() => {
    const loadReview = async () => {
      const res = await getQuizReview(quizId, studentId);
      if (res.success) {
        setReviewData(res.questions || []);
        setScoreFraction(res.score_fraction || "");
        setScorePercent(res.score_percent || "");
      } else {
        console.error("Quiz review failed:", res.message);
      }
      setLoading(false);
    };
    loadReview();
  }, [quizId, studentId]);

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white p-6 rounded-xl">Loading review...</div>
      </div>
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-y-auto max-h-[85vh] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Quiz Review — {title}
          </h2>
          <button onClick={onClose}>
            <XCircle className="text-gray-500 hover:text-red-600" size={22} />
          </button>
        </div>

        <div className="mb-4 text-center text-lg font-medium text-blue-700">
          🧾 Your Score: {scoreFraction} ({scorePercent})
        </div>

        {reviewData.map((q, i) => {
          const isCorrect = q.is_correct || (
            q.user_answer?.toLowerCase() === q.correct_answer?.toLowerCase()
          );

          return (
            <div
              key={q.question_id || i}
              className={`p-4 mb-3 rounded-lg border ${
                isCorrect
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <p className="font-medium mb-2 text-gray-800">
                {i + 1}. {q.question || q.question_text}
              </p>
              <p
                className={`text-sm mb-1 ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                Your answer:{" "}
                <strong>{q.user_answer?.toUpperCase() || "No Answer"}</strong>{" "}
                {isCorrect ? "✅" : "❌"}
              </p>
              {!isCorrect && (
                <p className="text-sm text-gray-700">
                  Correct answer:{" "}
                  <span className="text-green-700 font-semibold">
                    {q.correct_answer?.toUpperCase()}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
