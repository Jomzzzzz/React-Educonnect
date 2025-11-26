// src/components/AuthModal.jsx

import { useEffect, useState } from "react";
import { postJSON } from "../../utils/api";
import { Eye, EyeOff } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setForm({ name: "", email: "", password: "" });
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (k) => (e) =>
    setForm({ ...form, [k]: e.target.value.trimStart() });

  // --------------------
  // FRONT-END VALIDATIONS
  // --------------------
  const validateLogin = () => {
    if (!form.email || !form.password)
      return "All fields are required.";

    // Allow both gmail.com and educonnect.com
    if (!/^[a-zA-Z0-9._%+-]+@(gmail\.com|educonnect\.com)$/i.test(form.email))
      return "Email must be @gmail.com or @educonnect.com.";

    return null;
  };

  const validateRegister = () => {
    if (!form.name || !form.email || !form.password)
      return "All fields are required.";

    // Email must be Gmail or EduConnect
    if (!/^[a-zA-Z0-9._%+-]+@(gmail\.com|educonnect\.com)$/i.test(form.email))
      return "Email must be @gmail.com or @educonnect.com.";

    // Strong Password
    const strongPass =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

    if (!strongPass.test(form.password))
      return "Password must be 8–12 characters, including uppercase, lowercase, number & special character.";

    return null;
  };

  // --------------------
  // FORM SUBMIT
  // --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let error = mode === "login" ? validateLogin() : validateRegister();
      if (error) {
        setMessage(error);
        setLoading(false);
        return;
      }

      // LOGIN
      if (mode === "login") {
        const res = await postJSON("login.php", {
          email: form.email,
          password: form.password,
        });

        if (res.success) {
          setMessage("✅ Login successful! Redirecting...");

          // -------- ADMIN EMAIL CHECK --------
          const isAdmin =
            form.email.toLowerCase() === "dev@educonnect.com";

          setTimeout(() => {
            onClose();
            window.location.href = isAdmin ? "/admin" : "/dashboard";
          }, 800);
        } else {
          setMessage(res.message || "Invalid email or password.");
        }
      }

      // REGISTER
      else {
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

  // --------------------
  // UI
  // --------------------
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-11/12 sm:w-[420px] bg-white shadow-xl p-10 relative 
          animate-[fadeIn_0.25s_ease-out]
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-4 text-2xl text-gray-400 hover:text-gray-600"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/src/assets/icon4login.png"
            alt="icon"
            className="w-24 mx-auto mb-3"
          />

          {mode === "login" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to continue learning
              </p>
            </>
          ) : (
            <button
              onClick={() => setMode("login")}
              className="text-gray-600 text-sm hover:underline"
            >
              ← Back to Login
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {mode === "login" ? "Login to your account" : "Create your account"}
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Full Name"
              className="
                w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition
              "
              required
            />
          )}

          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="Email"
            className="
              w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition
            "
            required
          />

          {/* PASSWORD WITH SHOW/HIDE */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Password"
              className="
                w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition
              "
              required
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold 
              hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-40
            "
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`text-center mt-3 text-sm ${
              message.startsWith("✅")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Footer */}
        {mode === "login" ? (
          <div className="text-center mt-5 text-sm text-gray-700">
            <p>
              Don’t have an account?
              <button
                onClick={() => setMode("register")}
                className="ml-1 text-blue-600 font-medium hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          <div className="text-center mt-5 text-sm text-gray-700">
            Already registered?
            <button
              onClick={() => setMode("login")}
              className="ml-1 text-blue-600 font-medium hover:underline"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
