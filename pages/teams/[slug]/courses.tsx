import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';

import CourseEmptyState from 'components/courses/CourseEmptyState';
import CourseLayout from 'components/courses/CourseLayout';
import { useCoursePolling } from '../../../hooks/useCoursePolling';

const Courses: NextPageWithLayout = () => {
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(
    router.query.generating === '1'
  );
  const [courses, setCourses] = useState<any[] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const companyId = router.query.slug as string;
  const course = courses?.[0]; // midlertidig: viser første kurs

  useCoursePolling({
    companyId,
    enabled: isGenerating,
    onFound: (foundCourses) => {
      setCourses(foundCourses);
      setIsGenerating(false);
      setHasLoaded(true);
    },
  });

  useEffect(() => {
    if (!isGenerating && courses === null) {
      setHasLoaded(true);
    }
  }, [isGenerating, courses]);

  if (!router.isReady || !hasLoaded) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Laster kurs…
      </div>
    );
  }

  return (
    <div className={course ? 'p-0' : 'p-6'}>
      {!course && (
        <CourseEmptyState
          companyId={companyId}
          isGenerating={isGenerating}
          onStarted={() => {
            setIsGenerating(true);
            setHasLoaded(false);
          }}
        />
      )}

      {course && (
        <CourseLayout
          course={{
            title: course.title,
            description: course.description,
            modules: course.modules,
            companyId: course.companyId,
            id: course.id,
          }}
        />
      )}
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
