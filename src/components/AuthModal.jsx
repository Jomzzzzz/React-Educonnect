// src/components/AuthModal.jsx

import { useEffect, useState } from "react";
import { postJSON } from "../../utils/api";

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setForm({ name: "", email: "", password: "" });
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "login") {
        const res = await postJSON("login.php", {
          email: form.email,
          password: form.password,
        });

        if (res.success) {
          setMessage("✅ Login successful! Redirecting...");
          setTimeout(() => {
            onClose();
            window.location.href =
              res.user.role === "admin" ? "/admin" : "/dashboard";
          }, 800);
        } else {
          setMessage(res.message);
        }
      } else {
        const res = await postJSON("register.php", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setMessage(
          res.success
            ? "✅ Registration successful! You can now log in."
            : res.message
        );
      }
    } catch {
      setMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl p-6 w-11/12 sm:w-[420px] relative animate-fadeIn"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-2xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        <h3 className="text-center text-2xl font-bold text-blue-700 mb-4">
          {mode === "login" ? "Sign in to EduConnect" : "Create an account"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Full Name"
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
              required
            />
          )}
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="Email"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            placeholder="Password"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-md font-semibold transition-all duration-300"
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {message && (
          <div className="mt-3 text-center text-sm">
            <span
              className={
                message.startsWith("✅")
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {message}
            </span>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-blue-700 font-semibold ml-1 hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
