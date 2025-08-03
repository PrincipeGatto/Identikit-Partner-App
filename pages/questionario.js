import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const questions = [
  { id: 1, text: "Quanto è importante per te l'umorismo in una relazione?", options: ["Per nulla", "Poco", "Abbastanza", "Molto", "Essenziale"] },
  { id: 2, text: "Ti piace condividere attività nel tempo libero?", options: ["Mai", "A volte", "Spesso", "Sempre"] },
  { id: 3, text: "Quanto valore dai alla comunicazione aperta?", options: ["Poco", "Moderato", "Molto", "Fondamentale"] },
  { id: 4, text: "Preferisci una relazione più stabile o più spontanea?", options: ["Molto stabile", "Più stabile che spontanea", "Equilibrata", "Più spontanea che stabile", "Molto spontanea"] },
  { id: 5, text: "Quanto ti interessa condividere la tua spiritualità o visione del mondo?", options: ["Per nulla", "Poco", "Moderatamente", "Molto", "Fondamentale"] },
  { id: 6, text: "Quanto ti piacciono le attività all'aperto?", options: ["Non mi piacciono", "Raramente", "Ogni tanto", "Spesso", "Le adoro"] },
  { id: 7, text: "Ti consideri una persona più logica o più emotiva?", options: ["Totalmente logica", "Tendenzialmente logica", "Equilibrata", "Tendenzialmente emotiva", "Totalmente emotiva"] },
  { id: 8, text: "Che importanza dai al contatto fisico?", options: ["Nessuna", "Poca", "Media", "Alta", "Essenziale"] },
  { id: 9, text: "Quanto è importante per te la crescita personale nella coppia?", options: ["Per nulla", "Poco", "Moderatamente", "Molto", "Essenziale"] },
  { id: 10, text: "Preferisci una persona simile o complementare a te?", options: ["Molto simile", "Piuttosto simile", "Equilibrata", "Piuttosto diversa", "Molto diversa"] }
];

const STORAGE_KEY = 'identikit_answers';

export default function Questionario() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Carica eventuali risposte già salvate
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, []);

  // Salva in localStorage ad ogni cambio delle risposte
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (value) => {
    // aggiorna l'array delle risposte
    const newAns = [...answers];
    newAns[current] = value;
    setAnswers(newAns);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // vai al riepilogo
      router.push('/riepilogo');
    }
  };

  const q = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Barra di avanzamento */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">
          Domanda {current + 1} di {questions.length}
        </div>
        <div className="w-full bg-gray-300 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Testo della domanda */}
      <h2 className="text-xl font-bold mb-4">{q.text}</h2>

      {/* Opzioni di risposta */}
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
