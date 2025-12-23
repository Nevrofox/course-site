// hooks/useGeneratedModule.ts
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useGeneratedModule(
  companyId: string,
  courseId: string,
  moduleNumber: number | null
) {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!companyId || !courseId || !moduleNumber) return;

    let timer: NodeJS.Timeout;

    const check = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/course/master/${companyId}/${courseId}/module/${moduleNumber}`
        );
        const json = await res.json();

        // ✅ KORREKT SJEKK
        if (json?.source === "generated") {
          setData(json.data); // ← { moduleIntro, avsnitt, ... }
          clearInterval(timer);
        }
      } catch {
        // prøv igjen
      }
    };

    check();
    timer = setInterval(check, 4000);

    return () => clearInterval(timer);
  }, [companyId, courseId, moduleNumber]);

  return data;
}
