// components/courses/CourseEmptyState.tsx

import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface Props {
  isGenerating: boolean;
}

const loadingMessages = [
  "Analyserer svarene dine...",
  "Bygger kursstruktur...",
  "Tilpasser innhold til din rolle...",
  "Setter sammen moduler...",
  "Snart klart..."
];

const CourseEmptyState = ({ isGenerating }: Props) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      
      <div className="mb-4 rounded-full bg-indigo-50 p-3 animate-pulse">
        <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        {isGenerating
          ? 'Genererer ditt personlige kurs…'
          : 'Ingen kurs tilgjengelig'}
      </h2>

      {isGenerating && (
        <>
          <p className="mt-2 max-w-md text-sm text-gray-600 transition-all duration-300">
            {loadingMessages[messageIndex]}
          </p>

          {/* Spinner */}
          <div className="mt-6 flex items-center gap-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-indigo-600 delay-0"></div>
            <div className="h-3 w-3 animate-bounce rounded-full bg-indigo-500 delay-150"></div>
            <div className="h-3 w-3 animate-bounce rounded-full bg-indigo-400 delay-300"></div>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Dette tar vanligvis 10–30 sekunder
          </p>
        </>
      )}
    </div>
  );
};

export default CourseEmptyState;
