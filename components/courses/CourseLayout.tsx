import { useState, useEffect } from "react";
import ModuleSidebar from "./ModuleSidebar";
import TopicList from "./TopicList";
import TopicContent from "./TopicContent";
import { getModule, getCourse } from "@/lib/course";

export default function CourseLayout({ course: initialCourse, userId }: any) {
  const [course, setCourse] = useState<any>(initialCourse);

  const [activeModule, setActiveModule] = useState<number>(1);
  const [activeTopic, setActiveTopic] = useState<number | null>(null);

  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const outlines = course.moduleOutlines || [];
  // Ny kommentar
  // 🔁 POLL SELVE KURSET – så vi får nye moduleOutlines fortløpende
  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function pollCourse() {
      try {
        const updated = await getCourse(userId, course.courseId);
        setCourse(updated);
      } catch (e) {
        console.error("Error polling course:", e);
      }
    }

    timer = setInterval(pollCourse, 4000);

    return () => clearInterval(timer);
  }, [userId, course.courseId]);

  // Poll innhold for aktiv modul
  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function poll() {
      try {
        const data = await getModule(userId, course.courseId, activeModule);
        setModuleData(data);
        setLoading(false);
      } catch (e) {
        console.error("Error polling module:", e);
      }
    }

    poll();
    timer = setInterval(poll, 3000);

    return () => clearInterval(timer);
  }, [activeModule, userId, course.courseId]);

  const handleBackToOverview = () => {
    setActiveTopic(null);
  };

  const skeleton = outlines.find(
    (m: any) => Number(m.moduleNumber) === activeModule
  );

  const mergedTopics = (skeleton?.sections || []).map(
    (s: any, index: number) => {
      const generated = moduleData?.sections?.find(
        (gen: any) => gen.sectionNumber === index + 1
      );

      return (
        generated || {
          ...s,
          topicNumber: index + 1,
        }
      );
    }
  );

  // 🔥 STATUS-LOGIKK – basert på AKTUELLE outlines fra DB
  const moduleStatuses: Record<number, "locked" | "generating" | "generated"> =
    {};

  outlines.forEach((m: any) => {
    const moduleNumber = Number(m.moduleNumber);

    if (m.sections && m.sections.length > 0) {
      moduleStatuses[moduleNumber] = "generated";
    } else {
      moduleStatuses[moduleNumber] = "generating";
    }
  });

  return (
    <div className="flex">
      <ModuleSidebar
        modules={outlines}
        activeIndex={activeModule - 1}
        onSelect={(i) => {
          setActiveModule(i + 1);
          setActiveTopic(null);
        }}
        isCollapsed={false}
        onToggle={() => {}}
        moduleStatuses={moduleStatuses}
      />

      <div className="p-6 flex-1">
        {loading && <p>Laster modul...</p>}

        {!loading && !activeTopic && (
          <TopicList
            topics={mergedTopics}
            topicStatus={moduleData?.topicStatus || {}}
            onSelectTopic={(t: any) => setActiveTopic(t.topicNumber)}
          />
        )}

        {!loading && activeTopic && moduleData && (
          <TopicContent
            topic={
              moduleData.sections.find(
                (s: any) => s.topicNumber === activeTopic
              )
            }
            onBack={handleBackToOverview}
            hasNext={mergedTopics.some(
              (t: any) => t.topicNumber === (activeTopic || 0) + 1
            )}
            onNext={() => {
              const next = (activeTopic || 0) + 1;

              const exists = mergedTopics.some(
                (t: any) => t.topicNumber === next
              );

              if (exists) {
                setActiveTopic(next);
              } else {
                setActiveTopic(null);
              }
            }}
            hasPrev={(activeTopic || 0) > 1}
            onPrev={() => {
              const prev = (activeTopic || 0) - 1;

              if (prev >= 1) {
                setActiveTopic(prev);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
