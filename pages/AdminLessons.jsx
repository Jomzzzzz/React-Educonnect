import { useEffect, useState } from "react";
import {
  fetchAdminLessons,
  saveLesson,
  deleteLesson,
  uploadLessonFile,
  logoutUser,
  getJSON // 👈 IMPORT THIS to fetch subjects
} from "/utils/api";
import { useNavigate, Link } from "react-router-dom"; 
import {
  BookOpen,
  PlusCircle,
  Trash2,
  LogOut,
  Pencil,
  FileUp,
  Youtube,
  ListChecks,
} from "lucide-react";

export default function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]); // 🆕 Store subjects from DB
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  // ✅ Updated Form State with Grade, Subject, and Slug
  const [form, setForm] = useState({
    id: null,
    title: "",
    content: "",
    study_guide: "",
    video_url: "",
    difficulty: "easy",
    grade_level_id: 1, // 🆕 Default Grade
    subject_id: "",    // 🆕 Subject Selection
    slug: "",          // 🆕 Topic Grouping
    file: "",
  });

  // ✅ Load lessons AND subjects
  const loadData = async () => {
    const resLessons = await fetchAdminLessons();
    if (resLessons.success && resLessons.lessons) setLessons(resLessons.lessons);

    const resSubjects = await getJSON("api/get_all_subjects.php"); // 🆕 Fetch subjects
    if (resSubjects.success) setSubjects(resSubjects.subjects);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Auto-generate Slug from Title (Quality of Life feature)
  const handleTitleChange = (e) => {
    const title = e.target.value;
    // Simple slug generator: "Basic Math" -> "basic-math"
    // Only auto-fill if slug is empty or matching previous title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setForm(prev => ({ ...prev, title, slug: prev.slug ? prev.slug : slug })); 
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.title.trim() || !form.subject_id) {
      alert("Title and Subject are required.");
      setLoading(false);
      return;
    }

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
        grade_level_id: 1,
        subject_id: "",
        slug: "",
        file: "",
      });
      loadData();
    }
    setLoading(false);
  };

  const handleEdit = (lesson) => {
    // Ensure numbers are numbers for the select inputs
    setForm({
        ...lesson,
        grade_level_id: Number(lesson.grade_level_id),
        subject_id: Number(lesson.subject_id)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    const res = await deleteLesson(id);
    alert(res.message);
    if (res.success) loadData();
  };

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

  const formatYouTubeURL = (url) => {
    if (!url) return "";
    return url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-6 space-y-6">
        <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="text-yellow-400" /> EduConnect Admin
        </div>

        <nav className="flex-1 space-y-2">
          {/* Active Lessons Tab */}
          <div className="w-full flex items-center gap-2 bg-blue-800 text-white py-2 px-4 rounded-lg transition font-bold shadow-inner">
            <BookOpen size={18} /> Manage Lessons
          </div>

          {/* Link to Quizzes */}
          <Link to="/admin/quizzes" className="w-full flex items-center gap-2 text-blue-200 hover:bg-blue-800 hover:text-white py-2 px-4 rounded-lg transition">
            <ListChecks size={18} /> Manage Quizzes
          </Link>
        </nav>

        <button onClick={handleLogout} disabled={loggingOut} className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 ${loggingOut ? "opacity-70 cursor-not-allowed" : ""}`}>
          {loggingOut ? "Logging out..." : <><LogOut size={18} /> Logout</>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto animate-fadeIn">
        {/* 👇 BUTTON MOVED HERE 👇 */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📘 Lesson Management</h1>
          
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition shadow-md"
          >
            <PlusCircle size={18} /> Add New Lesson
          </button>
        </header>
        {/* 👆 BUTTON MOVED HERE 👆 */}

        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left font-semibold">Grade</th>
                <th className="p-3 text-left font-semibold">Subject</th>
                <th className="p-3 text-left font-semibold">Title</th>
                <th className="p-3 text-left font-semibold">Difficulty</th>
                <th className="p-3 text-left font-semibold">Topic Slug</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <tr key={lesson.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">Grade {lesson.grade_level_id}</td>
                    <td className="p-3">{lesson.subject_name || "ID: " + lesson.subject_id}</td>
                    <td className="p-3 font-medium">{lesson.title}</td>
                    <td className="p-3 capitalize">{lesson.difficulty}</td>
                    <td className="p-3 text-gray-500">{lesson.slug}</td>
                    <td className="p-3 space-x-3 flex">
                      <button onClick={() => handleEdit(lesson)} className="text-yellow-600 hover:underline flex items-center gap-1">
                        <Pencil size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(lesson.id)} className="text-red-600 hover:underline flex items-center gap-1">
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-6 italic">No lessons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ... Modal Code remains exactly the same ... */}
      {showForm && (
        // ... (Don't change anything inside the modal logic)
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            {/* ... keep your existing modal code here ... */}
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <FileUp className="text-blue-600" />
              {form.id ? "Edit Lesson" : "Add New Lesson"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Grade Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                    <select className="w-full border p-2 rounded" value={form.grade_level_id} onChange={e => setForm({...form, grade_level_id: e.target.value})}>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                </div>

                {/* Subject Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full border p-2 rounded" value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} required>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                <input type="text" className="w-full border p-2 rounded" value={form.title} onChange={handleTitleChange} required />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic Slug (AI Grouping)
                </label>
                <input type="text" className="w-full border p-2 rounded bg-gray-50" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
                <p className="text-xs text-gray-500 mt-1">Important: Use the SAME slug for Easy, Medium, and Hard versions of the same topic (e.g. "math-addition").</p>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select className="w-full border p-2 rounded" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input type="url" className="w-full border p-2 rounded" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} />
                {/* Video Preview */}
                {form.video_url && (
                  <div className="mt-2">
                    <iframe
                      className="w-full aspect-video rounded-lg border bg-black"
                      src={formatYouTubeURL(form.video_url)}
                      title="Video Preview"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content / Description</label>
                <textarea className="w-full border p-2 rounded min-h-[100px]" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach File (Optional)</label>
                <input type="file" onChange={handleFileUpload} />
                {form.file && <p className="text-green-600 text-sm mt-1">Uploaded: {form.file}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
                  {loading ? "Saving..." : form.id ? "Update Lesson" : "Add Lesson"}
                </button>
              </div>
            </form>
            </div>
        </div>
      )}
    </div>
  );
}