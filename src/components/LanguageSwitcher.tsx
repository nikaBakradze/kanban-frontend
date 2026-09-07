import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage === 'ka' ? 'ka' : 'en';

  return (
    <label className="flex items-center gap-2 text-xs font-bold text-[#828FA3]" title={t('language.label')}>
      <span className="hidden sm:inline">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        value={language}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        className="rounded-full border border-[#E4EBFA] bg-transparent px-2 py-1 text-xs font-bold text-[#828FA3] dark:border-[#3E3F4E] dark:bg-[#2B2C37]"
      >
        <option value="en">🇬🇧 {t('language.english')}</option>
        <option value="ka">🇬🇪 {t('language.georgian')}</option>
      </select>
    </label>
  );
};
