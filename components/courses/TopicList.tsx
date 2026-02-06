import TopicCard from "./TopicCard";

interface Props {
  topics: any[];
  topicStatus: Record<string, any>;
  onSelectTopic?: (topic: any, index: number) => void;
}

export default function TopicList({
  topics,
  topicStatus,
  onSelectTopic,
}: Props) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
        Ingen topics generert for denne modulen ennå.
      </div>
    );
  }

  const sorted = [...topics].sort((a, b) => {
    const an = a.topicNumber ?? 9999;
    const bn = b.topicNumber ?? 9999;
    return an - bn;
  });

  return (
    <div className="space-y-3">
      {sorted.map((t, idx) => {
        const status = topicStatus[String(t.topicNumber)];

        const isClickable =
          status?.hasContent === true &&
          status?.clickable === true;

        return (
          <TopicCard
            key={idx}
            topic={t}
            index={idx}
            disabled={!isClickable}
            onClick={
              isClickable && onSelectTopic
                ? () => onSelectTopic(t, idx)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
