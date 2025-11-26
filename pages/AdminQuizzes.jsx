import { useEffect, useState, useCallback } from "react"; // 👈 Added useCallback
import { getJSON, postJSON, logoutUser } from "/utils/api";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  Trash2,
  LogOut,
  Pencil,
  ListChecks,
  FileText,
  Save,
  X
} from "lucide-react";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);  
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState(null); // 🆕 Tracks which quiz is open for questions
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: null,
    lesson_id: "",
    title: "",
    description: "",
  });

  // ✅ Load Data
  const loadData = async () => {
    const resQuizzes = await getJSON("api/get_admin_quizzes.php");
    if (resQuizzes.success) setQuizzes(resQuizzes.quizzes);

    const resLessons = await getJSON("api/get_admin_lessons.php");
    if (resLessons.success) setLessons(resLessons.lessons);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Save Quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.title.trim() || !form.lesson_id) {
      alert("Title and Lesson are required.");
      setLoading(false);
      return;
    }

    const res = await postJSON("api/save_quiz.php", form);
    alert(res.message);

    if (res.success) {
      setShowForm(false);
      setForm({ id: null, lesson_id: "", title: "", description: "" });
      loadData();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    const res = await postJSON("api/delete_quiz.php", { id });
    alert(res.message);
    if (res.success) loadData();
  };

  const handleEdit = (quiz) => {
    setForm({
      id: quiz.id,
      lesson_id: quiz.lesson_id,
      title: quiz.title,
      description: quiz.description,
    });
    setShowForm(true);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
    localStorage.removeItem("user");
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-6 space-y-6">
        <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="text-yellow-400" /> EduConnect Admin
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="w-full flex items-center gap-2 text-blue-200 hover:bg-blue-800 hover:text-white py-2 px-4 rounded-lg transition">
            <BookOpen size={18} /> Manage Lessons
          </Link>
          <div className="w-full flex items-center gap-2 bg-blue-800 text-white py-2 px-4 rounded-lg transition font-bold shadow-inner">
            <ListChecks size={18} /> Manage Quizzes
          </div>
        </nav>

        <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-2 text-red-300 hover:text-red-100">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto animate-fadeIn">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🧠 Quiz Management</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition shadow-md">
            <PlusCircle size={18} /> Create Quiz
          </button>
        </header>

        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left font-semibold">Quiz Title</th>
                <th className="p-3 text-left font-semibold">Attached To Lesson</th>
                <th className="p-3 text-left font-semibold">Description</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length > 0 ? (
                quizzes.map((q) => (
                  <tr key={q.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{q.title}</td>
                    <td className="p-3 text-blue-600 font-medium">{q.lesson_title || "Unknown Lesson"}</td>
                    <td className="p-3 text-gray-500">{q.description}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEdit(q)} className="text-yellow-600 hover:underline flex items-center gap-1">
                        <Pencil size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:underline flex items-center gap-1">
                        <Trash2 size={16} /> Delete
                      </button>
                      {/* 👇 This button opens the internal Question Modal */}
                      <button onClick={() => setSelectedQuizForQuestions(q)} className="text-blue-600 hover:underline flex items-center gap-1 ml-2">
                        <FileText size={16} /> Questions
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-6 italic">No quizzes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Quiz Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <ListChecks className="text-blue-600" />
              {form.id ? "Edit Quiz" : "Create New Quiz"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach to Lesson</label>
                <select className="w-full border p-2 rounded" value={form.lesson_id} onChange={e => setForm({...form, lesson_id: e.target.value})} required>
                  <option value="">Select a Lesson...</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>[Grade {l.grade_level_id}] {l.title} ({l.difficulty})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input type="text" className="w-full border p-2 rounded" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border p-2 rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">{loading ? "Saving..." : "Save Quiz"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🆕 QUESTION MANAGER MODAL (Rendered here directly) */}
      {selectedQuizForQuestions && (
        <QuestionModal
          quiz={selectedQuizForQuestions}
          onClose={() => setSelectedQuizForQuestions(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// 🧩 INTERNAL COMPONENT: QuestionModal
// ============================================================
function QuestionModal({ quiz, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    id: null,
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });

  // ✅ FIXED: Wrapped in useCallback to satisfy the linter
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const res = await getJSON("api/get_quiz_questions_admin.php", { quiz_id: quiz.id });
    if (res.success) setQuestions(res.questions);
    setLoading(false);
  }, [quiz.id]);

  // ✅ FIXED: Added dependency
  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question || !form.option_a || !form.option_b) {
      alert("Question and at least Options A & B are required.");
      return;
    }
    const res = await postJSON("api/save_question.php", { ...form, quiz_id: quiz.id });
    if (res.success) { resetForm(); loadQuestions(); } else { alert(res.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;
    const res = await postJSON("api/delete_question.php", { id });
    if (res.success) loadQuestions();
  };

  const handleEdit = (q) => { setForm(q); setEditingId(q.id); };

  const resetForm = () => {
    setForm({ id: null, question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A" });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manage Questions</h2>
            <p className="text-sm text-gray-600">Quiz: {quiz.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600"><X size={24} /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: List */}
          <div className="w-1/2 p-6 overflow-y-auto border-r bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">Questions ({questions.length})</h3>
              <button onClick={resetForm} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ New</button>
            </div>
            
            {/* ✅ FIXED: Loading State Display */}
            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading questions...</p>
            ) : (
              <div className="space-y-3">
                {questions.length === 0 && <p className="text-gray-400 text-sm italic">No questions yet.</p>}
                {questions.map((q) => (
                  <div key={q.id} className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition ${editingId === q.id ? 'border-blue-500 bg-white shadow-md' : 'bg-white'}`} onClick={() => handleEdit(q)}>
                    <p className="font-medium text-gray-800 mb-2 text-sm">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span className={q.correct_option === 'A' ? 'text-green-600 font-bold' : ''}>A: {q.option_a}</span>
                      <span className={q.correct_option === 'B' ? 'text-green-600 font-bold' : ''}>B: {q.option_b}</span>
                      <span className={q.correct_option === 'C' ? 'text-green-600 font-bold' : ''}>C: {q.option_c}</span>
                      <span className={q.correct_option === 'D' ? 'text-green-600 font-bold' : ''}>D: {q.option_d}</span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">{form.id ? "Edit Question" : "Add New Question"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
                <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" rows="3" value={form.question} onChange={e => setForm({...form, question: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Option A</label><input type="text" className="w-full border p-2 rounded" value={form.option_a} onChange={e => setForm({...form, option_a: e.target.value})} required /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Option B</label><input type="text" className="w-full border p-2 rounded" value={form.option_b} onChange={e => setForm({...form, option_b: e.target.value})} required /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Option C</label><input type="text" className="w-full border p-2 rounded" value={form.option_c} onChange={e => setForm({...form, option_c: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Option D</label><input type="text" className="w-full border p-2 rounded" value={form.option_d} onChange={e => setForm({...form, option_d: e.target.value})} /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Correct Answer</label>
                <select className="w-full border p-2 rounded bg-green-50 border-green-300 text-green-800 font-bold" value={form.correct_option} onChange={e => setForm({...form, correct_option: e.target.value})}>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Reset</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Save Question</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}