// pages/download.js

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Helper per leggere un cookie
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v.pop()) : '';
}

export default function Download() {
  const router = useRouter();
  const { locale, defaultLocale } = router;
  const { t } = useTranslation('common');

  const [answersCount, setAnswersCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Funzione per fare il fetch del PDF
  const fetchPdf = useCallback(() => {
    const cookie = getCookie('identikit_answers');
    const answers = cookie ? JSON.parse(cookie) : [];
    console.log('Invio risposte al server:', answers.length);

    if (!answers.length) {
      setError(t('noAnswers'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setPdfUrl('');

    fetch(`/api/generate-pdf?locale=${locale || defaultLocale}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
      .then(async (res) => {
        if (!res.ok) {
          let errMsg = t('pdfError');
          try {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const errJson = await res.json();
              errMsg = errJson.error || errJson.message || errMsg;
            } else {
              errMsg = await res.text();
            }
          } catch {}
          throw new Error(errMsg);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        // Avvia il download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'identikit.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Cancella il cookie
        document.cookie = 'identikit_answers=; max-age=0; path=/';
      })
      .catch((err) => {
        console.error('Download error:', err);
        setError(err.message || t('pdfError'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, defaultLocale, t]);

  useEffect(() => {
    // Debug: mostra quante risposte legge dal cookie
    const cookie = getCookie('identikit_answers');
    const answers = cookie ? JSON.parse(cookie) : [];
    setAnswersCount(answers.length);

    // Avvia la generazione del PDF
    fetchPdf();
  }, [fetchPdf]);

  // Mostra il conteggio delle risposte per debug
  if (answersCount !== null && loading === false && !error && !pdfUrl) {
    return (
      <div className="max-w-xl mx-auto p-4 text-center">
        <p>Ho letto <strong>{answersCount}</strong> risposte dal cookie.</p>
        <button
          onClick={fetchPdf}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {t('retryDownload')}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{t('generatingPDF')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 text-red-600 text-center space-y-4">
        <p>{error}</p>
        <button
          onClick={fetchPdf}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {t('retryDownload')}
        </button>
      </div>
    );
  }

  // Se il download è partito correttamente
  if (pdfUrl) {
    return (
      <div className="max-w-xl mx-auto p-4 text-center space-y-4">
        <h1 className="text-xl font-semibold">{t('downloadStarted')}</h1>
        <p>{t('downloadIfNotStarted')}</p>
        <a
          href={pdfUrl}
          download="identikit.pdf"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('downloadLink')}
        </a>
      </div>
    );
  }

  return null;
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
