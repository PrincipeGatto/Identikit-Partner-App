// pages/_app.js
import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css';
import nextI18nConfig from '../next-i18next.config';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// 'appWithTranslation' collega next-i18next alla tua App
export default appWithTranslation(MyApp, nextI18nConfig);
