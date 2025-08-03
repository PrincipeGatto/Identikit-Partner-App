import { useState } from 'react';

const questions = [
  {
    id: 1,
    text: "Quanto è importante per te l'umorismo in una relazione?",
    options: ["Per nulla", "Poco", "Abbastanza", "Molto", "Essenziale"]
  },
  {
    id: 2,
    text: "Ti piace condividere attività nel tempo libero?",
    options: ["Mai", "A volte", "Spesso", "Sempre"]
  },
  {
    id: 3,
    text: "Quanto valore dai alla comunicazione aperta?",
    options: ["Poco", "Moderato", "Molto", "Fondamentale"]
  }
];

export default function Questionario() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[current] = value;
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      alert("Questionario completato! (presto lo collegheremo al PDF)");
    }
  };

  const q = questions[current];

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">{q.text}</h2>
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
