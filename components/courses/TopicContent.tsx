// components/courses/TopicContent.tsx
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type MainContentBlock = {
  heading?: string;
  content?: string;
  example?: string;
};

type PracticalExercise = {
  title?: string;
  description?: string;
  steps?: string[];
  expectedOutcome?: string;
};

type TopicContentData = {
  nummer?: number;
  track?: string;
  title?: string;
  introduction?: string;
  mainContent?: MainContentBlock[];
  keyTakeaways?: string[];
  practicalExercise?: PracticalExercise;
  reflectionQuestions?: string[];
};

interface Props {
  topic: TopicContentData;
  onBack: () => void;
}

export default function TopicContent({ topic, onBack }: Props) {
  return (
    <div className="space-y-6">
      {/* ⬅️ Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til moduloversikt
      </button>

      {/* HEADER */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900">
          {topic.title}
        </h3>

        {topic.track && (
          <p className="mt-1 text-sm text-indigo-600">
            {topic.track}
          </p>
        )}
      </div>

      {/* INTRO */}
      {topic.introduction && (
        <p className="text-gray-700">
          {topic.introduction}
        </p>
      )}

      {/* MAIN CONTENT */}
      {Array.isArray(topic.mainContent) && topic.mainContent.length > 0 && (
        <div className="space-y-5">
          {topic.mainContent.map((block, idx) => (
            <div key={idx} className="space-y-2">
              {block.heading && (
                <h4 className="text-lg font-semibold text-gray-900">
                  {block.heading}
                </h4>
              )}

              {block.content && (
                <p className="text-gray-700">
                  {block.content}
                </p>
              )}

              {block.example && (
                <div className="rounded-md border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900">
                  <span className="font-semibold">Eksempel:</span>{" "}
                  {block.example}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* KEY TAKEAWAYS */}
      {Array.isArray(topic.keyTakeaways) && topic.keyTakeaways.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            Viktige poenger
          </h4>
          <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
            {topic.keyTakeaways.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {/* PRACTICAL EXERCISE */}
      {topic.practicalExercise && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
          <h4 className="text-lg font-semibold text-emerald-900">
            🧩 {topic.practicalExercise.title}
          </h4>

          {topic.practicalExercise.description && (
            <p className="text-emerald-900">
              {topic.practicalExercise.description}
            </p>
          )}

          {Array.isArray(topic.practicalExercise.steps) && (
            <ol className="list-decimal pl-5 text-emerald-900 space-y-1">
              {topic.practicalExercise.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}

          {topic.practicalExercise.expectedOutcome && (
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">Resultat:</span>{" "}
              {topic.practicalExercise.expectedOutcome}
            </p>
          )}
        </div>
      )}

      {/* REFLECTION */}
      {Array.isArray(topic.reflectionQuestions) &&
        topic.reflectionQuestions.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Refleksjon
            </h4>
            <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
              {topic.reflectionQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
