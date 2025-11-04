// src/pages/ParentDashboard.jsx
import { useState } from "react";
import { Lock, Eye } from "lucide-react";
import Progress from "../components/Progress";

export default function ParentDashboard() {
  const [pin, setPin] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === "1234") setAccessGranted(true);
    else alert("Invalid PIN");
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">👨‍👩‍👧 Parent Access</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-80 text-center">
          <Lock className="mx-auto mb-3 text-gray-500" size={32} />
          <input
            type="password"
            placeholder="Enter Parent PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border rounded-md p-2 mb-3 text-center"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          📊 Parent Dashboard
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Monitor your child's learning progress, quiz results, and achievements.
        </p>
        <Progress />
      </div>
    </div>
  );
}
