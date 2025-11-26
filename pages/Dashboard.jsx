import { useEffect, useState, useRef } from "react";
import { getJSON, postJSON } from "/utils/api";
import { getDashboardWelcome } from "/utils/api";
import DynamicCalendar from "/src/components/DynamicCalendar";

import {
  BookOpen,
  Home,
  ListChecks,
  ChartBar,
  Menu,
  X,
} from "lucide-react";
import Lessons from "/src/components/Lessons";
import Quizzes from "/src/components/Quizzes";
import Progress from "/src/components/Progress";
import EditProfileModal from "/src/components/EditProfileModal";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiPopup, setAiPopup] = useState(null);
  const welcomeFetched = useRef(false);
  const dropdownRef = useRef(null);

  /* --------------------- Validate Session --------------------- */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await getJSON("validate_session.php");
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          window.location.href = "/";
        }
      } catch (err) {
        console.error("Session check failed:", err);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  /* --------------------- Restore last tab --------------------- */
  useEffect(() => {
    if (!loading && user) {
      const savedTab = localStorage.getItem("activeTab");
      setActiveSection(savedTab || "home");
    }
  }, [loading, user]);

  /* --------------------- Persist active tab --------------------- */
  useEffect(() => {
    if (activeSection) {
      localStorage.setItem("activeTab", activeSection);
    }
  }, [activeSection]);

 /* --------------------- 🆕 AI WELCOME MESSAGE (FIXED) --------------------- */
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
        if (!user?.id) return;

        const sessionKey = `welcome_shown_${user.id}`;
        
        // 🔒 2. CHECK LOCK: Kung tapos na or on-going na, WAG NA ITULOY
        if (welcomeFetched.current || sessionStorage.getItem(sessionKey)) {
            return;
        }

        // 🔒 3. SET LOCK IMMEDIATELY
        welcomeFetched.current = true;

        try {
            const res = await getDashboardWelcome(user.id);

            if (res.success) {
                setAiPopup({
                    title: res.title,
                    message: res.message,
                    type: res.type
                });
                sessionStorage.setItem(sessionKey, "true");
            }
        } catch (error) {
            // Optional: Kung nag-error, pwede i-reset ang lock para maka-try ulit (depende sa gusto mo)
            console.error("Welcome error:", error);
        }
    };

    if (user) {
        fetchWelcomeMessage();
    }
  }, [user]);

  /* --------------------- Dropdown Logic --------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await postJSON("logout.php");
      if (res.success) {
        localStorage.removeItem("user");
        localStorage.removeItem("activeTab");
        sessionStorage.clear(); // Clear session so welcome shows again on next login
        window.location.href = "/";
      } else {
        alert("Logout failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while logging out.");
    }
  };

  // Helper for Popup Styles
  const getPopupStyles = (type) => {
      switch(type) {
          case 'success': return { border: 'border-green-500', text: 'text-green-600', icon: '🎉', btn: 'bg-green-500 hover:bg-green-600' };
          case 'info': return { border: 'border-blue-500', text: 'text-blue-600', icon: '👋', btn: 'bg-blue-600 hover:bg-blue-700' };
          default: return { border: 'border-gray-500', text: 'text-gray-600', icon: '🤖', btn: 'bg-gray-600 hover:bg-gray-700' };
      }
  };

  if (loading || activeSection === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking your session...
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { key: "home", label: "Home", icon: <Home size={18} /> },
    { key: "lessons", label: "Lessons", icon: <BookOpen size={18} /> },
    { key: "quizzes", label: "Quizzes", icon: <ListChecks size={18} /> },
    { key: "progress", label: "Progress", icon: <ChartBar size={18} /> },
  ];

  const defaultAvatar = "http://localhost/educonnect-backend/uploads/default-profile.png";

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      
      {/* SIDEBAR */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-blue-700 text-white flex flex-col py-6 px-4 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold tracking-wide">EduConnect</h1>
          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition text-sm ${
                activeSection === key
                  ? "bg-blue-900 font-semibold"
                  : "hover:bg-blue-800"
              }`}
            >
              {icon}
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="flex items-center justify-between bg-white shadow px-4 md:px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-blue-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-blue-700 capitalize">
              {activeSection}
            </h2>
          </div>

         <div className="relative" ref={dropdownRef}>
  <button
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="flex items-center gap-2 px-0 transition-all duration-200 focus:outline-none"
  >
    <img
      src={user.avatar_url ? `http://localhost/educonnect-backend/${user.avatar_url}` : defaultAvatar}
      alt="Avatar"
      className="w-7 h-7 rounded-full object-cover"
    />
    <span className="text-gray-800 font-medium text-sm hidden sm:inline truncate max-w-[120px]">
      {user.full_name || user.name || user.email}
    </span>
    <svg
      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </button>

  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg overflow-hidden z-20">
      <button
        onClick={() => {
          setDropdownOpen(false);
          setEditOpen(true);
        }}
        className="w-full text-left px-4 py-2 text-gray-700 text-sm hover:bg-gray-100 transition"
      >
        Edit Profile
      </button>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-red-500 text-sm hover:bg-gray-100 transition"
      >
        Log Out
      </button>
    </div>
  )}
