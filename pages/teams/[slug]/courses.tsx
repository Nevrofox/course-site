import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CourseEmptyState from "@/components/courses/CourseEmptyState";
import CourseLayout from "@/components/courses/CourseLayout";
import { useCoursePolling } from "../../../hooks/useCoursePolling";

export default function CoursesPage() {
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  // 👉 Hent userId fra URL (slug), IKKE hardkodet
  const userId =
    typeof router.query.slug === "string"
      ? router.query.slug
      : null;

  // Vent til router er klar før vi leser query
  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.generating === "1") {
      setGenerating(true);
    }
  }, [router.isReady, router.query.generating]);

  // Hent courseId direkte fra URL
  const courseIdFromUrl = (router.query.courseId as string) || null;

  useCoursePolling({
    courseId: courseIdFromUrl,
    userId: userId || "",
    enabled: generating && !!userId,
    onReady: (c) => {
      console.log("Course ready from polling:", c);
      setCourse(c);
      setGenerating(false);
    },
  });

  useEffect(() => {
    console.log("Polling status:", {
      userId,
      generating,
      courseIdFromUrl,
    });
  }, [userId, generating, courseIdFromUrl]);

  if (!course) {
    return <CourseEmptyState isGenerating={generating} />;
  }

  return <CourseLayout course={course} userId={userId!} />;
}
