import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Dashboard from "/pages/Dashboard";
import AdminLessons from "/pages/AdminLessons";
import QuizPage from "/pages/QuizPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "../utils/useAuth";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import AdminQuizzes from "/pages/AdminQuizzes"; // Adjust path if needed
// ✅ NEW IMPORTS
import Quizzes from "./components/Quizzes";
import Progress from "./components/Progress"; // 👈 Added Progress page

export default function App() {
  const { authenticated, user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };
  const closeAuth = () => setAuthOpen(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🏠 Landing Page */}
        <Route
          path="/"
          element={
            authenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <>
                <LandingPage onOpenAuth={openAuth} />
                <AuthModal
                  isOpen={authOpen}
                  onClose={closeAuth}
                  initialMode={authMode}
                />
              </>
            )
          }
        />

        {/* 🎓 Student Dashboard */}
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute roles={["student", "teacher", "parent", "admin"]}>
      <Dashboard user={user} /> {/* <-- ADD user={user} HERE */}
    </ProtectedRoute>
  }
/>

        {/* 🧑‍🏫 Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLessons />
            </ProtectedRoute>
          }
        />

        {/* 🧠 Quiz Page */}
        <Route
          path="/quiz/:lessonId"
          element={
            <ProtectedRoute roles={["student", "teacher", "parent", "admin"]}>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        {/* 🆕 🧑‍🏫 Admin Panel - Quizzes */}
<Route
  path="/admin/quizzes"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminQuizzes />
    </ProtectedRoute>
  }
/>

        {/* ✅ Quizzes Tab */}
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute roles={["student", "teacher", "parent", "admin"]}>
              <Quizzes />
            </ProtectedRoute>
          }
        />

        {/* ✅ Progress Page (NEW) */}
        <Route
          path="/progress"
          element={
            <ProtectedRoute roles={["student", "teacher", "parent", "admin"]}>
              <Progress />
            </ProtectedRoute>
          }
        />

        {/* 🚧 Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
