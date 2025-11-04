import { useEffect, useState } from "react";
import {
  fetchAdminLessons,
  saveLesson,
  deleteLesson,
  uploadLessonFile,
  logoutUser,
} from "/utils/api";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  Trash2,
  LogOut,
  Pencil,
  FileUp,
  Youtube,
} from "lucide-react";

export default function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: null,
    title: "",
    content: "",
    study_guide: "",
    video_url: "",
    difficulty: "easy",
    file: "",
  });

  // ✅ Load lessons from backend
  const loadLessons = async () => {
    const res = await fetchAdminLessons();
    if (res.success && res.lessons) setLessons(res.lessons);
  };

  useEffect(() => {
    loadLessons();
  }, []);

  // ✅ Smooth Logout
  const handleLogout = async () => {
    setLoggingOut(true);
    const res = await logoutUser();
    localStorage.removeItem("user");
    setTimeout(() => {
      alert(res.message || "Logged out successfully!");
      setLoggingOut(false);
      navigate("/", { replace: true });
    }, 500);
  };

  // ✅ Add or Update Lesson
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!form.title.trim()) {
      alert("Lesson title is required.");
      setLoading(false);
      return;
    }

    // Send to backend
    const res = await saveLesson(form);
    alert(res.message);

    if (res.success) {
      setShowForm(false);
      setForm({
        id: null,
        title: "",
        content: "",
        study_guide: "",
        video_url: "",
        difficulty: "easy",
        file: "",
      });
      loadLessons();
    }
    setLoading(false);
  };

  // ✅ Edit Existing
  const handleEdit = (lesson) => {
    setForm(lesson);
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    const res = await deleteLesson(id);
    alert(res.message);
    if (res.success) loadLessons();
  };

  // ✅ File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadLessonFile(file);
    if (res.success) {
      setForm((prev) => ({ ...prev, file: res.file }));
      alert("File uploaded successfully!");
    } else {
      alert(res.message);
    }
  };

  // ✅ YouTube Preview
  const formatYouTubeURL = (url) => {
    if (!url) return "";
    return url
      .replace("watch?v=", "embed/")
      .replace("youtu.be/", "www.youtube.com/embed/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-6 space-y-6">
        <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="text-yellow-400" /> EduConnect Admin
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition"
          >
            <PlusCircle size={18} /> Add New Lesson
          </button>
        </nav>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 ${
            loggingOut ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loggingOut ? "Logging out..." : <><LogOut size={18} /> Logout</>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto animate-fadeIn">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            📘 Lesson Management
          </h1>
        </header>

        {/* Lessons Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left font-semibold">Title</th>
                <th className="p-3 text-left font-semibold">Difficulty</th>
                <th className="p-3 text-left font-semibold">Video</th>
                <th className="p-3 text-left font-semibold">File</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">{lesson.title}</td>
                    <td className="p-3 capitalize">{lesson.difficulty}</td>
                    <td className="p-3">
                      {lesson.video_url ? (
                        <a
                          href={lesson.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Youtube size={16} /> Watch
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-sm text-blue-600">
                      {lesson.file || "—"}
                    </td>
                    <td className="p-3 space-x-3">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="text-yellow-600 hover:underline"
                      >
                        <Pencil size={18} className="inline" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="text-red-600 hover:underline"
                      >
                        <Trash2 size={18} className="inline" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No lessons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <FileUp className="text-blue-600" />
              {form.id ? "Edit Lesson" : "Add New Lesson"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Lesson Title */}
              <input
                type="text"
                placeholder="Lesson Title"
                className="w-full border p-2 rounded"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              {/* Lesson Content */}
              <textarea
                placeholder="Lesson Content (HTML supported)"
                className="w-full border p-2 rounded min-h-[120px]"
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                required
              />

              {/* Study Guide */}
              <textarea
                placeholder="Study Guide (optional)"
                className="w-full border p-2 rounded min-h-20"
                value={form.study_guide}
                onChange={(e) =>
                  setForm({ ...form, study_guide: e.target.value })
                }
              />

              {/* Video URL */}
              <div>
                <input
                  type="url"
                  placeholder="YouTube Video URL"
                  className="w-full border p-2 rounded"
                  value={form.video_url}
                  onChange={(e) =>
                    setForm({ ...form, video_url: e.target.value })
                  }
                />
                {form.video_url && (
                  <iframe
                    className="w-full aspect-video mt-2 rounded-lg border"
                    src={formatYouTubeURL(form.video_url)}
                    title="Preview"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Difficulty */}
              <select
                className="border p-2 rounded"
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* File Upload */}
              <div>
                <input type="file" onChange={handleFileUpload} />
                {form.file && (
                  <p className="text-green-600 text-sm mt-1">
                    Uploaded: {form.file}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {loading
                    ? "Saving..."
                    : form.id
                    ? "Update Lesson"
                    : "Add Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
