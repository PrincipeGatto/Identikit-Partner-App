// pages/success.js

import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Success() {
  const { t } = useTranslation('common');

  useEffect(() => {
    const answers = localStorage.getItem('identikit_answers');
    if (answers) {
      // Salva in un cookie che dura 10 minuti
      document.cookie = `identikit_answers=${encodeURIComponent(
        answers
      )}; max-age=${10 * 60}; path=/`;
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('thankYou')}</h1>
      <p className="mb-6">{t('generatingPDF')}</p>
      <Link href="/download">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {t('downloadButton')}
        </button>
      </Link>
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
