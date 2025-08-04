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

// Parse dei cookie
function parseCookie(header) {
  if (!header) return {};
  return header.split(';').map(v => v.split('='))
    .reduce((acc, [k, v]) => { acc[k.trim()] = decodeURIComponent(v); return acc; }, {});
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Permetti le chiamate anche da fetch
  res.setHeader('Access-Control-Allow-Origin', '*');

  let answers;
  if (req.method === 'POST') {
    answers = req.body.answers;
  } else if (req.method === 'GET') {
    const cookies = parseCookie(req.headers.cookie);
    try {
      answers = JSON.parse(cookies.identikit_answers || '[]');
    } catch {
      answers = [];
    }
  } else {
    res.setHeader('Allow', ['GET','POST','OPTIONS']);
    return res.status(405).end('Method Not Allowed');
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Nessuna risposta ricevuta' });
  }

  // Normalizza a 37
  const TOTAL_Q = 37;
  const normalized = Array.from({ length: TOTAL_Q }, (_, i) =>
    answers[i] !== undefined ? answers[i] : ''
  );

  const locale = req.query.locale || 'it';
  const jsonPath = path.join(process.cwd(), 'public', 'locales', locale, 'pdf.json');
  const pdfJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Costruisci prompt per OpenAI
  const prompt = `
Sei un assistente che genera report socio-psicologici dettagliati. 
Ricevi 37 risposte:
${normalized.map((a,i) => `Domanda ${i+1}: ${Array.isArray(a)?a.join(', '):a}`).join('\n')}

Struttura:
Titolo: ${pdfJson.header}
1) ${pdfJson.sections['1'].title}: ${pdfJson.sections['1'].intro}
2) ${pdfJson.sections['2'].title}: ${pdfJson.sections['2'].intro}
3) ${pdfJson.sections['3'].title}: ${pdfJson.sections['3'].intro}
4) ${pdfJson.sections['4'].title}: ${pdfJson.sections['4'].intro}
Luoghi: ${pdfJson.places.join('; ')}
Approcci: ${pdfJson.approaches.join('; ')}

Genera un testo di 1000–1200 parole, suddiviso in paragrafi per ciascuna sezione e per le liste.
`;

  let report;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Genera report PDF.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    report = completion.data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'Errore AI: ' + (err.message||err.toString()) });
  }

  // Header PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="identikit.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  // Scrivi
  doc.fontSize(20).text(pdfJson.header, { align: 'center' });
  doc.moveDown();
  report.split(/\n{2,}/).forEach(para => {
    doc.fontSize(12).text(para.trim());
    doc.moveDown();
  });

  doc.end();
  stream.pipe(res);
}
