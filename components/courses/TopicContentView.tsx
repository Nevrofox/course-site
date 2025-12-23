type Avsnitt = {
  nummer?: number;
  title?: string;
  introduction?: string;
  mainContent?: {
    heading?: string;
    content?: string;
    example?: string;
  }[];
  keyTakeaways?: string[];
  practicalExercise?: {
    title?: string;
    description?: string;
    steps?: string[];
    expectedOutcome?: string;
  };
  reflectionQuestions?: string[];
};

interface Props {
  avsnitt: Avsnitt;
  onBack: () => void;
}

export default function TopicContentView({ avsnitt, onBack }: Props) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Tilbake til topics
      </button>

      <h3 className="text-xl font-semibold text-gray-900">
        {avsnitt.title}
      </h3>

      {avsnitt.introduction && (
        <p className="text-gray-700">
          {avsnitt.introduction}
        </p>
      )}

      {avsnitt.mainContent?.map((c, i) => (
        <div key={i} className="space-y-2">
          <h4 className="font-semibold text-gray-800">
            {c.heading}
          </h4>
          <p className="text-gray-700">{c.content}</p>

          {c.example && (
            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              <strong>Eksempel:</strong> {c.example}
            </div>
          )}
        </div>
      ))}

      {avsnitt.keyTakeaways && (
        <div>
          <h4 className="font-semibold text-gray-800">Viktig å huske</h4>
          <ul className="list-disc list-inside text-gray-700">
            {avsnitt.keyTakeaways.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {avsnitt.practicalExercise && (
        <div className="rounded-lg border bg-indigo-50 p-4">
          <h4 className="font-semibold">
            📝 {avsnitt.practicalExercise.title}
          </h4>
          <p className="mt-1 text-sm">
            {avsnitt.practicalExercise.description}
          </p>

          <ol className="mt-2 list-decimal list-inside text-sm">
            {avsnitt.practicalExercise.steps?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {avsnitt.reflectionQuestions && (
        <div>
          <h4 className="font-semibold">Refleksjon</h4>
          <ul className="list-disc list-inside text-gray-700">
            {avsnitt.reflectionQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
