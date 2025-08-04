// pages/api/generate-pdf.js

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { Configuration, OpenAIApi } from 'openai';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Nessuna risposta ricevuta' });
  }

  // Normalizza a 37 risposte
  const TOTAL_Q = 37;
  const normalized = Array.from({ length: TOTAL_Q }, (_, i) =>
    answers[i] !== undefined ? answers[i] : ''
  );

  // Carica template JSON
  const locale = req.query.locale || 'it';
  const jsonPath = path.join(process.cwd(), 'public', 'locales', locale, 'pdf.json');
  const pdfJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Costruisci il prompt per GPT
  const prompt = `
Sei un assistente che genera report socio-psicologici dettagliati.
Ricevi 37 risposte utente:
${normalized.map((a,i) => `Domanda ${i+1}: ${Array.isArray(a)?a.join(', '):a}`).join('\n')}

Usa questa struttura (${locale}):
Titolo: ${pdfJson.header}

1) ${pdfJson.sections['1'].title}: ${pdfJson.sections['1'].intro}
2) ${pdfJson.sections['2'].title}: ${pdfJson.sections['2'].intro}
3) ${pdfJson.sections['3'].title}: ${pdfJson.sections['3'].intro}
4) ${pdfJson.sections['4'].title}: ${pdfJson.sections['4'].intro}

Luoghi consigliati:
${pdfJson.places.map((p,i) => `${i+1}. ${p}`).join('\n')}

Strategie di approccio:
${pdfJson.approaches.map((a,i) => `${i+1}. ${a}`).join('\n')}

Genera un report di circa 1000–1200 parole, suddiviso in paragrafi separati per ciascuna delle 4 sezioni principali, poi un paragrafo per “Luoghi consigliati” e uno per “Strategie di approccio”. Non aggiungere altre sezioni.
`;

  let report;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Sei un generatore di report PDF dettagliati.' },
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

  // Header risposta PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="identikit.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  // Scrivi header
  doc.fontSize(20).text(pdfJson.header, { align: 'center' });
  doc.moveDown();

  // Inserisci ogni paragrafo generato
  report.split(/\n{2,}/).forEach(para => {
    doc.fontSize(12).text(para.trim());
    doc.moveDown();
  });

  doc.end();
  stream.pipe(res);
}

