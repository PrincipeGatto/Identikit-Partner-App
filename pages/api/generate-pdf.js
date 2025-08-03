// pages/api/generate-pdf.js

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};

// Funzione di mapping: produce un paragrafo in base alla domanda e alla risposta
function paragraphForQuestion(id, answer, localeStrings) {
  switch (id) {
    case 1:
      return `Honesty in a relationship: you rated it as “${answer}”. This suggests honesty is ${
        answer === localeStrings.options1[4] ? 'crucial' : 'important'
      } for you.`;
    case 3:
      return `You live in “${answer}”, which shapes the types of events and venues available to you.`;
    case 16:
      return `Your top interests include: ${answer.join(', ')}. These activities reflect your passions and social style.`;
    // Aggiungi qui altri casi personalizzati, se desideri.
    default:
      return `Question ${id}: ${answer}`;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Missing answers array' });
  }

  // Determina la lingua da query (es: /api/generate-pdf?locale=en)
  const locale = req.query.locale || 'it';

  // Carica il file JSON di traduzioni per il PDF
  const pdfJsonPath = path.join(
    process.cwd(),
    'public',
    'locales',
    locale,
    'pdf.json'
  );
  const pdfJson = JSON.parse(fs.readFileSync(pdfJsonPath, 'utf8'));

  // Carica opzioni per mapping, ad es. per la domanda 1
  const opts1 = pdfJson.options?.['1'] || [];

  // Genera paragrafi dinamici in base alle risposte
  const dynamicParagraphs = answers.map((ans, idx) =>
    paragraphForQuestion(idx + 1, ans, { options1: opts1 })
  );

  // Imposta headers per il PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="identikit.pdf"');

  // Crea il PDF in streaming
  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  // Intestazione
  doc.fontSize(20).text(pdfJson.header, { align: 'center' });
  doc.moveDown();

  // Sezione 1: Profilo utente dinamico
  doc.fontSize(14).text(pdfJson.sections['1'].title, { underline: true });
  doc.moveDown(0.5);
  dynamicParagraphs.forEach((p) => {
    doc.fontSize(12).text(p);
    doc.moveDown(0.5);
  });

  // Sezione 2: Profilo partner ideale (statico o arricchibile)
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['2'].title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(pdfJson.sections['2'].intro);
  doc.moveDown();
  // (Qui potresti aggiungere ulteriore elaborazione dinamica)

  // Sezione 3: Luoghi consigliati
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['3'].title, { underline: true });
  doc.moveDown(0.5);
  pdfJson.places.forEach((place, idx) => {
    doc.fontSize(12).text(`${idx + 1}. ${place}`);
  });

  // Sezione 4: Strategie di approccio
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['4'].title, { underline: true });
  doc.moveDown(0.5);
  pdfJson.approaches.forEach((app, idx) => {
    doc.fontSize(12).text(`${idx + 1}. ${app}`);
  });

  // Concludi PDF
  doc.end();
  stream.pipe(res);
}
