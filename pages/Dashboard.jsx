import { useEffect, useState, useRef } from "react";
import { getJSON, postJSON } from "/utils/api";
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

  /* --------------------- Restore last tab after login --------------------- */
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

  /* --------------------- Dropdown Close on Outside Click --------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --------------------- Logout --------------------- */
  const handleLogout = async () => {
    try {
      const res = await postJSON("logout.php");
      if (res.success) {
        localStorage.removeItem("user");
        localStorage.removeItem("activeTab");
        window.location.href = "/";
      } else {
        alert("Logout failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while logging out.");
    }
  };

  /* --------------------- Loading State --------------------- */
  if (loading || activeSection === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking your session...
      </div>
    );
  }

  if (!user) return null;

  /* --------------------- Sidebar Navigation Items --------------------- */
  const navItems = [
    { key: "home", label: "Home", icon: <Home size={18} /> },
    { key: "lessons", label: "Lessons", icon: <BookOpen size={18} /> },
    { key: "quizzes", label: "Quizzes", icon: <ListChecks size={18} /> },
    { key: "progress", label: "Progress", icon: <ChartBar size={18} /> },
  ];

  const defaultAvatar =
    "http://localhost/educonnect-backend/uploads/default-profile.png";

  /* --------------------- Render --------------------- */
  return (
    <div className="flex min-h-screen bg-gray-50">
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
        {/* HEADER */}
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
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition"
            >
              <img
                src={
                  user.avatar_url
                    ? `http://localhost/educonnect-backend/${user.avatar_url}`
                    : defaultAvatar
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-gray-700 font-medium hidden sm:inline">
                {user.full_name || user.name || user.email}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setEditOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT SECTIONS */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === "home" && (
            <section className="text-gray-700 animate-fadeIn">
              <h1 className="text-2xl font-bold mb-3">
                Welcome, {user.full_name || user.name} 🎓
              </h1>
              <p className="text-gray-600">
                Continue your journey in interactive learning, track your progress,
                and explore personalized lessons just for you!
              </p>
            </section>
          )}

          {activeSection === "lessons" && (
            <Lessons
              onTakeQuiz={() => {
                setActiveSection("quizzes");
              }}
            />
          )}

          {activeSection === "quizzes" && <Quizzes />}

          {activeSection === "progress" && <Progress />}
        </main>
      </div>

      {/* EDIT PROFILE MODAL */}
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
