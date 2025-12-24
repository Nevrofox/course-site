import { useState } from 'react';
import { useRouter } from 'next/router';
import { startCourseGeneration, CourseWizardInput } from '@/lib/course';

const questions = [
  {
    key: 'industry',
    question: 'Hva slags virksomhet er dette?',
    type: 'options',
    options: ['Transport', 'Retail', 'IT', 'Annet'],
  },
  {
    key: 'size',
    question: 'Hvor mange ansatte skal bruke kurset?',
    type: 'input',
  },
  {
    key: 'systems_used',
    question: 'Hvilke systemer jobber de i til daglig?',
    type: 'multi',
    options: ['Teams', 'Excel', 'SharePoint', 'ERP', 'Annet'],
  },
  {
    key: 'business_goals',
    question: 'Hva ønsker dere å oppnå med AI?',
    type: 'multi',
    options: ['Effektivitet', 'Kvalitet', 'Mindre manuelt arbeid', 'Innovasjon'],
  },
  {
    key: 'ai_maturity',
    question: 'Hvor komfortable er de ansatte med teknologi i dag?',
    type: 'scale',
    options: ['Nybegynnere', 'Litt øvet', 'Middels', 'Avansert'],
  },
];

export default function CompanyWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const router = useRouter();
  const { slug } = router.query;

  const handleNext = (value: any) => {
    const key = questions[step].key;
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  };

  const handleGenerate = async () => {
    if (!slug || typeof slug !== 'string') {
      setError('Fant ikke team-ID i URL');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: CourseWizardInput = {
      company: {
        name: 'Demo Company',
        location: 'Norge',
        industry: answers.industry,
        size: answers.size,
      },
      systems_used: answers.systems_used,
      business_goals: answers.business_goals,
      ai_maturity: answers.ai_maturity,
      course_preferences: {
        type: 'mixed',
        level: 'beginner',
        duration_per_week: '1-2 hours',
      },
    };

    console.log('Sender til API:', payload);

    try {
      await startCourseGeneration(slug, payload);
      setGenerated(true);
      router.push(`/teams/${slug}/courses`);
    } catch (err: any) {
      console.error('Feil ved generering:', err);
      setError(err.message ?? 'Noe gikk galt');
      setLoading(false);
    }
  };

  const renderStep = () => {
    const current = questions[step];
    if (!current) return null;

    return (
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">{current.question}</h2>

        {current.type === 'options' && (
          <div className="space-y-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleNext(opt)}
                className="w-full bg-white border rounded px-4 py-2 hover:bg-gray-100"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === 'input' && (
          <input
            type="text"
            placeholder="Skriv inn..."
            className="w-full border rounded px-4 py-2"
            onBlur={(e) => handleNext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleNext((e.target as HTMLInputElement).value);
              }
            }}
          />
        )}

        {current.type === 'multi' && (
          <MultiSelect options={current.options} onSubmit={handleNext} />
        )}

        {current.type === 'scale' && (
          <div className="space-y-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleNext(opt.toLowerCase())}
                className="w-full bg-white border rounded px-4 py-2 hover:bg-gray-100"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Oppsummering</h2>
      <p>
        Basert på det du har fortalt meg, lager jeg nå:
        <br />– Et praktisk AI-kurs for {answers.size} ansatte i {answers.industry}
        <br />– Med fokus på: {answers.business_goals?.join(', ')}
        <br />– Tilpasset systemer: {answers.systems_used?.join(', ')}
      </p>

      <button
        onClick={handleGenerate}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Genererer...' : 'Generer kurs'}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {!generated && step < questions.length && renderStep()}
      {!generated && step === questions.length && renderSummary()}
    </div>
  );
}

function MultiSelect({ options, onSubmit }: { options: string[]; onSubmit: (vals: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (val: string) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1 border rounded-full ${
              selected.includes(opt)
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit(selected)}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Neste
      </button>
    </div>
  );
}
