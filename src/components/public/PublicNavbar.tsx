import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, type MouseEvent } from 'react';
import kanbanLogo from '../../assets/kanban-logo.svg';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { t } = useTranslation();
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleHomeClick = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    if (location.pathname !== '/') return;

    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    closeMenu();
  };

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (location.pathname !== '/') return;

    const section = document.getElementById(id);

    if (!section) return;

    event.preventDefault();

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    closeMenu();
  };

  return (
    <nav
      className={`
        fixed
        left-1/2
        top-4
        z-50
        flex
        w-[calc(100%-2rem)]
        max-w-7xl
        -translate-x-1/2
        items-center
        justify-between
        rounded-2xl
        border
        px-5
        py-4
        transition-all
        duration-500
        sm:px-8
        lg:px-10

        ${
          isScrolled
            ? `
              border-white/30
              bg-white/50
              shadow-[0_8px_40px_rgba(0,0,0,0.08)]
              backdrop-blur-2xl
              backdrop-saturate-150
              dark:border-white/10
              dark:bg-[#171a24]/60
              dark:shadow-black/30
            `
            : `
              border-transparent
              bg-transparent
              shadow-none
              backdrop-blur-0
            `
        }
      `}
    >
      {/* LOGO */}
      <Link
        to="/"
        onClick={handleHomeClick}
        className="
          flex
          items-center
          gap-3
          text-slate-950
          dark:text-white
        "
      >
        <img
          src={kanbanLogo}
          alt="Kanban"
          className="h-7 w-7"
        />

        <span
          className="
            text-xl
            font-bold
            tracking-[0.18em]
          "
        >
          KANBAN
        </span>
      </Link>

      {/* CENTER NAVIGATION */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          hidden
          -translate-x-1/2
          -translate-y-1/2
          items-center
          gap-8
          text-sm
          font-medium
          text-slate-500
          dark:text-slate-300
          md:flex
        "
      >
        <Link
          className="
            transition
            hover:text-[#635FC7]
          "
          to="/"
          onClick={handleHomeClick}
        >
          {t('public.home')}
        </Link>

        <a
          onClick={(event) =>
            handleSectionClick(event, 'features')
          }
          className="
            transition
            hover:text-[#635FC7]
          "
          href="/#features"
        >
          {t('public.features')}
        </a>
      </div>

      {/* RIGHT ACTIONS */}
      <div
        className="
          ml-auto
          hidden
          items-center
          gap-3
          md:flex
        "
      >
        <LanguageSwitcher />

        <Link
          to="/login"
          className="
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:bg-slate-100
            focus:outline-none
            focus:ring-2
            focus:ring-[#635FC7]
            dark:text-slate-200
            dark:hover:bg-white/10
          "
        >
          {t('public.signIn')}
        </Link>

        <Link
          to="/registration"
          className="
            rounded-full
            bg-[#635FC7]
            px-5
            py-2.5
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-[#635FC7]/20
            transition
            hover:bg-[#514db0]
            focus:outline-none
            focus:ring-2
            focus:ring-[#635FC7]
            focus:ring-offset-2
            focus:ring-offset-white
            dark:focus:ring-offset-[#0d1017]
          "
        >
          {t('public.getStarted')}
        </Link>
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        aria-label={
          isOpen
            ? t('public.closeMenu')
            : t('public.openMenu')
        }
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="
          rounded-xl
          p-2
          text-slate-700
          transition
          hover:bg-slate-100
          focus:outline-none
          focus:ring-2
          focus:ring-[#635FC7]
          dark:text-slate-200
          dark:hover:bg-white/10
          md:hidden
        "
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>

      {/* MOBILE MENU */}
      {isOpen && (
        <div
          className={`
            absolute
            left-0
            right-0
            top-[calc(100%+0.5rem)]
            rounded-2xl
            border
            p-3
            shadow-xl
            backdrop-blur-2xl
            ${
              isScrolled
                ? `
                  border-white/30
                  bg-white/70
                  dark:border-white/10
                  dark:bg-[#171a24]/80
                `
                : `
                  border-slate-200
                  bg-white
                  dark:border-white/10
                  dark:bg-[#171a24]
                `
            }
            md:hidden
          `}
        >
          <div
            className="
              flex
              flex-col
              gap-1
              text-sm
              font-medium
              text-slate-600
              dark:text-slate-200
            "
          >
            <Link
              onClick={handleHomeClick}
              className="
                rounded-xl
                px-4
                py-3
                hover:bg-slate-100
                dark:hover:bg-white/10
              "
              to="/"
            >
              {t('public.home')}
            </Link>

            <a
              onClick={(event) =>
                handleSectionClick(event, 'features')
              }
              className="
                rounded-xl
                px-4
                py-3
                hover:bg-slate-100
                dark:hover:bg-white/10
              "
              href="/#features"
            >
              {t('public.features')}
            </a>

            <a
              onClick={(event) =>
                handleSectionClick(event, 'about')
              }
              className="
                rounded-xl
                px-4
                py-3
                hover:bg-slate-100
                dark:hover:bg-white/10
              "
              href="/#about"
            >
              {t('public.about')}
            </a>

            <div
              className="
                mt-2
                flex
                gap-2
                border-t
                border-slate-200
                pt-3
                dark:border-white/10
              "
            >
              <Link
                onClick={closeMenu}
                className="
                  flex-1
                  rounded-xl
                  px-4
                  py-3
                  text-center
                  hover:bg-slate-100
                  dark:hover:bg-white/10
                "
                to="/login"
              >
                {t('public.signIn')}
              </Link>

              <Link
                onClick={closeMenu}
                className="
                  flex-1
                  rounded-xl
                  bg-[#635FC7]
                  px-4
                  py-3
                  text-center
                  font-bold
                  text-white
                "
                to="/registration"
              >
                {t('public.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}