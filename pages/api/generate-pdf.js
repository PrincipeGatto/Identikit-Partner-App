// pages/api/generate-pdf.js

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

// Suddivisione macro-aree: mappa id domanda → area
const AREA_MAP = {
  valori:       [1,2,3,4,5,6,7,8],
  comunicazione:[9,10,11,12,13,14,15],
  interessi:    [16,17,18,19,20,21],
  aspirazioni:  [22,23,24,25,26,27,28],
  autonomia:    [29,30,31,32,33,34,35],
  influenze:    [36,37]
};

// Sintesi per area: date le risposte, produce un paragrafo
function synthesizeArea(areaKey, answers, localeStrings) {
  const ids = AREA_MAP[areaKey];
  const texts = ids.map(id => answers[id - 1]);
  switch (areaKey) {
    case 'valori':
      return `I tuoi valori principali includono: ${texts.slice(0,3).join(', ')}; dedichi inoltre attenzione a ${texts.slice(3,6).join(', ')}.`;
    case 'comunicazione':
      return `In termini di comunicazione, tendi a ${texts[0].toLowerCase()} e preferisci ${texts[2].toLowerCase()}; la tua empatia si colloca a livello ${texts[3]}.`;
    case 'interessi':
      return `Le tue passioni spaziano da ${texts.join(', ')}; sei molto aperto a nuove esperienze (${texts[1]}).`;
    case 'aspirazioni':
      return `Progetti futuri: "${texts[0]}". Dai molta importanza a ${texts[1]} e consideri ${texts[3]} una priorità.`;
    case 'autonomia':
      return `Hai bisogno di ${texts[0]} di spazio personale, bilanciato con momenti condivisi (${texts[3]}).`;
    case 'influenze':
      return `Tendi a farti influenzare ${texts[0]} dalle opinioni esterne e attribuisci valore ${texts[1]}.`;
    default:
      return '';
  }
}

// Paragrafo puntuale per domande chiave
function paragraphForQuestion(id, answer) {
  switch (id) {
    case 3:
      return `Vivi in “${answer}”: questo ambiente influenzerà i luoghi e gli eventi disponibili per te.`;
    case 16:
      return `Tra le attività preferite: ${answer.join(', ')}.`;
    case 22:
      return `Il tuo obiettivo principale per i prossimi 5 anni è: "${answer}".`;
    default:
      return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length < 37) {
    return res.status(400).json({ error: 'Risposte incomplete' });
  }

  const locale = req.query.locale || 'it';
  const pdfJson = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'public', 'locales', locale, 'pdf.json'),
      'utf8'
    )
  );

  // Genera sintesi per ciascuna area
  const areaSections = Object.keys(AREA_MAP).map((areaKey) => ({
    title: pdfJson.sections[ areaKey === 'valori' ? '1' :
                               areaKey === 'comunicazione'  ? '1' :
                               areaKey === 'interessi'      ? '2' :
                               areaKey === 'aspirazioni'    ? '2' :
                               areaKey === 'autonomia'      ? '3' :
                               '4' // influenze
                             ].title,
    paragraph: synthesizeArea(areaKey, answers)
  }));

  // Paragrafi chiave
  const keyParagraphs = [3,16,22]
    .map((id) => paragraphForQuestion(id, answers[id - 1]))
    .filter(p => p);

  // Headers per il PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="identikit.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  const stream = Readable.from(doc);

  // Intestazione
  doc.fontSize(20).text(pdfJson.header, { align: 'center' });
  doc.moveDown();

  // 1) Sintesi valori + comunicazione
  doc.fontSize(14).text(pdfJson.sections['1'].title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(areaSections[0].paragraph);
  doc.moveDown(0.5);
  doc.fontSize(12).text(areaSections[1].paragraph);

  // 2) Sintesi interessi + aspirazioni
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['2'].title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(areaSections[2].paragraph);
  doc.moveDown(0.5);
  doc.fontSize(12).text(areaSections[3].paragraph);

  // 3) Autonomia + influenze
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['3'].title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(areaSections[4].paragraph);
  doc.moveDown(0.5);
  doc.fontSize(12).text(areaSections[5].paragraph);

  // 4) Paragrafi chiave dettagliati
  if (keyParagraphs.length) {
    doc.addPage();
    doc.fontSize(14).text(pdfJson.sections['4'].title, { underline: true });
    doc.moveDown(0.5);
    keyParagraphs.forEach((p) => {
      doc.fontSize(12).text(p);
      doc.moveDown(0.5);
    });
  }

  // 5) Luoghi consigliati
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['3'].title, { underline: true });
  doc.moveDown(0.5);
  pdfJson.places.forEach((place, i) => {
    doc.fontSize(12).text(`${i + 1}. ${place}`);
  });

  // 6) Strategie di approccio
  doc.addPage();
  doc.fontSize(14).text(pdfJson.sections['4'].title, { underline: true });
  doc.moveDown(0.5);
  pdfJson.approaches.forEach((app, i) => {
    doc.fontSize(12).text(`${i + 1}. ${app}`);
  });

  doc.end();
  stream.pipe(res);
}

