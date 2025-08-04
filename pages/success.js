// pages/success.js

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Success() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleDownload = () => {
    // 1) Leggi da localStorage
    const answers = localStorage.getItem('identikit_answers');
    if (answers) {
      // 2) Scrivi il cookie con validità 10 minuti
      document.cookie = `identikit_answers=${encodeURIComponent(
        answers
      )}; max-age=${10 * 60}; path=/`;
      // 3) Vai a /download
      router.push('/download');
    } else {
      // In teoria non dovrebbe succedere
      alert(t('noAnswers'));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('thankYou')}</h1>
      <p className="mb-6">{t('generatingPDF')}</p>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {t('downloadButton')}
      </button>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
