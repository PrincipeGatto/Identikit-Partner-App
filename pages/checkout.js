// pages/checkout.js

import { useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Checkout() {
  useEffect(() => {
    fetch('/api/checkout', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        window.location.href = data.url;
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Reindirizzamento al pagamento…</p>
    </div>
  );
}

// Utilizziamo getServerSideProps per caricare il namespace 'common' ed evitare errori di prerender
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
