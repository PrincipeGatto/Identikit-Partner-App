// pages/api/generate-pdf.js

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  return res.status(200).json({ ok: true, method: req.method });
}
