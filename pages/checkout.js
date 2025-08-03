import { useEffect } from 'react';

export default function Checkout() {
  useEffect(() => {
    // qui chiameremo la tua API Stripe per ottenere session.url
    fetch('/api/checkout', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        window.location.href = data.url;
      });
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Reindirizzamento al pagamento…</p>
    </div>
  );
}
