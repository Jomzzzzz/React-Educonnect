import { useEffect, useState, useCallback } from "react";
import YouTube from "react-youtube";
import { getLessonDetails, markLessonComplete } from "/utils/api";

export default function LessonModal({ lessonId, onClose, onMarkComplete, initialCompleted, isRetake }) { // 👈 Add isRetake
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
 const [completed, setCompleted] = useState(initialCompleted); // CORRECT

  const fetchLesson = useCallback(async () => {
    setLoading(true);
    const res = await getLessonDetails(lessonId);
    if (res.success && res.lesson) {
      setLesson(res.lesson);
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) fetchLesson();
  }, [lessonId, fetchLesson]);

  // ✅ Automatically mark complete when video ends
  const handleVideoEnd = async () => {
    if (completed) return;
    const res = await markLessonComplete(lessonId);
    if (res.success || res.status === "success") {
      setCompleted(true);
      onMarkComplete && onMarkComplete(lessonId);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&#]*)/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : null;
  };

  const isYouTube =
    lesson?.video_url?.includes("youtube.com") || lesson?.video_url?.includes("youtu.be");
  const videoId = isYouTube ? getYouTubeId(lesson?.video_url) : null;

  if (!lessonId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-lg hover:text-red-500 transition"
        >
          ✖
        </button>

        {loading ? (
          <p>Loading lesson...</p>
        ) : lesson ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{lesson.title}</h2>

            {/* ✅ Lesson Content */}
            <div
              className="prose max-w-none text-gray-800 mb-4"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />

            {/* ✅ Study Guide (optional) */}
            {lesson.study_guide && (
              <div
                className="prose max-w-none mt-4 border-t pt-4 text-gray-700"
                dangerouslySetInnerHTML={{ __html: lesson.study_guide }}
              />
            )}

            {/* ✅ Video Section (Auto Mark Complete) */}
            {lesson.video_url && (
              <div className="mt-6">
                {isYouTube ? (
                  <YouTube
                    videoId={videoId}
                    className="w-full rounded-lg overflow-hidden"
                    opts={{
                      width: "100%",
                      height: "400",
                      playerVars: { autoplay: 0, modestbranding: 1 },
                    }}
                    onEnd={handleVideoEnd}
                  />
                ) : (
                  <video
                    className="w-full rounded-lg"
                    src={lesson.video_url}
                    controls
                    onEnded={handleVideoEnd}
                  />
                )}
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ✅ This lesson will automatically mark as complete once you finish watching the video.
                </p>
              </div>
            )}

            {/* ✅ Study File (if available) */}
            {lesson.file && (
              <div className="mt-4">
                <a
                  href={`/uploads/${lesson.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  📘 Download Study File
                </a>
              </div>
            )}

            {/* Baguhin ang logic ng message */}

{completed ? (
    <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center gap-2 mt-4">
        {/* 👇 CUSTOM MESSAGE KAPAG RETAKE 👇 */}
        {isRetake 
            ? "↺ You have re-watched the video. Good luck on the quiz!" 
            : "✅ Lesson completed successfully!"
        }
    </div>
) : (
    // Optional: Pwede ka rin maglagay ng message habang nanonood pa lang
    isRetake && (
        <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm mt-4">
            💡 <strong>Review Mode:</strong> Watch this video again to unlock the quiz.
        </div>
    )
)}
          </>
        ) : (
          <p>Lesson not found.</p>
        )}
      </div>
    </div>
  );
}
