import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationES from "../locales/es/translate.json";
import translationEN from "../locales/en/translate.json";

const resources = {
  es: { translation: translationES },
  en: { translation: translationEN },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: translationES },
      en: { translation: translationEN },
    },
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
  caches: ['localStorage', 'cookie'],    },
  });

export default i18n