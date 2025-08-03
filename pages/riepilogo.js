// pages/riepilogo.js

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Riepilogo() {
  const router = useRouter();
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('identikit_answers');
    if (!saved) {
      router.replace('/questionario');
      return;
    }
    setAnswers(JSON.parse(saved));
  }, [router]);

  // Durante il prerender answers === null → non proviamo a fare map
  if (answers === null) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {/* Carichiamo la stringa direttamente via serverSideTranslations */}
        Summary of Your Answers
      </h1>
      <ul className="list-decimal list-inside mb-6">
        {answers.map((ans, i) => (
          <li key={i} className="mb-2">
            Question {i + 1}: <span className="font-medium">{ans}</span>
          </li>
        ))}
      </ul>
      <Link href="/checkout">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Proceed to Payment (€9.90)
        </button>
      </Link>
    </div>
  );
}

// carichiamo sempre il namespace 'common' su server
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
