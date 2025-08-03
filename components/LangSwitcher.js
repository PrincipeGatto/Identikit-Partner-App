// components/LangSwitcher.js
import { useRouter } from 'next/router';

export default function LangSwitcher() {
  const router = useRouter();
  const { locale, locales, pathname, query, asPath } = router;

  return (
    <select
      value={locale}
      onChange={(e) =>
        router.push({ pathname, query }, asPath, { locale: e.target.value })
      }
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
