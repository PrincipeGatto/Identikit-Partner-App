// pages/checkout.js

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    // 1) Preleva tutte le risposte
    const answers = localStorage.getItem('identikit_answers');
    if (answers) {
      // 2) Scrivi il cookie prima del redirect
      document.cookie = `identikit_answers=${encodeURIComponent(
        answers
      )}; max-age=${60 * 60}; path=/`;
    } else {
      setError(t('noAnswers'));
      setLoading(false);
      return;
    }

    try {
      // 3) Crea la sessione di checkout nel backend
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(t('error'));
      const { sessionId } = await res.json();

      // 4) Redirect a Stripe Checkout
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || t('error'));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('proceedToPayment')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? t('loading') : t('proceedToPayment')}
      </button>
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

