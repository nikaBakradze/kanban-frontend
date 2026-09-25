import { useTranslation } from 'react-i18next';
import 'flag-icons/css/flag-icons.min.css';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage === 'ka' ? 'ka' : 'en';

  return (
    <div
      aria-label={t('language.label')}
      className="flex items-center gap-0.5 rounded-full border border-[#E4EBFA] bg-transparent p-1 text-xs dark:border-[#3E3F4E] dark:bg-[#2B2C37]"
      role="group"
    >
      <button
        type="button"
        aria-label={t('language.switchToEnglish')}
        aria-pressed={language === 'en'}
        onClick={() => void i18n.changeLanguage('en')}
        className={`flex min-h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#635FC7] ${
          language === 'en'
            ? 'bg-[#635FC7]/15 shadow-sm'
            : 'opacity-60 hover:bg-[#635FC7]/10 hover:opacity-100'
        }`}
      >
        <span aria-hidden="true" className="fi fi-gb" />
      </button>
      <button
        type="button"
        aria-label={t('language.switchToGeorgian')}
        aria-pressed={language === 'ka'}
        onClick={() => void i18n.changeLanguage('ka')}
        className={`flex min-h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#635FC7] ${
          language === 'ka'
            ? 'bg-[#635FC7]/15 shadow-sm'
            : 'opacity-60 hover:bg-[#635FC7]/10 hover:opacity-100'
        }`}
      >
        <span aria-hidden="true" className="fi fi-ge" />
      </button>
    </div>
  );
};
