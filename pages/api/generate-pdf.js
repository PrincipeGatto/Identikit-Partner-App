// pages/api/generate-pdf.js

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export default async function handler(req, res) {
  // Solo GET: il client clicca sul link per scaricare
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // Dati fittizi: in produzione, li costruirai a partire da answers salvate o da un db
  const profileText = `
  Identikit Socio-Psicologico del Partner Ideale

  Tratti di personalità:
  - Empatico e sensibile
  - Apertura mentale e curiosità intellettuale
  - Forte senso dell'umorismo

  Luoghi consigliati:
  1. Caffè letterari e club di lettura
  2. Workshop di cucina e corsi d’arte
  3. Escursioni nei parchi naturali

  Attività e hobby:
  - Yoga o meditazione in gruppo
  - Serate di quiz e giochi da tavolo
  - Viaggi culturali e mostre d’arte

  Modalità di approccio:
  - Sii autentico e mostra il tuo lato divertente
  - Inizia conversazioni su libri, film o arte
  - Proponi un’attività condivisa come un corso breve
  `;

  // Imposta headers per il download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=identikit.pdf');

  // Crea PDF in streaming
  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  doc.fontSize(20).text('Identikit Partner Ideale', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(profileText, { align: 'left' });
  doc.end();

  // Manda i dati al client
  stream.pipe(res);
}
