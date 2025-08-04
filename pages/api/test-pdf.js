// pages/api/test-pdf.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).send('Only POST allowed');
  }
  // Ritorna esattamente ciò che riceve
  return res.status(200).json({ received: req.body, method: req.method });
}
