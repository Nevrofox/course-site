import dynamic from 'next/dynamic';
import Head from 'next/head';

const CompanyWizard = dynamic(() => import('@/components/courses/CompanyWizard'), {
  ssr: false,
});

export default function WizardPage() {
  return (
    <>
      <Head>
        <title>Oppstart – AI-kurs</title>
      </Head>
      <CompanyWizard />
    </>
  );
}
