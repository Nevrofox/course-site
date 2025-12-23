// lib/course.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * ⚠️ MIDLERIDIG TEST-IMPLEMENTASJON
 * Hardkodede verdier som matcher det n8n-flowen forventer
 */
export async function startCourseGeneration(companyId: string) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }

  const payload = {
    company: {
      companyId,
      name: 'Nordic Freight AS',
      industry: 'Logistics',
      size: '120 ansatte',
      location: 'Trondheim',
    },
    ai_maturity: 'low',
    business_goals: [
      'Automatisere manuelt arbeid',
      'Redusere tid brukt på dokumenthåndtering',
      'Oppnå grunnleggende AI-kompetanse',
    ],
    systems_used: ['SharePoint', 'Excel', 'Visma', 'Teams'],
    course_preferences: {
      type: 'mixed',
      level: 'beginner',
      duration_per_week: '1-2 hours',
    },
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

