// src/components/Hero.jsx

import { useState } from "react";
import studentImg from "../assets/student.png";
import AuthModal from "./AuthModal"; // import your latest AuthModal

export default function Hero() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-10 lg:px-20 pt-28 md:pt-32 pb-16 bg-[linear-gradient(135deg,#72C4FF_23%,#DBE6F3_88%)]"
    >
      {/* Left Section */}
      <div className="flex-1 text-center md:text-left space-y-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
          Best Digital Online <br /> Education!
        </h1>
        <p className="text-gray-700 text-lg max-w-lg mx-auto md:mx-0">
          Unlock your learning potential with{" "}
          <span className="text-blue-700 font-semibold">EduConnect.</span>
        </p>
        <div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition duration-300"
          >
            Join Class
          </button>
        </div>
      </div>

      {/* Right Section (Image + Circle) */}
      <div className="flex-1 flex justify-center mt-12 md:mt-0 relative">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#FF6666] scale-105 shadow-lg"></div>
          <img
            src={studentImg}
            alt="Student learning online"
            className="relative w-4/5 sm:w-3/4 md:w-full h-auto object-contain drop-shadow-xl"
            loading="lazy"
          />
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </section>
  );
}
