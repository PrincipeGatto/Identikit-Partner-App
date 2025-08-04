// pages/download.js

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Helper per leggere un cookie
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v.pop()) : '';
}

export default function Download() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Legge le risposte dal cookie
    const cookie = getCookie('identikit_answers');
    const answers = cookie ? JSON.parse(cookie) : [];

    if (!answers.length) {
      setError(t('noAnswers'));
      setLoading(false);
      return;
    }

    fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
      .then(async (res) => {
        if (!res.ok) {
          // Proviamo a leggere un JSON d'errore o, in alternativa, testo semplice
          let errMsg = t('pdfError');
          try {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const errJson = await res.json();
              errMsg = errJson.error || errJson.message || errMsg;
            } else {
              errMsg = await res.text();
            }
          } catch (parseErr) {
            console.error('Error parsing error response:', parseErr);
          }
          throw new Error(errMsg);
        }
        return res.blob();
      })
      .then((blob) => {
        // Avvia il download
        const url = window.URL.createObjectURL(blob);
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
  }, [t]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{t('generatingPDF')}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 text-red-600 text-center">
        <p>{error}</p>
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
