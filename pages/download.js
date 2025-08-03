// pages/download.js

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Download() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const answers = JSON.parse(localStorage.getItem('identikit_answers') || '[]');
    if (!answers.length) {
      setError(t('noAnswers'));
      return;
    }

    setLoading(true);
    fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(t('pdfError'));
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'identikit.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Solo adesso cancelliamo le risposte
        localStorage.removeItem('identikit_answers');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [t]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      {loading ? <p>{t('generatingPDF')}</p> : <p>{t('preparingDownload')}</p>}
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
