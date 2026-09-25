import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import kanbanLogo from '../../assets/kanban-logo.svg';
import { useTranslation } from 'react-i18next';

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer
      className="
        mx-auto
        flex
        w-full
        max-w-7xl
        flex-col
        gap-5
        border-t
        border-slate-200/70
        px-5
        py-8
        text-sm
        text-slate-500
        dark:border-white/10
        dark:text-slate-400
        sm:px-8
        md:flex-row
        md:items-center
        md:justify-between
        lg:px-10
      "
    >
      <Link
        to="/"
        className="
          flex
          items-center
          gap-2
          font-bold
          tracking-[0.15em]
          text-slate-900
          dark:text-white
        "
      >
        <img
          src={kanbanLogo}
          alt="Kanban"
          className="
            h-5
            w-5
          "
        />

        KANBAN
      </Link>

      <div
        className="
          flex
          flex-wrap
          gap-x-5
          gap-y-2
        "
      >
        <Link
          className="
            transition
            hover:text-[#635FC7]
          "
          to="/"
        >
          {t('public.home')}
        </Link>

        <a
          className="
            transition
            hover:text-[#635FC7]
          "
          href="/#features"
        >
          {t('public.features')}
        </a>

        <Link
          className="
            transition
            hover:text-[#635FC7]
          "
          to="/login"
        >
          {t('public.signIn')}
        </Link>

        <Link
          className="
            transition
            hover:text-[#635FC7]
          "
          to="/registration"
        >
          {t('public.getStarted')}
        </Link>
      </div>

      <div
        className="
          flex
          flex-col
          gap-3
          md:items-end
        "
      >
        <span>
          {t('public.builtBy')}
        </span>

        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <a
            href="https://github.com/nikaBakradze"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="
              transition
              hover:text-[#635FC7]
            "
          >
            <FaGithub size={20} />
          </a>

          <a
            href="https://instagram.com/_nbakradzeee"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="
              transition
              hover:text-[#635FC7]
            "
          >
            <FaInstagram size={20} />
          </a>

          <a
            href="https://www.linkedin.com/in/nika-bakradze-aba496387/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="
              transition
              hover:text-[#635FC7]
            "
          >
            <FaLinkedin size={20} />
          </a>

          <a
            href="https://www.facebook.com/Nika.bakradze0/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="
              transition
              hover:text-[#635FC7]
            "
          >
            <FaFacebook size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}