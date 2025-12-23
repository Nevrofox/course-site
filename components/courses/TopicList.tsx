// components/courses/TopicList.tsx

import TopicCard from "./TopicCard";

type Topic = {
  topicNumber?: number;
  track?: string;
  title?: string;
  description?: string;
  relevance?: string;
  suggestedFormat?: string;
};

interface Props {
  topics: Topic[];

  // ✅ Callback når bruker klikker på et topic
  onSelectTopic?: (topic: Topic, index: number) => void;

  // ✅ Disable klikk (f.eks. mens modul genereres)
  disabled?: boolean;
}

export default function TopicList({
  topics,
  onSelectTopic,
  disabled = false,
}: Props) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
        Ingen topics generert for denne modulen ennå.
      </div>
    );
  }

  // Sorter topics hvis de har topicNumber
  const sorted = [...topics].sort((a, b) => {
    const an = a.topicNumber ?? 9999;
    const bn = b.topicNumber ?? 9999;
    return an - bn;
  });

  return (
    <div className="space-y-3">
      {sorted.map((t, idx) => (
        <TopicCard
          key={idx}
          topic={t}
          index={idx}
          disabled={disabled}
          onClick={
            !disabled && onSelectTopic
              ? () => onSelectTopic(t, idx)
              : undefined
          }
        />
      ))}
    </div>
  );
}
