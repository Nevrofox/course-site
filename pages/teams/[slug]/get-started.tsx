// pages/get-started.tsx

import Head from 'next/head';
import dynamic from 'next/dynamic';

const CompanyWizard = dynamic(() => import('@/components/courses/CompanyWizard'), {
  ssr: false,
});

export default function GetStartedPage() {
  return (
    <>
      <Head>
        <title>AI-opplæring for din bedrift</title>
      </Head>

      <main className="min-h-screen bg-white">
        <section className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            AI-opplæring laget for deres selskap
          </h1>
          <p className="text-lg mb-8 text-gray-700">
            Kurset tilpasses deres mål, ansatte og systemer – helt automatisk.
          </p>

          {/* Demovideo placeholder */}
          <div className="mb-12">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded shadow-md overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Demovideo"
                allowFullScreen
              />
            </div>
          </div>

          <div className="text-left max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">
              For å kunne tilpasse kurset trenger vi litt info om dere:
            </h2>
          </div>
        </section>

        {/* Wizard starter her */}
        <CompanyWizard />
      </main>
    </>
  );
}
