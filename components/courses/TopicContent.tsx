import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

interface Props {
  topic: any;
  onBack: () => void;

  hasNext?: boolean;
  onNext?: () => void;

  hasPrev?: boolean;
  onPrev?: () => void;
}

export default function TopicContent({
  topic,
  onBack,
  hasNext = false,
  onNext,
  hasPrev = false,
  onPrev,
}: Props) {
  if (!topic) return null;

  return (
    <div className="space-y-6">
      {/* BACK TO OVERVIEW */}
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
      </div>

      {/* BODY – NÅ MED MARKDOWN */}
      {topic.bodyText && (
        <div className="prose max-w-none text-gray-700">
          <ReactMarkdown>
            {topic.bodyText}
          </ReactMarkdown>
        </div>
      )}

      {/* KEY TAKEAWAYS */}
      {Array.isArray(topic.keyTakeaways) &&
        topic.keyTakeaways.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-2">
              Viktige poenger
            </h4>

            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {topic.keyTakeaways.map((k: string, i: number) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>
        )}

      {/* BRIDGE */}
      {topic.nextBridge && (
        <div className="border-l-4 border-indigo-200 pl-3 italic text-gray-600">
          {topic.nextBridge}
        </div>
      )}

      {/* NAVIGASJON NEDERST */}
      <div className="flex justify-between pt-4">
        {/* FORRIGE */}
        {hasPrev ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Forrige
          </button>
        ) : (
          <div />
        )}

        {/* NESTE / FERDIG */}
        {hasNext ? (
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
          >
            Neste
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition"
          >
            Ferdig – tilbake til oversikt
          </button>
        )}
      </div>
    </div>
  );
}
