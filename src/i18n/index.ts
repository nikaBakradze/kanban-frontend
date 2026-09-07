import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ka from './locales/ka.json';

const languageStorageKey = 'kanban-language';

void i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ka: { translation: ka } },
    lng: localStorage.getItem(languageStorageKey) || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (language) => {
  localStorage.setItem(languageStorageKey, language);
});

export { i18n, languageStorageKey };
