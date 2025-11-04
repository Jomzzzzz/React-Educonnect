// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar({ onOpenAuth, scrollToSection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", id: "home" },
    { name: "Lessons", id: "lessons" },
    { name: "Quizzes", id: "quizzes" },
    { name: "Progress", id: "progress" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 lg:px-10">
        {/* Brand */}
        <div
          className="text-2xl font-extrabold text-blue-700 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => scrollToSection("home")}
        >
          EduConnect
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
          {links.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollToSection(link.id)}
                className="hover:text-blue-700 transition-colors"
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onOpenAuth("login")}
            className="px-4 py-2 border border-blue-700 rounded-md text-blue-700 hover:bg-blue-50 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth("register")}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-sm animate-fadeIn">
          <div className="flex flex-col items-center py-4 gap-3">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  scrollToSection(link.id);
                  setMenuOpen(false);
                }}
                className="text-gray-700 hover:text-blue-700"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth("login");
              }}
              className="w-4/5 px-4 py-2 border rounded-md border-blue-700 text-blue-700"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth("register");
              }}
              className="w-4/5 px-4 py-2 bg-blue-700 text-white rounded-md"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
