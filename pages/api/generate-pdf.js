// pages/api/generate-pdf.js

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { Configuration, OpenAIApi } from 'openai';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

// Inizializza OpenAI
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// Funzione helper per parsing cookie
function parseCookie(header) {
  if (!header) return {};
  return header.split(';').map(v => v.split('='))
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});
}

// Il nostro handler
export default async function handler(req, res) {
  // 1) Gestione CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // 2) Sempre abilitare CORS per POST
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 3) Accettiamo solo POST da parte del client
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST','OPTIONS']);
    return res.status(405).end('Method Not Allowed');
  }

  // 4) Estraiamo le risposte
  let answers = req.body?.answers;
  if (!Array.isArray(answers) || answers.length === 0) {
    // fallback: prova dal cookie
    const cookies = parseCookie(req.headers.cookie || '');
    try {
      answers = JSON.parse(cookies.identikit_answers || '[]');
    } catch {
      answers = [];
    }
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Nessuna risposta ricevuta' });
  }

  // 5) Normalizziamo a 37 risposte
  const TOTAL_Q = 37;
  const normalized = Array.from({ length: TOTAL_Q }, (_, i) =>
    answers[i] !== undefined ? answers[i] : ''
  );

  // 6) Carichiamo template da JSON
  const locale = req.query.locale || 'it';
  const jsonPath = path.join(process.cwd(), 'public/locales', locale, 'pdf.json');
  const pdfJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // 7) Costruiamo il prompt per GPT
  const prompt = `
Sei un assistente che genera report socio-psicologici. Ricevi queste 37 risposte:
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

Genera un report di 1000–1200 parole, suddiviso in paragrafi separati per ciascuna sezione principale, poi paragrafi aggiuntivi per “Luoghi consigliati” e “Strategie di approccio”.
`;

  // 8) Chiamiamo OpenAI
  let report;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Genera report PDF dettagliati.' },
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

  // 9) Preparo il PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="identikit.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);
  doc.fontSize(20).text(pdfJson.header, { align: 'center' });
  doc.moveDown();
  report.split(/\n{2,}/).forEach(p => {
    doc.fontSize(12).text(p.trim());
    doc.moveDown();
  });
  doc.end();
  stream.pipe(res);
}

