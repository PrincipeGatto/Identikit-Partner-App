// pages/download.js
export default function Download() {
  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Il tuo PDF è pronto!</h1>
      <p className="mb-6">Clicca qui sotto per scaricarlo:</p>
      <a
        href="/api/generate-pdf"
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Scarica Identikit.pdf
      </a>
    </div>
  );
}
