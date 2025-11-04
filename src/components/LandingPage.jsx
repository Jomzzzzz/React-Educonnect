// src/components/LandingPage.jsx
import { useRef, useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import AuthModal from "./AuthModal";
import { BookOpen, Star, Download, Trophy, BarChart } from "lucide-react";

export default function LandingPage() {
  const homeRef = useRef(null);
  const lessonsRef = useRef(null);
  const quizzesRef = useRef(null);
  const progressRef = useRef(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const scrollToSection = (section) => {
    const refs = {
      home: homeRef,
      lessons: lessonsRef,
      quizzes: quizzesRef,
      progress: progressRef,
    };
    refs[section]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="pt-20">
      {/* Navbar */}
      <Navbar onOpenAuth={openAuth} scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <div ref={homeRef}>
        <Hero onOpenAuth={openAuth} />
      </div>

      {/* LESSONS PREVIEW SECTION */}
      <section
        ref={lessonsRef}
        className="bg-linear-to-br from-blue-50 to-white py-20 px-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">
            AI-Powered Interactive Lessons
          </h2>
          <p className="text-gray-600 mb-12">
            Experience smart, engaging lessons that adapt to your skill level —
            built around the Philippine K-12 curriculum.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <LessonCard
              icon={<BookOpen className="text-blue-700" size={36} />}
              title="Science Adventure"
              description="Explore fun, interactive science lessons with visuals, videos, and adaptive learning paths."
            />
            <LessonCard
              icon={<Download className="text-green-600" size={36} />}
              title="Offline Learning"
              description="Download lessons and study anytime, even without an internet connection."
            />
            <LessonCard
              icon={<Star className="text-yellow-500" size={36} />}
              title="Earn Stars & Rewards"
              description="Complete lessons to earn stars and unlock fun achievements as you progress!"
            />
          </div>

          <button
            onClick={() => openAuth("register")}
            className="mt-10 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Start Learning Today
          </button>
        </div>
      </section>

      {/* QUIZZES PREVIEW SECTION */}
      <section
        ref={quizzesRef}
        className="bg-white py-20 px-6 border-t border-gray-200"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Gamified Quizzes & Mini-Games
          </h2>
          <p className="text-gray-600 mb-12">
            Test your knowledge through exciting, interactive quizzes designed
            to challenge and reward you.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <QuizCard
              icon={<Trophy className="text-yellow-500" size={36} />}
              title="Level-Based Quizzes"
              description="AI adjusts difficulty based on your previous performance for continuous improvement."
            />
            <QuizCard
              icon={<Star className="text-blue-600" size={36} />}
              title="Earn Badges"
              description="Collect badges as you master topics and improve your skills."
            />
            <QuizCard
              icon={<BookOpen className="text-green-600" size={36} />}
              title="Mini-Games"
              description="Learn while playing educational mini-games designed for engagement and retention."
            />
          </div>

          <button
            onClick={() => openAuth("register")}
            className="mt-10 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Take a Quiz
          </button>
        </div>
      </section>

      {/* PROGRESS PREVIEW SECTION */}
      <section
        ref={progressRef}
        className="bg-linear-to-t from-gray-50 to-white py-20 px-6 border-t border-gray-100"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">
            Track Your Progress & Achievements
          </h2>
          <p className="text-gray-600 mb-12">
            Stay motivated with visual progress charts, AI feedback, and
            parent-accessible reports.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <ProgressCard
              icon={<BarChart className="text-blue-700" size={36} />}
              title="Smart Progress Tracking"
              description="See how you’re improving with AI-powered performance analytics."
            />
            <ProgressCard
              icon={<Star className="text-yellow-500" size={36} />}
              title="Achievements & Rewards"
              description="Earn trophies and celebrate milestones as you complete lessons and quizzes."
            />
            <ProgressCard
              icon={<BookOpen className="text-green-600" size={36} />}
              title="Parent Dashboard"
              description="Parents can monitor progress and quiz results securely via a PIN-protected dashboard."
            />
          </div>

          <button
            onClick={() => openAuth("register")}
            className="mt-10 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Sign Up to Track Your Growth
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

// 🔹 Reusable Preview Cards
function LessonCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function QuizCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function ProgressCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
