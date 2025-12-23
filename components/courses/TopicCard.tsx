// components/courses/TopicCard.tsx

type Topic = {
  topicNumber?: number;
  track?: string;
  title?: string;
  description?: string;
  relevance?: string;
  suggestedFormat?: string;
};

function formatBadge(format?: string) {
  const f = (format ?? "").toLowerCase();

  if (f.includes("video")) return { label: "Video", icon: "🎥" };
  if (f.includes("e-læring") || f.includes("elearning") || f.includes("e-learning"))
    return { label: "E-læring", icon: "🧠" };
  if (f.includes("workshop")) return { label: "Workshop", icon: "🧩" };
  if (f.includes("oppgave")) return { label: "Oppgave", icon: "✅" };
  if (f.includes("dokument") || f.includes("les"))
    return { label: "Lesing", icon: "📄" };

  // default
  return { label: format || "Innhold", icon: "📌" };
}

interface Props {
  topic: Topic;
  index: number;

  // ✅ NYTT: gjør kortet klikkbart
  onClick?: () => void;

  // ✅ NYTT: hvis du vil disable mens modulen ikke er generert
  disabled?: boolean;
}

export default function TopicCard({ topic, index, onClick, disabled }: Props) {
  const badge = formatBadge(topic.suggestedFormat);
  const num = topic.topicNumber ?? index + 1;

  const isClickable = !!onClick && !disabled;

  return (
    <button
      type="button"
      onClick={() => {
        console.log("🟢 TOPIC CLICKED", topic, index);
        onClick?.();
        }}
      disabled={disabled}
      className={[
        "w-full text-left rounded-lg border border-gray-200 bg-white p-4 transition",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-indigo-300 hover:shadow-sm",
        isClickable ? "cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          Topic {num}
        </span>

        {topic.track && (
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
            {topic.track}
          </span>
        )}

        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
          {badge.icon} {badge.label}
        </span>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-gray-900">
        {topic.title ?? "Uten tittel"}
      </h4>

      {topic.description && (
        <p className="mt-1 text-sm text-gray-700">{topic.description}</p>
      )}

      {topic.relevance && (
        <p className="mt-3 text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Hvorfor:</span>{" "}
          {topic.relevance}
        </p>
      )}
    </button>
  );
}
