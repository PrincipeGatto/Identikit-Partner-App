// pages/download.js

import { useEffect, useState } from 'react';
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const cookie = getCookie('identikit_answers');
    const answers = cookie ? JSON.parse(cookie) : [];

    if (!answers.length) {
      setError(t('noAnswers'));
      setLoading(false);
      return;
    }

    fetch(`/api/generate-pdf?locale=${locale || defaultLocale}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
      .then(async (res) => {
        if (!res.ok) {
          let errMsg = t('pdfError');
          try {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
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
        // Avvia il download automatico
        const a = document.createElement('a');
        a.href = url;
        a.download = 'identikit.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Cancella il cookie dopo il download
        document.cookie = 'identikit_answers=; max-age=0; path=/';
      })
      .catch((err) => {
        console.error('Download error:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, defaultLocale, t]);

  // Stato loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{t('generatingPDF')}</p>
      </div>
    );
  }

  // Stato errore
  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 text-red-600 text-center">
        <p>{error}</p>
      </div>
    );
  }

  // Stato successo/fallback
  return (
    <div className="max-w-xl mx-auto p-4 text-center space-y-4">
      <h1 className="text-xl font-semibold">{t('downloadStarted')}</h1>
      <p>{t('downloadIfNotStarted')}</p>

      {pdfUrl ? (
        <a
          href={pdfUrl}
          download="identikit.pdf"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('downloadLink')}
        </a>
      ) : (
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {t('retryDownload')}
        </button>
      )}
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