</div>

        </header>

        <main className="flex-1 p-6 overflow-y-auto">
           {activeSection === "home" && (
  <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">

    {/* LEFT CONTENT */}
    <div className="col-span-2 space-y-6">

    

      {/* HERO CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-gray-800">
            Welcome back, {user.full_name}!
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            New learning modules are available. Continue your progress now.
          </p>
           <button
      onClick={() => setActiveSection("lessons")} // ✅ Switch to Lessons tab
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
    >
      Continue Learning
    </button>
        </div>

        <img
          src="/src/assets/home-icon.png"
          className="w-40 hidden md:block"
        />
      </div>

    {/* WEAK SUBJECTS TABLE — updated Lessons view */}
<div>
  <div className="flex justify-between items-center mb-3">
    <h2 className="font-semibold text-lg">Lessons Weakness</h2>
    <button className="text-blue-600 text-sm">View All</button>
  </div>

  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-gray-500">
        <tr>
          <th className="p-3 text-left">Subject</th>
          <th className="p-3 text-left">Weak Topic</th>
          <th className="p-3 text-left">Difficulty</th>
          <th className="p-3 text-left">Material</th>
          <th className="p-3 text-left">Status</th>
        </tr>
      </thead>

      <tbody>
        {[
          {
            subject: "Mathematics",
            topic: "Fractions & Decimals",
            difficulty: "High",
            material: "Practice Worksheet",
            status: "Needs Review",
          },
          {
            subject: "Mother Tongue",
            topic: "Reading Comprehension",
            difficulty: "Medium",
            material: "Story Exercises",
            status: "Needs Review",
          },
          {
            subject: "Music",
            topic: "Rhythm & Beats",
            difficulty: "Medium",
            material: "Audio Practice",
            status: "Needs Review",
          },
          {
            subject: "Physical Education",
            topic: "Coordination Skills",
            difficulty: "Low",
            material: "PE Drills",
            status: "Needs Practice",
          },
          {
            subject: "Science",
            topic: "States of Matter",
            difficulty: "Medium",
            material: "Video Lesson",
            status: "Needs Review",
          },
        ].map((item, idx) => (
          <tr key={idx} className="border-b">
            <td className="p-3 font-medium">{item.subject}</td>
            <td className="p-3">{item.topic}</td>
            <td className="p-3">{item.difficulty}</td>
            <td className="p-3 text-blue-600 cursor-pointer">{item.material}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  item.status === "Needs Practice"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    </div>

    {/* RIGHT SIDEBAR */}
    <div className="space-y-6">

    
  {/* USER CARD */}
  <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
    <img
      src={
        user.avatar_url
          ? `http://localhost/educonnect-backend/${user.avatar_url}`
          : defaultAvatar
      }
      className="w-20 h-20 rounded-full mx-auto mb-3"
    />
    <h3 className="font-semibold text-lg">{user.full_name}</h3>
    <p className="text-gray-500 text-sm">{user.email}</p> {/* Added email */}
    <p className="text-gray-400 text-sm">Student</p>

  </div>
      <DynamicCalendar />

      {/* REMINDERS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-semibold mb-2">Reminders</h3>

        {[
         
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              🔔
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{item}</p>
              <p className="text-xs text-gray-500">12 Dec 2022, Friday</p>
            </div>
          </div> 
        ))} 
      </div>
    </div>
  </div>
)} 
          {activeSection === "lessons" && (
          <Lessons
            onTakeQuiz={() => {
              setActiveSection("quizzes");
            }}
            user={user}  
          />
        )}

          {activeSection === "quizzes" && <Quizzes user={user} />}

          {activeSection === "progress" && <Progress />}
        </main>
      </div>

      {/* 🆕 AI WELCOME POPUP */}
      {aiPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4">
            {(() => {
                const style = getPopupStyles(aiPopup.type);
                return (
                    <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-8 transform transition-all scale-100 ${style.border}`}>
                        <div className="text-6xl mb-4 animate-bounce">
                            {style.icon}
                        </div>
                        {/* This title now comes from the API (e.g., "Welcome to EduConnect!") */}
                        <h2 className={`text-2xl font-bold mb-2 ${style.text}`}>
                            {aiPopup.title}
                        </h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            {aiPopup.message}
                        </p>
                        <button 
                            onClick={() => setAiPopup(null)}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition transform hover:scale-105 ${style.btn}`}
                        >
                            Let's Go!
                        </button>
                    </div>
                );
            })()}
        </div>
      )}

      {editOpen && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }}
        />
      )}
    </div>
  );
}