// pages/api/generate-pdf.js

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { Configuration, OpenAIApi } from 'openai';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

// Inizializza il client OpenAI
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Nessuna risposta ricevuta' });
  }

  // Carica il template di struttura da pdf.json
  const locale = req.query.locale || 'it';
  const jsonPath = path.join(process.cwd(), 'public', 'locales', locale, 'pdf.json');
  const pdfJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Costruisci il prompt per ChatGPT
  const prompt = `
Sei un assistente che genera report socio-psicologici dettagliati. 
Ricevi 37 risposte utente:

${answers.map((a,i) => `Domanda ${i+1}: ${Array.isArray(a)?a.join(', '):a}`).join('\n')}

Utilizza questa struttura (${locale}):

Titolo: ${pdfJson.header}

Sezione 1 - ${pdfJson.sections['1'].title}: ${pdfJson.sections['1'].intro}

Sezione 2 - ${pdfJson.sections['2'].title}: ${pdfJson.sections['2'].intro}

Sezione 3 - ${pdfJson.sections['3'].title}: ${pdfJson.sections['3'].intro}

Sezione 4 - ${pdfJson.sections['4'].title}: ${pdfJson.sections['4'].intro}

Luoghi consigliati: ${pdfJson.places.join('; ')}

Strategie di approccio: ${pdfJson.approaches.join('; ')}

Genera un testo di **circa 1000–1200 parole**, suddiviso in paragrafi chiari per ciascuna sezione (1–4), poi un paragrafo per "Luoghi consigliati" e uno per "Strategie di approccio". Non aggiungere altre sezioni.
`;

  // Chiama ChatGPT
  let report;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Sei un generatore di report PDF.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    report = completion.data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'Errore AI: ' + (err.message || err.toString()) });
  }

  // Prepara il PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="identikit.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  // Scrivi header
  doc.fontSize(20).text(pdfJson.header, { align: 'center' });
  doc.moveDown();

  // Spezza il report in paragrafi e inserisci
  report.split(/\n{2,}/).forEach((para) => {
    doc.fontSize(12).text(para.trim());
    doc.moveDown();
  });

  doc.end();
  stream.pipe(res);
}

