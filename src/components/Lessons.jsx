import { useState, useEffect } from "react";
import { fetchLessonsByGrade } from "/utils/api";
import LessonModal from "./LessonModal";

export default function Lessons({ onTakeQuiz }) {
  const [grade, setGrade] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [error, setError] = useState("");

  const loadLessons = async (g) => {
    setLoading(true);
    setError("");
    const res = await fetchLessonsByGrade(g);
    if (res.success) setLessons(res.lessons);
    else setError(res.message || "Failed to load lessons.");
    setLoading(false);
  };

  useEffect(() => {
    loadLessons(grade);
  }, [grade]);

  const handleMarkComplete = (lessonId) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, completed: true } : l))
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Lessons by Grade</h2>
        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading lessons...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : lessons.length === 0 ? (
        <p>No lessons available for this grade.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`p-5 border rounded-lg transition ${
                lesson.completed
                  ? "bg-green-50 border-green-300"
                  : "hover:shadow-lg"
              }`}
            >
              <h3 className="font-semibold mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-500 mb-3 capitalize">
                Difficulty: {lesson.difficulty}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLesson(lesson.id)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  View Lesson
                </button>

                {lesson.completed ? (
                  <button
                    onClick={() => onTakeQuiz && onTakeQuiz(lesson.id)}
                    className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                  >
                    Take Quiz
                  </button>
                ) : (
                  <button
                    disabled
                    className="text-sm bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed"
                    title="Complete the lesson to unlock the quiz"
                  >
                    🔒 Locked
                  </button>
                )}
              </div>

              {lesson.completed && (
                <span className="block mt-2 text-green-600 text-sm">
                  ✅ Completed
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedLesson && (
        <LessonModal
          lessonId={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </div>
  );
}
