// pages/api/generate-pdf.js

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }  // abilitiamo il JSON bodyParser
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Nessuna risposta ricevuta' });
  }

  // Impostiamo header PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="test-answers.pdf"');

  // Creiamo il PDF
  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  doc.fontSize(20).text('Report delle Risposte', { align: 'center' });
  doc.moveDown();

  // Inseriamo ciascuna risposta in una riga numerata
  answers.forEach((ans, idx) => {
    doc.fontSize(12).text(`${idx + 1}. ${Array.isArray(ans) ? ans.join(', ') : ans}`);
    doc.moveDown(0.3);
  });

  doc.end();
  stream.pipe(res);
}
