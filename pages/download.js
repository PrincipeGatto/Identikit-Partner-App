// pages/download.js

import { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Download() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const answers = JSON.parse(localStorage.getItem('identikit_answers') || '[]');
    if (!answers.length) {
      setError('Non ci sono risposte salvate. Completa prima il questionario.');
      return;
    }

    setLoading(true);
    fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    })
      .then(res => {
        if (!res.ok) throw new Error('Errore nella generazione del PDF');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'identikit.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      {loading ? (
        <p>Generazione PDF in corso, attendi…</p>
      ) : (
        <p>Preparazione download…</p>
      )}
    </div>
  );
}

// Anche qui usiamo getServerSideProps per il namespace 'common'
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
