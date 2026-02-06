import { useState, useEffect } from "react";
import ModuleSidebar from "./ModuleSidebar";
import TopicList from "./TopicList";
import TopicContent from "./TopicContent";
import { getModule } from "@/lib/course";

export default function CourseLayout({ course, userId }: any) {
  const [activeModule, setActiveModule] = useState<number>(1);
  const [activeTopic, setActiveTopic] = useState<number | null>(null);

  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const outlines = course.moduleOutlines || [];

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

  // Finn skjelett for aktiv modul
  const skeleton = outlines.find(
    (m: any) => Number(m.moduleNumber) === activeModule
  );

  // 🔥 MERGE skjelett + generert data
  const mergedTopics = (skeleton?.sections || []).map((s: any, index: number) => {
    const generated = moduleData?.sections?.find(
      (gen: any) => gen.sectionNumber === index + 1
    );

    return (
      generated || {
        ...s,
        topicNumber: index + 1,
      }
    );
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
        moduleStatuses={course.moduleStatuses}
        isCollapsed={false}
        onToggle={() => {}}
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

            // 👇 NYTT: støtte for forrige
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
