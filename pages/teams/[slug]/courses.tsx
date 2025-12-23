// pages/teams/[slug]/courses.tsx

import { useRouter } from 'next/router';
import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';

import CourseEmptyState from 'components/courses/CourseEmptyState';
import CourseLayout from 'components/courses/CourseLayout';
import { useCoursePolling } from '../../../hooks/useCoursePolling';

const Courses: NextPageWithLayout = () => {
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [courses, setCourses] = useState<any[] | null>(null);

  if (!router.isReady) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Laster kurs…
      </div>
    );
  }

  const companyId = router.query.slug as string;

  useCoursePolling({
    companyId,
    enabled: isGenerating,
    onFound: (foundCourses) => {
      setCourses(foundCourses);
      setIsGenerating(false);
    },
  });

  const course = courses?.[0]; // midlertidig: viser første kurs

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">
        Nevrofox AI-kurs
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        Her genererer og følger du skreddersydde AI-kurs for ditt selskap.
      </p>

      <div className="mt-6">
        {!course && (
          <CourseEmptyState
            companyId={companyId}
            isGenerating={isGenerating}
            onStarted={() => setIsGenerating(true)}
          />
        )}

        {course && (
          <CourseLayout
            course={{
              title: course.title,
              description: course.description,
              modules: course.modules,

              // 🔥 KRITISK – må med for module polling
              companyId: course.companyId,
              id: course.id,
            }}
          />
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Courses;
