// lib/course.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface WizardAnswers {
  role: string;
  primaryTasks: string[];
  ai_experience: string;
  tech_comfort: string;
  personalGoal: string;
  learningPreference: string;
  biggestTimeWasters: string[];
  biggestFrustrations: string[];
}

export async function startCourseGeneration(
  userId: string,
  wizardAnswers: any
) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }

  const res = await fetch(
    `${API_BASE_URL}/api/course/courses`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        userId,
        wizardAnswers,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create course: ${text}`);
  }

  return res.json();
}


export async function createCourse(
  userId: string,
  input: WizardAnswers
) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const payload = {
    userId,
    ...input,
  };

  const res = await fetch(
    `${API_BASE_URL}/api/course/courses`,   // 👈 RIKTIG ENDPOINT
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create course: ${text}`);
  }

  return res.json() as Promise<{
    courseId: string;
  }>;
}




export async function getCourse(userId: string, courseId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/course/courses/${courseId}`,
    {
      headers: {
        "x-user-id": userId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch course");
  }

  return res.json();
}



export async function getModule(
  userId: string,
  courseId: string,
  moduleNumber: number
) {
  const res = await fetch(
    `${API_BASE_URL}/api/course/courses/${courseId}/modules/${moduleNumber}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch module");
  }

  return res.json();
}
