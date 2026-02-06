import { useEffect } from "react";
import { getCourse } from "@/lib/course";

export function useCoursePolling({
  courseId,
  userId,
  enabled,
  onReady,
}: {
  courseId: string | null;
  userId: string;
  enabled: boolean;
  onReady: (course: any) => void;
}) {
  useEffect(() => {
    if (!enabled || !courseId) return;

    let timer: NodeJS.Timeout;
    let hasTriggered = false;

    const poll = async () => {
      try {
        console.log("Polling course:", courseId);

        const course = await getCourse(userId, courseId);

        const hasOutlines =
          Array.isArray(course.moduleOutlines) &&
          course.moduleOutlines.length > 0;

        // 🔥 DETTE ER DEN VIKTIGE ENDRINGEN:
        // Så fort vi har outlines -> vis kurs
        if (hasOutlines && !hasTriggered) {
          hasTriggered = true;
          onReady(course);
        }

        // Vi fortsetter å polle selv om vi har trigget,
        // fordi mer data kan komme senere (sections osv.)

      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    timer = setInterval(poll, 4000);

    return () => clearInterval(timer);
  }, [courseId, userId, enabled, onReady]);
}
