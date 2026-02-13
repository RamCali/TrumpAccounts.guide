/**
 * Bidirectional URL mapping between English and Spanish page slugs.
 * Used by the language switcher to navigate between locale equivalents.
 */

const urlPairs: [string, string][] = [
  ['/', '/'],
  ['/what-are-trump-accounts', '/que-son-las-cuentas-trump'],
  ['/how-to-open-trump-account', '/como-abrir-cuenta-trump'],
  ['/calculators', '/calculadoras'],
  ['/calculators/growth-calculator', '/calculadoras/calculadora-de-crecimiento'],
  ['/calculators/eligibility-checker', '/calculadoras/verificador-de-elegibilidad'],
  ['/calculators/employer-match', '/calculadoras/contribucion-del-empleador'],
  ['/faq', '/preguntas-frecuentes'],
];

const enToEs = new Map<string, string>();
const esToEn = new Map<string, string>();

for (const [en, es] of urlPairs) {
  enToEs.set(en, es);
  esToEn.set(es, en);
}

/**
 * Given the current pathname and locale, return the alternate-language URL.
 */
export function getAlternateUrl(pathname: string, currentLocale: 'en' | 'es'): string {
  if (currentLocale === 'en') {
    // English -> Spanish: look up the mapping and prefix with /es
    const esPath = enToEs.get(pathname);
    return esPath ? `/es${esPath}` : `/es${pathname}`;
  } else {
    // Spanish -> English: strip /es prefix, then look up reverse mapping
    const withoutPrefix = pathname.replace(/^\/es/, '') || '/';
    const enPath = esToEn.get(withoutPrefix);
    return enPath ?? withoutPrefix;
  }
}

/**
 * Get the English equivalent path from a Spanish path (without /es prefix).
 */
export function getEnglishPath(esPath: string): string {
  return esToEn.get(esPath) ?? esPath;
}

/**
 * Get the Spanish equivalent path from an English path (without /es prefix).
 */
export function getSpanishPath(enPath: string): string {
  return enToEs.get(enPath) ?? enPath;
}
