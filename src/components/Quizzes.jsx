import { useEffect, useState } from "react";
import { getJSON, fetchSubjectsByGrade, fetchTopicsBySubject } from "/utils/api";
import QuizModal from "./QuizModal";
import QuizReviewModal from "./QuizReviewModal";

export default function Quizzes({ initialLessonId, user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(1);
  
  // 🤖 AI State
  const [allowedLessonIds, setAllowedLessonIds] = useState([]); 
  const [aiDataMap, setAiDataMap] = useState({}); 
  const [loadingAI, setLoadingAI] = useState(false);
  
  // 🆕 POPUP STATE
  const [aiPopup, setAiPopup] = useState(null);

  const [error, setError] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [reviewQuiz, setReviewQuiz] = useState(null);

  // 1️⃣ Load All Quizzes
  useEffect(() => {
    loadQuizzes();
  }, []);

  // 2️⃣ Load Subjects when Grade Changes
  useEffect(() => {
    const loadSubjects = async () => {
      setSubjects([]);
      setSelectedSubject(null);
      const res = await fetchSubjectsByGrade(selectedGrade);
      if (res.success) {
        setSubjects(res.subjects);
      }
    };
    loadSubjects();
  }, [selectedGrade]);

  // 3️⃣ 🧠 AI SYNC: Fetch "Active Lessons" & Messages
  useEffect(() => {
    const syncWithAI = async () => {
      if (!selectedSubject || !user?.id) return;
      
      setLoadingAI(true);
      
      // 🆕 Pass 'quiz' context so messages are relevant to quizzes
      const res = await fetchTopicsBySubject(selectedSubject, user.id, selectedGrade, 'quiz');
      
      if (res.success) {
        const ids = res.topics.map(t => t.id);
        setAllowedLessonIds(ids);

        const map = {};
        res.topics.forEach(t => {
            map[t.id] = t; 
        });
        setAiDataMap(map);

        checkForAIUpdates(res.topics);
        
      } else {
        console.warn("AI Sync Failed:", res.message);
      }
      setLoadingAI(false);
    };

    syncWithAI();
  }, [selectedSubject, selectedGrade, user]);

 // 🛑 ANTI-SPAM POPUP LOGIC (QUIZ VERSION) 🛑
  const checkForAIUpdates = (newTopics) => {
    const sessionIntroKey = `has_seen_QUIZ_intro_session`; 

    for (const topic of newTopics) {
        if (!topic.ai_message) continue;

        const isIntro = topic.ai_prestige === 'info';

        if (isIntro && sessionStorage.getItem(sessionIntroKey)) {
            continue; 
        }

        const msgKey = `seen_quiz_${topic.id}_${topic.difficulty}_${topic.ai_prestige}`;

        if (!sessionStorage.getItem(msgKey)) {
            // 🆕 BRANDING UPDATE
            let title = "Adapra AI";
            let type = topic.ai_prestige; 

            if (type === 'success') title = "🌟 Adapra AI: You did it!";
            else if (type === 'warning') title = "⚠️ Adapra AI: Careful!";
            else if (type === 'info') title = "💡 Adapra AI: Quiz Tip";
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

  // 4️⃣ Handle Redirection
  useEffect(() => {
    if (initialLessonId && quizzes.length > 0) {
      const related = quizzes.find((q) => q.lesson_id === initialLessonId);
      if (related && allowedLessonIds.includes(related.lesson_id)) {
        setSelectedQuiz(related);
      }
    }
  }, [initialLessonId, quizzes, allowedLessonIds]);

  const loadQuizzes = async () => {
    setError("");
    const res = await getJSON("api/get_quizzes.php");
    if (res.success) {
      setQuizzes(res.quizzes);
      
      const resultsMap = {};
      if (res.student_quiz_results) {
        res.student_quiz_results.forEach((r) => {
            const currentBest = resultsMap[r.quiz_id];
            if (currentBest === undefined || r.score > currentBest) {
                resultsMap[r.quiz_id] = r.score;
            }
        });
      }
      setQuizResults(resultsMap);
    } else {
      setError(res.message || "Failed to load quizzes.");
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) => 
      q.grade_level_id === Number(selectedGrade) && 
      q.subject_id === selectedSubject
  );

  // Helper for Popup Styles
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">🧠 Quizzes</h2>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(Number(e.target.value))}
          className="border p-2 rounded text-sm font-medium bg-white shadow-sm"
        >
          {[1, 2, 3, 4, 5, 6].map((grade) => (
            <option key={grade} value={grade}>Grade {grade}</option>
          ))}
        </select>
      </div>

      {/* Subject Buttons */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Select Subject</h3>
        {subjects.length === 0 ? (
           <p className="text-gray-400 text-sm italic">No subjects found.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-5 py-2.5 rounded-lg font-medium transition shadow-sm ${
                  selectedSubject === subject.id
                    ? "bg-blue-600 text-white ring-2 ring-blue-300"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
        </div>
      )}

      {/* Grid */}
      {loadingAI ? (
         <p className="text-center py-12 text-gray-500 animate-pulse">🤖 Synchronizing with AI...</p>
      ) : !selectedSubject ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">👈 Please select a subject above.</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No quizzes available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredQuizzes.map((q) => {
  const score = quizResults[q.quiz_id];
  const hasTaken = score !== undefined;
  const isPassed = hasTaken && score >= 70;

  // 1️⃣ GET AI DETAILS (Define ONCE here)
  const aiInfo = aiDataMap[q.lesson_id]; 
  const aiPrestige = aiInfo ? aiInfo.ai_prestige : 'default'; 

  // 2️⃣ SMART LOCK LOGIC
  // If AI says "not completed" (demoted), force lock. Otherwise trust DB.
  const isVideoFinished = aiInfo ? aiInfo.completed : !q.locked;
  
  const isRecommended = allowedLessonIds.includes(q.lesson_id);
  const shouldBeOpen = (isRecommended || isPassed) && isVideoFinished && !loadingAI;
  const isLocked = !shouldBeOpen;

  // 3️⃣ CARD STYLING (Use the variables defined above)
  let cardBorder = "border-blue-200";
  if(aiPrestige === 'success') cardBorder = "border-green-400 border-l-8";
  else if(aiPrestige === 'warning') cardBorder = "border-yellow-400 border-l-8";
  else if(aiPrestige === 'info') cardBorder = "border-blue-400 border-l-8";

  return (
    <div
      key={q.quiz_id}
      className={`p-5 border rounded-xl bg-white transition shadow-sm flex flex-col justify-between ${
        isLocked ? "opacity-60 bg-gray-50 border-gray-200" : `hover:shadow-md ${cardBorder}`
      }`}
    >
      {/* ... Rest of your JSX (Title, buttons, etc.) ... */}
      
      {/* (Copy the rest of the card HTML from your existing code here) */}
      
      <div>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
               isLocked ? "bg-gray-200 text-gray-500" : "bg-green-100 text-green-700"
            }`}>
              {isLocked ? "Locked" : "Open"}
            </span>
            {isPassed && <span className="text-green-500 text-lg">✓</span>}
          </div>
          
          <h3 className="font-bold text-lg text-gray-800 mb-1">{q.quiz_title}</h3>
          <p className="text-sm text-gray-500 mb-2">Lesson: {q.lesson_title}</p>
      </div>

      <div>
          {isLocked ? (
            <button disabled className="w-full bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2">
              {!isRecommended ? "🔒 Locked" : "🔒 Watch Video First"}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
                {hasTaken && (
                    <div className={`px-3 py-1.5 rounded text-xs font-bold text-center border ${
                        isPassed ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                        Last Score: {score}%
                    </div>
                )}
                
                <div className="flex gap-2">
                    {hasTaken && (
                        <button onClick={() => setReviewQuiz(q)} className="flex-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition">
                            Review
                        </button>
                    )}
                    <button onClick={() => setSelectedQuiz(q)} className={`flex-1 text-white px-3 py-2 rounded-lg text-sm font-bold transition shadow-sm ${hasTaken ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}>
                        {hasTaken ? "Retake" : "Start Quiz"}
                    </button>
                </div>
            </div>
          )}
      </div>
    </div>
  );
})}
        </div>
      )}

      {/* 🆕 UNIVERSAL AI POPUP */}
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

      {selectedQuiz && (
        <QuizModal
          lessonId={selectedQuiz.lesson_id}
          quizId={selectedQuiz.quiz_id}
          title={selectedQuiz.quiz_title}
          onClose={() => setSelectedQuiz(null)}
          onSubmit={() => {
             loadQuizzes();
             fetchTopicsBySubject(selectedSubject, user.id, selectedGrade).then(res => {
                if(res.success) {
                    setAllowedLessonIds(res.topics.map(t => t.id));
                    // Force check updates immediately after quiz submission
                    // Note: We clear the specific key here if needed, but standard flow usually handles it
                    checkForAIUpdates(res.topics);
                }
             });
          }} 
        />
      )}

      {reviewQuiz && (
        <QuizReviewModal
          quizId={reviewQuiz.quiz_id}
          studentId={user?.id}
          title={reviewQuiz.quiz_title}
          onClose={() => setReviewQuiz(null)}
        />
      )}
    </div>
  );
}