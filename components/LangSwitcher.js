// components/LangSwitcher.js
import { useRouter } from 'next/router';

export default function LangSwitcher() {
  const router = useRouter();
  const { locale, locales, pathname, query, asPath } = router;

  // Durante il prerender o in assenza di routing, non renderizziamo nulla
  if (!locales) return null;

  return (
    <select
      value={locale}
      onChange={(e) =>
        router.push({ pathname, query }, asPath, { locale: e.target.value })
      }
      className="border p-1 rounded"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
