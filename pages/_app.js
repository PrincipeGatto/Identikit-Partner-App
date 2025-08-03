// pages/_app.js
import { appWithTranslation } from 'next-i18next';
import nextI18nConfig from '../next-i18next.config';
import '../styles/globals.css';

// Import del componente
import LangSwitcher from '../components/LangSwitcher';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      {/* Qui renderizzi il selettore di lingua */}
      <header className="p-4 flex justify-end">
        <LangSwitcher />
      </header>

      {/* Qui tutto il resto della pagina */}
      <Component {...pageProps} />
    </div>
  );
}

export default appWithTranslation(MyApp, nextI18nConfig);
