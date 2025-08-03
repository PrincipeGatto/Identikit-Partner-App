// pages/index.js
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Home() {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('appTitle')}</h1>
      <Link href="/questionario">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {t('startButton')}
        </button>
      </Link>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
