import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';

/**
 * i18next initialization with:
 * - compatibilityJSON: 'v3' — silences Intl API warning on older Android devices
 *   that lack full Intl.PluralRules support. All locale files use v3 format.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    sw: { translation: sw },
  },
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
