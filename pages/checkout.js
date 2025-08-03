// pages/checkout.js

import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Checkout() {
  const { t } = useTranslation('common');

  useEffect(() => {
    fetch('/api/checkout', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>{t('loading')}…</p>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
