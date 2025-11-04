import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  // Update real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(
          "http://localhost/educonnect-backend/api/get_progress.php",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProgress(data);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-gray-500 animate-pulse">Loading progress...</p>
      </div>
    );
  }

  if (!progress?.success) {
    return (
      <div className="text-center text-red-500 font-medium py-10">
        Failed to load progress. Please log in again.
      </div>
    );
  }

  const { summary, weekly_progress, ai_feedback, records } = progress;
  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formattedDate = time.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Your Learning Progress</h1>
          <p className="text-gray-500">Track your lessons, quizzes, and performance insights</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-lg font-medium">{formattedDate}</p>
          <p className="text-2xl font-semibold text-blue-600">{formattedTime}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-blue-500">
          <h2 className="text-sm text-gray-500">Lessons Completed</h2>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {summary.completed_lessons}/{summary.total_lessons}
          </p>
          <p className="text-sm text-gray-500">{summary.lesson_percentage}% done</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-green-500">
          <h2 className="text-sm text-gray-500">Quizzes Taken</h2>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {summary.completed_quizzes}/{summary.total_quizzes}
          </p>
          <p className="text-sm text-gray-500">Keep improving!</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-yellow-500">
          <h2 className="text-sm text-gray-500">AI Feedback</h2>
          <p className="text-sm text-gray-700 mt-2 italic">{ai_feedback}</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-purple-500">
          <h2 className="text-sm text-gray-500">Last Update</h2>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {new Date(progress.server_time).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Learning Trend</h2>
        {weekly_progress.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekly_progress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="lessons_completed" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No weekly progress yet. Start learning to see your trends!
          </p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {records.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {records.slice(0, 6).map((r, i) => (
              <li key={i} className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800">
                    {r.type === "Lesson" ? "📘 Lesson Completed:" : "🧠 Quiz Taken:"}{" "}
                    <span className="text-blue-600">{r.title}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(r.timestamp).toLocaleString()}
                  </p>
                </div>
                {r.score && (
                  <span
                    className={`text-sm font-semibold ${
                      r.score >= 70 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    Score: {r.score}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No activities yet. Start your first lesson!
          </p>
        )}
      </div>
    </div>
  );
};

export default Progress;
