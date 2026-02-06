'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { createCourse, WizardAnswers } from '@/lib/course';

const questions = [
  {
    key: 'role',
    question: 'Hva er din rolle i selskapet?',
    type: 'input',
  },
  {
    key: 'primaryTasks',
    question: 'Hva jobber du mest med i hverdagen?',
    type: 'multi',
    options: [
      'Vaktlister',
      'Bestillinger',
      'Personaloppfølging',
      'Rapportering',
      'Kundeservice',
      'Dokumentasjon',
    ],
  },
  {
    key: 'ai_experience',
    question: 'Hvor mye erfaring har du med AI fra før?',
    type: 'options',
    options: ['ingen', 'litt', 'en del', 'mye'],
  },
  {
    key: 'tech_comfort',
    question: 'Hvor komfortabel er du med teknologi generelt?',
    type: 'options',
    options: ['lav', 'middels', 'høy'],
  },
  {
    key: 'personalGoal',
    question: 'Hva ønsker du å oppnå med AI?',
    type: 'input',
  },
  {
    key: 'learningPreference',
    question: 'Hvordan lærer du best?',
    type: 'options',
    options: ['praktiske eksempler', 'video', 'lesing', 'oppgaver'],
  },
  {
    key: 'biggestTimeWasters',
    question: 'Hva stjeler mest tid i hverdagen din?',
    type: 'multi',
    options: [
      'E-post',
      'Møter',
      'Manuell registrering',
      'Let etter informasjon',
    ],
  },
  {
    key: 'biggestFrustrations',
    question: 'Hva er mest frustrerende på jobb i dag?',
    type: 'multi',
    options: [
      'For mye administrasjon',
      'For lite tid',
      'Dårlige systemer',
      'Uklare prosesser',
    ],
  },
];

export default function CompanyWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { slug } = router.query;

  const userId = typeof slug === 'string' ? slug : null;

  const handleNext = (value: any) => {
    const key = questions[step].key;
    setAnswers((prev: any) => ({ ...prev, [key]: value }));
    setStep(step + 1);
  };

  const handleGenerate = async () => {
    if (!userId) {
      setError('Fant ikke bruker/team-ID i URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: WizardAnswers = {
        role: answers.role,
        primaryTasks: answers.primaryTasks || [],
        ai_experience: answers.ai_experience,
        tech_comfort: answers.tech_comfort,
        personalGoal: answers.personalGoal,
        learningPreference: answers.learningPreference,
        biggestTimeWasters: answers.biggestTimeWasters || [],
        biggestFrustrations: answers.biggestFrustrations || [],
      };

      const result = await createCourse(userId, payload);

      // 🔥 HER ER FIXEN:
      // Send med courseId til neste side
      router.push(
        `/teams/${userId}/courses?courseId=${result.courseId}&generating=1`
      );
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message ?? 'Noe gikk galt ved opprettelse av kurs');
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
            className="w-full border rounded px-4 py-2"
            placeholder="Skriv inn..."
            onBlur={(e) => handleNext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNext((e.target as HTMLInputElement).value);
              }
            }}
          />
        )}

        {current.type === 'multi' && (
          <MultiSelect options={current.options} onSubmit={handleNext} />
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Klar til å lage kurs!</h2>

      <p>
        Vi lager nå et personlig AI-kurs basert på dine svar.
      </p>

      <button
        onClick={handleGenerate}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Genererer kurs…' : 'Start generering'}
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {step < questions.length && renderStep()}
      {step === questions.length && renderSummary()}
    </div>
  );
}

function MultiSelect({
  options,
  onSubmit,
}: {
  options: string[];
  onSubmit: (vals: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (val: string) => {
    setSelected((prev) =>
      prev.includes(val)
        ? prev.filter((v) => v !== val)
        : [...prev, val]
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
                : 'bg-white'
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
