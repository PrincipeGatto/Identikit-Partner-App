// pages/questionario.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Questionario() {
  const router = useRouter();
  const { t } = useTranslation('questionnaire');

  // Carica oggetto domande e opzioni
  const questionsObj = t('questions', { returnObjects: true });
  const optionsObj   = t('options',   { returnObjects: true });

  // Converti in array ordinato
  const questions = Object.keys(questionsObj)
    .sort((a, b) => Number(a) - Number(b))
    .map((id) => ({
      id: Number(id),
      text: questionsObj[id],
      options: optionsObj[id]
    }));

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Carica risposte salvate
  useEffect(() => {
    const saved = localStorage.getItem('identikit_answers');
    if (saved) setAnswers(JSON.parse(saved));
  }, []);

  // Salva su ogni modifica
  useEffect(() => {
    localStorage.setItem('identikit_answers', JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (value) => {
    const newAns = [...answers];
    newAns[current] = value;
    setAnswers(newAns);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/riepilogo');
    }
  };

  const q = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>

      {/* Avanzamento */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">
          {current + 1}/{questions.length}
        </div>
        <div className="w-full bg-gray-300 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Domanda */}
      <h2 className="text-xl font-semibold mb-4">{q.text}</h2>

      {/* Opzioni */}
      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'questionnaire'])),
    },
  };
}
