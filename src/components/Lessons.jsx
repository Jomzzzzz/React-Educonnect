import { useState, useEffect } from "react";
import { fetchSubjectsByGrade, fetchTopicsBySubject } from "/utils/api"; 
import LessonModal from "./LessonModal";

export default function Lessons({ onTakeQuiz, user }) {
  const [grade, setGrade] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [error, setError] = useState("");

  const [aiPopup, setAiPopup] = useState(null); 

  const STUDENT_ID = user?.id || 1; 

  // 1. Load Subjects
  useEffect(() => {
    const loadSubjects = async (g) => {
      setLoadingSubjects(true);
      setError("");
      setSubjects([]);
      setSelectedSubject(null);
      setTopics([]);

      const res = await fetchSubjectsByGrade(g);
      if (res.success) {
        setSubjects(res.subjects);
      } else {
        setError(res.message || "Failed to load subjects.");
      }
      setLoadingSubjects(false);
    };
    loadSubjects(grade);
  }, [grade]);

  // 2. Load Topics
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedSubject) {
        setTopics([]);
        return;
      }
      setLoadingTopics(true);
      setError(""); 
      
      const res = await fetchTopicsBySubject(selectedSubject, STUDENT_ID, grade);

      if (res.success) {
        setTopics(res.topics);
        checkForAIUpdates(res.topics);
      } else {
        setError(res.message || "Failed to load topics.");
      }
      setLoadingTopics(false);
    };

    loadTopics();
  }, [selectedSubject, STUDENT_ID, grade]);

  // 🛑 FIXED LOGIC: PREVENT INTRO SPAM 🛑
  const checkForAIUpdates = (newTopics) => {
    const sessionIntroKey = `has_seen_LESSON_intro_session`; 

    for (const topic of newTopics) {
        if (!topic.ai_message) continue;

        const isIntro = topic.ai_prestige === 'info';

        if (isIntro && sessionStorage.getItem(sessionIntroKey)) {
            continue; 
        }

        const msgKey = `seen_${topic.id}_${topic.difficulty}_${topic.ai_prestige}`;

        if (!sessionStorage.getItem(msgKey)) {
            
            // 🆕 BRANDING UPDATE: Added "Adapra AI" to titles
            let title = "Adapra AI";
            let type = topic.ai_prestige; 

            if (type === 'success') title = "🌟 Adapra AI says: Great Job!";
            else if (type === 'warning') title = "⚠️ Adapra AI: Needs Focus";
            else if (type === 'info') title = "💡 Adapra AI: Study Tip";
            else title = "👋 Adapra AI";

            setAiPopup({
                title: title,
                message: topic.ai_message,
                type: type 
            });

            sessionStorage.setItem(msgKey, "true");
            if (isIntro) sessionStorage.setItem(sessionIntroKey, "true");
            return; 
        }
    }
  };

  const handleMarkComplete = (lessonId) => {
    setTopics((prevTopics) => 
      prevTopics.map((t) => (t.id === lessonId ? { ...t, completed: true } : t))
    );
  };

  const getPopupStyles = (type) => {
      switch(type) {
          case 'success': return { border: 'border-green-500', text: 'text-green-600', icon: '🎉', btn: 'bg-green-500 hover:bg-green-600' };
          case 'warning': return { border: 'border-yellow-500', text: 'text-yellow-600', icon: '🛡️', btn: 'bg-yellow-500 hover:bg-yellow-600' };
          case 'info': return { border: 'border-blue-500', text: 'text-blue-600', icon: '🤖', btn: 'bg-blue-600 hover:bg-blue-700' };
          default: return { border: 'border-gray-500', text: 'text-gray-600', icon: '👋', btn: 'bg-gray-600 hover:bg-gray-700' };
      }
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Lessons by Grade</h2>
        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Subjects</h3>
        {loadingSubjects ? <p>Loading...</p> : subjects.length === 0 ? <p>No subjects.</p> : (
          <div className="flex flex-wrap gap-3">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded font-medium transition ${
                  selectedSubject === subject.id ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSubject && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Topics</h3>
          {loadingTopics ? <p>Thinking...</p> : topics.length === 0 ? <p>No topics.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-5 border-l-4 rounded-lg shadow-sm bg-white relative overflow-hidden ${
                    topic.ai_prestige === 'success' ? 'border-green-500' :
                    topic.ai_prestige === 'warning' ? 'border-yellow-500' : 
                    topic.ai_prestige === 'info' ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 uppercase">{topic.difficulty}</span>
                    {topic.completed && <span className="text-green-500">✓ Done</span>}
                  </div>
                  <h3 className="font-semibold text-lg mb-4">{topic.title}</h3>
                  
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedLesson(topic.id)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
                      {topic.retake_mode ? "↺ Review" : "▶ Watch"}
                    </button>
                    {topic.completed && (
                      <button onClick={() => onTakeQuiz && onTakeQuiz(topic.id)} className="text-sm bg-amber-500 text-white px-3 py-1 rounded">
                        📝 Quiz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aiPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4">
            {(() => {
                const style = getPopupStyles(aiPopup.type);
                return (
                    <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-8 transform transition-all scale-100 ${style.border}`}>
                        <div className="text-6xl mb-4 animate-bounce">
                            {style.icon}
                        </div>
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
                            Got it!
                        </button>
                    </div>
                );
            })()}
        </div>
      )}

      {selectedLesson && (
        <LessonModal
          lessonId={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onMarkComplete={handleMarkComplete}
          initialCompleted={topics.find(t => t.id === selectedLesson)?.completed || false}
          isRetake={topics.find(t => t.id === selectedLesson)?.retake_mode || false}
        />
      )}
    </div>
  );
}