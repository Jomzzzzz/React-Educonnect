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
    <h2 className="text-4xl font-bold text-blue-700 mb-4">
      Unlock Your AI-Powered Lessons
    </h2>
    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
      Dive into smart, interactive lessons designed for K-12 students. Track your progress, get AI feedback, and stay ahead in every subject.
    </p>

    <div className="grid md:grid-cols-3 gap-8">
      <LessonCard
        icon={<BookOpen className="text-blue-700" size={36} />}
        title="Math & Science Mastery"
        description="Engage with interactive math and science lessons, complete with worksheets and visual explanations."
      />
      <LessonCard
        icon={<Download className="text-green-600" size={36} />}
        title="Offline Learning"
        description="Download lessons and practice anywhere, anytime — no internet needed!"
      />
      <LessonCard
        icon={<Star className="text-yellow-500" size={36} />}
        title="Personalized Progress"
        description="AI recommends topics to focus on based on your weaknesses and strengths."
      />
    </div>

    <button
      onClick={() => openAuth("register")}
      className="mt-10 px-6 py-3 bg-blue-700 text-white rounded-xl shadow-lg hover:bg-blue-800 transition transform hover:scale-105"
    >
      Continue Learning Now
    </button>
  </div>
</section>

{/* QUIZZES PREVIEW SECTION */}
<section
  ref={quizzesRef}
  className="bg-white py-20 px-6 border-t border-gray-200"
>
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-4xl font-bold text-green-700 mb-4">
      Test Yourself with Fun Quizzes
    </h2>
    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
      Challenge your knowledge with interactive quizzes and mini-games. Earn badges, track your weak topics, and stay motivated.
    </p>

    <div className="grid md:grid-cols-3 gap-8">
      <QuizCard
        icon={<Trophy className="text-yellow-500" size={36} />}
        title="Adaptive Quizzes"
        description="AI adjusts difficulty based on your previous answers to maximize learning."
      />
      <QuizCard
        icon={<Star className="text-blue-600" size={36} />}
        title="Collect Badges"
        description="Earn badges and rewards as you master each topic."
      />
      <QuizCard
        icon={<BookOpen className="text-green-600" size={36} />}
        title="Mini-Games"
        description="Learn through gamified activities designed to boost retention."
      />
    </div>

    <button
      onClick={() => openAuth("register")}
      className="mt-10 px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-105"
    >
      Take a Quiz Now
    </button>
  </div>
</section>

{/* PROGRESS PREVIEW SECTION */}
<section
  ref={progressRef}
  className="bg-linear-to-t from-gray-50 to-white py-20 px-6 border-t border-gray-100"
>
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-4xl font-bold text-blue-700 mb-4">
      Track Your Progress & Achievements
    </h2>
    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
      Visualize your learning journey with smart charts, see which subjects need attention, and earn trophies for your achievements.
    </p>

    <div className="grid md:grid-cols-3 gap-8">
      <ProgressCard
        icon={<BarChart className="text-blue-700" size={36} />}
        title="Smart Progress Tracking"
        description="AI-powered insights show which topics you need to review or strengthen."
      />
      <ProgressCard
        icon={<Star className="text-yellow-500" size={36} />}
        title="Achievements & Rewards"
        description="Earn stars and trophies as you complete lessons and quizzes."
      />
      <ProgressCard
        icon={<BookOpen className="text-green-600" size={36} />}
        title="Parent Dashboard"
        description="Parents can track progress securely and help students improve efficiently."
      />
    </div>

    <button
      onClick={() => openAuth("register")}
      className="mt-10 px-6 py-3 bg-blue-700 text-white rounded-xl shadow-lg hover:bg-blue-800 transition transform hover:scale-105"
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
