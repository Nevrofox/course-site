import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useModuleStatus(
  companyId: string,
  courseId: string,
  moduleNumber: number | null
) {
  const [status, setStatus] = useState<'loading' | 'generated'>('loading');

  useEffect(() => {
    if (!companyId || !courseId || !moduleNumber) return;

    let timer: NodeJS.Timeout;

    const check = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/course/master/${companyId}/${courseId}/module/${moduleNumber}`
        );
        const json = await res.json();

        if (json?.source === 'generated') {
          setStatus('generated');
          clearInterval(timer);
        }
      } catch {
        // ignorer – prøv igjen
      }
    };

    check();
    timer = setInterval(check, 4000);

    return () => clearInterval(timer);
  }, [companyId, courseId, moduleNumber]);

  return status;
}
