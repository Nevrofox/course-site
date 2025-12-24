// lib/course.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CourseWizardInput {
  company: {
    name: string;
    industry: string;
    size: string;
    location: string;
  };
  ai_maturity: string;
  business_goals: string[];
  systems_used: string[];
  course_preferences: {
    type: string;
    level: string;
    duration_per_week: string;
  };
}

export async function startCourseGeneration(
  companyId: string,
  input: CourseWizardInput
) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }

  const payload = {
    company: {
      companyId,
      ...input.company,
    },
    ai_maturity: input.ai_maturity,
    business_goals: input.business_goals,
    systems_used: input.systems_used,
    course_preferences: input.course_preferences,
  };

  const res = await fetch(
    `${API_BASE_URL}/course/generate/${companyId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to start course generation: ${text}`);
  }

  return res.json();
}

export async function getMasterCourses(companyId: string) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }

  const res = await fetch(
    `${API_BASE_URL}/course/master/${companyId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch courses: ${text}`);
  }

  return res.json();
}
