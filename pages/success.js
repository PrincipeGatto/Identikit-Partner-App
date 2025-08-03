import { useEffect } from 'react';
import Link from 'next/link';

export default function Success() {
  useEffect(() => {
    // puliamo localStorage per il prossimo utente
    localStorage.removeItem('identikit_answers');
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Grazie per il tuo acquisto!</h1>
      <p className="mb-6">Stiamo generando il tuo PDF…</p>
      <Link href="/download">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Scarica il tuo identikit
        </button>
      </Link>
    </div>
  );
}
