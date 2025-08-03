import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Riepilogo() {
  const router = useRouter();
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('identikit_answers');
    if (!saved) {
      router.push('/questionario');
      return;
    }
    setAnswers(JSON.parse(saved));
  }, []);

  if (answers.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Riepilogo delle tue risposte</h1>
      <ul className="list-decimal list-inside mb-6">
        {answers.map((ans, i) => (
          <li key={i} className="mb-2">
            Domanda {i + 1}: <span className="font-medium">{ans}</span>
          </li>
        ))}
      </ul>
      <Link href="/checkout">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Procedi al pagamento (€9,90)
        </button>
      </Link>
    </div>
  );
}
