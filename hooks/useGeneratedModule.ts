import { useEffect, useState } from "react";
import { getModule } from "@/lib/course";

export function useGeneratedModule(
  courseId: string,
  moduleNumber: number,
  userId: string
) {
  const [module, setModule] = useState<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function poll() {
      try {
        const data = await getModule(userId, courseId, moduleNumber);
        setModule(data);
      } catch (e) {
        console.error("Failed to poll module:", e);
      }
    }

    poll();
    timer = setInterval(poll, 3000);

    return () => clearInterval(timer);
  }, [courseId, moduleNumber, userId]);

  return module;
}
