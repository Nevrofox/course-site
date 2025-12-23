import { useEffect, useRef } from 'react';
import { getMasterCourses } from '@/lib/course';

interface Options {
  companyId: string;
  enabled: boolean;
  intervalMs?: number;
  onFound: (courses: any[]) => void;
  onError?: (err: unknown) => void;
}

export function useCoursePolling({
  companyId,
  enabled,
  intervalMs = 3000,
  onFound,
  onError,
}: Options) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !companyId) return;

    const poll = async () => {
      try {
        const courses = await getMasterCourses(companyId);

        if (Array.isArray(courses) && courses.length > 0) {
          onFound(courses);
          stop();
        }
      } catch (err) {
        console.error('Polling error', err);
        onError?.(err);
      }
    };

    const start = () => {
      poll(); // kjør umiddelbart
      timerRef.current = setInterval(poll, intervalMs);
    };

    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    start();
    return stop;
  }, [companyId, enabled]);
}
