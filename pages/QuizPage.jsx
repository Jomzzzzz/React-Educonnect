import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonQuiz, getQuizQuestions, submitQuiz } from "/utils/api";

export default function QuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // 🧩 Fetch quiz + questions
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      const quizRes = await getLessonQuiz(lessonId);

      if (quizRes.success && quizRes.quizzes.length > 0) {
        const q = quizRes.quizzes[0];
        setQuiz(q);

        const questionsRes = await getQuizQuestions(q.id);
        if (questionsRes.success) setQuestions(questionsRes.questions);
      }
      setLoading(false);
    };

    loadQuiz();
  }, [lessonId]);

  // 🧠 Handle Answer Selection
  const handleAnswer = (qId, choice) => {
    setAnswers({ ...answers, [qId]: choice });
  };

  // 🚀 Submit Quiz
  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    const res = await submitQuiz(quiz.id, lessonId, answers);
    if (res.success) {
      setScore(res.score);
      setSubmitted(true);
    } else {
      alert(res.message);
    }
  };

  // 🧭 Return to Lessons
  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-gray-700 mb-4">
          ❌ No quiz found for this lesson.
        </p>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-3xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧠 {quiz.title}
        </h1>

        {!submitted ? (
          <>
            <p className="text-gray-600 mb-6">
              Answer all questions below and submit when ready.
            </p>

            {questions.map((q, index) => (
              <div
                key={q.id}
                className="mb-6 border-b pb-4 hover:bg-gray-50 rounded-lg p-3"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {index + 1}. {q.question}
                </h2>

                {["A", "B", "C", "D"].map((opt) => {
                  const label = q[`option_${opt.toLowerCase()}`];
                  return (
                    <label
                      key={opt}
                      className="block cursor-pointer text-gray-700 hover:text-blue-600"
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                        className="mr-2"
                      />
                      {opt}. {label}
                    </label>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleBack}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Submit Quiz
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-2">
              🎉 Quiz Completed!
            </h2>
            <p className="text-xl mb-4">
              Your Score: <span className="font-bold">{score}%</span>
            </p>
            {score >= 80 ? (
              <p className="text-green-600 text-lg">Excellent work! 🌟</p>
            ) : score >= 50 ? (
              <p className="text-yellow-600 text-lg">
                Good effort! Keep practicing 💪
              </p>
            ) : (
              <p className="text-red-600 text-lg">
                Don’t worry! Review the lesson and try again ❤️
              </p>
            )}

            <button
              onClick={handleBack}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Lessons
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
