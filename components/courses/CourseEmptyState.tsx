// components/courses/CourseEmptyState.tsx

import { useState } from 'react';
import { AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from 'react-daisyui';

import { startCourseGeneration } from '@/lib/course';

interface Props {
  companyId: string;
  isGenerating: boolean;
  onStarted: () => void;
}

const CourseEmptyState = ({ companyId, isGenerating, onStarted }: Props) => {
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setError(null);

    // 🔑 Viktigste linje: starter polling i parent med en gang
    onStarted();

    try {
      await startCourseGeneration(companyId);
      // API returnerer 202, polling tar over.
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Kunne ikke starte kursgenerering');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="mb-4 rounded-full bg-indigo-50 p-3">
        <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        Ingen kurs generert ennå
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-600">
        Generer et skreddersydd AI-kurs basert på selskapet ditt, systemene dere
        bruker og ønsket kompetansenivå.
      </p>

      <Button
        className="mt-6 flex items-center gap-2"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        <SparklesIcon className="h-5 w-5" />
        {isGenerating ? 'Genererer kurs…' : 'Generer kurs'}
      </Button>

      {isGenerating && (
        <p className="mt-3 text-sm text-gray-500">
          Venter på at kursskjellett skal dukke opp i databasen…
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default CourseEmptyState;
