// components/courses/CourseLayout.tsx
import { useEffect, useMemo, useState } from "react";
import ModuleSidebar from "./ModuleSidebar";
import TopicList from "./TopicList";
import TopicContent from "./TopicContent";
import { useModuleStatus } from "../../hooks/useModuleStatus";
import { useGeneratedModule } from "../../hooks/useGeneratedModule";

export default function CourseLayout({ course }: any) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTopicNumber, setActiveTopicNumber] = useState<number | null>(null);

  const modules = useMemo(() => {
    if (Array.isArray(course.modules)) return course.modules;

    if (typeof course.modules === "string") {
      let raw = course.modules.trim();
      if (raw.startsWith("=")) raw = raw.slice(1);
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [course.modules]);

  useEffect(() => {
    if (modules.length > 0 && activeIndex === null) {
      setActiveIndex(0);
    }
  }, [modules, activeIndex]);

  useEffect(() => {
    setActiveTopicNumber(null);
  }, [activeIndex]);

  const activeModule = activeIndex !== null ? modules[activeIndex] : null;
  const activeModuleNumber = activeModule?.moduleNumber ?? null;

  const moduleStatus = useModuleStatus(
    course.companyId ?? "",
    course.id ?? "",
    activeModuleNumber
  );

  const generatedModule = useGeneratedModule(
    course.companyId ?? "",
    course.id ?? "",
    activeModuleNumber
  );

  const avsnitt = generatedModule?.avsnitt ?? [];

  const activeGeneratedTopic =
    activeTopicNumber !== null
      ? avsnitt.find(
          (a: any) => Number(a?.nummer) === Number(activeTopicNumber)
        ) ?? null
      : null;

  const moduleStatuses: Record<number, "loading" | "generated"> = {};
  if (activeModuleNumber) {
    moduleStatuses[activeModuleNumber] = moduleStatus;
  }

  return (
    <div className="flex rounded-lg border border-gray-200 bg-white">
      <ModuleSidebar
        modules={modules}
        activeIndex={activeIndex}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(v => !v)}
        onSelect={setActiveIndex}
        moduleStatuses={moduleStatuses}
      />

      <div className="flex-1 p-6">
        {activeModule && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeModule.moduleTitle}
            </h2>

            {activeGeneratedTopic ? (
              <TopicContent
                topic={activeGeneratedTopic}
                onBack={() => setActiveTopicNumber(null)}
              />
            ) : (
              <TopicList
                topics={activeModule.topics ?? []}
                disabled={moduleStatus !== "generated"}
                onSelectTopic={(topic) =>
                  setActiveTopicNumber(topic.topicNumber ?? null)
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
