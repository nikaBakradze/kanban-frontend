import { useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import kanbanLogo from '../assets/kanban-logo.svg';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export default function NotFound() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;
  const { t } = useTranslation();

  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute('content');

    document.title = t('notFound.title');
    robots?.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = previousTitle;
      if (robots && previousRobots) {
        robots.setAttribute('content', previousRobots);
      }
    };
  }, [t]);

  return (
    <main className="relative flex min-h-[calc(100vh-2rem)] w-full max-w-3xl items-center justify-center overflow-hidden px-4 py-12 text-white">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <section className="relative w-full rounded-3xl border border-gray-800/80 bg-[#13151b]/85 p-8 text-center shadow-2xl backdrop-blur-md sm:p-14">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
          <img src={kanbanLogo} alt="Kanban" className="h-9 w-9" />
        </div>
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Kanban</p>
        <h1 className="mt-5 text-7xl font-bold tracking-tight text-white sm:text-9xl">404</h1>
        <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{t('notFound.page')}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-400 sm:text-base">
          {t('notFound.description')}
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#13151b]"
          >
            <Home size={17} />
            {t('notFound.backHome')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={!canGoBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700/70 bg-[#1c1f26]/70 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:bg-[#232730] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#13151b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={17} />
            {t('notFound.goBack')}
          </button>
        </div>
      </section>
    </main>
  );
}
