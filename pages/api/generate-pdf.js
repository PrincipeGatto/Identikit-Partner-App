// pages/api/generate-pdf.js

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export const config = {
  api: { bodyParser: false }  // disabilitiamo il bodyParsers per questo test
};

export default function handler(req, res) {
  // Accettiamo solo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // Impostiamo header PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');

  // Creiamo un PDF di prova
  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  doc.fontSize(20).text('Test PDF', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Se vedi questo, il PDF è stato generato con successo!', {
    align: 'left'
  });
  doc.end();

  // Stream del PDF al client
  stream.pipe(res);
}
