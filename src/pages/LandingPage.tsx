import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  MoveRight,
  Sparkles,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicFooter } from '../components/public/PublicFooter';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { KanbanPreview } from '../components/public/KanbanPreview';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const revealFromBelow = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const MotionLink = motion(Link);

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Layers3,
      title: t('public.organizeTasks'),
      text: t('public.organizeTasksText'),
    },
    {
      icon: Target,
      title: t('public.manageProjects'),
      text: t('public.manageProjectsText'),
    },
    {
      icon: MoveRight,
      title: t('public.simpleWorkflow'),
      text: t('public.simpleWorkflowText'),
    },
    {
      icon: Sparkles,
      title: t('public.fastFocused'),
      text: t('public.fastFocusedText'),
    },
  ];

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const link = target.closest('a[href^="#"]') as HTMLAnchorElement | null;

      if (!link) return;

      const href = link.getAttribute('href');

      if (!href || href === '#') return;

      const element = document.querySelector(href);

      if (!element) return;

      event.preventDefault();

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      window.history.pushState(null, '', href);
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-hidden
        bg-[#f7f8fc]
        text-slate-900
        dark:bg-[#0d1017]
        dark:text-white
      "
    >
      <PublicNavbar />

      <main id="home">
        {/* HERO / HOME */}
        <section
          id="about"
          className="
            relative
            mx-auto
            grid
            w-full
            max-w-7xl
            items-center
            gap-14
            px-5
            pb-20
            pt-16
            sm:px-8
            sm:pt-24
            lg:grid-cols-[0.92fr_1.08fr]
            lg:px-10
            lg:pb-28
            lg:pt-28
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -left-24
              top-8
              h-72
              w-72
              rounded-full
              bg-[#635FC7]/15
              blur-3xl
            "
          />

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: false,
              amount: 0.25,
            }}
            variants={revealFromBelow}
            transition={{
              duration: 0.45,
              ease: 'easeOut',
            }}
          >
            <h1
              className="
                max-w-2xl
                text-5xl
                font-bold
                leading-[1.05]
                tracking-[-0.045em]
                text-slate-950
                dark:text-white
                sm:text-6xl
                lg:text-7xl
              "
            >
              {t('public.heroTitle')}

              <span
                className="
                  block
                  text-[#635FC7]
                "
              >
                {t('public.heroAccent')}
              </span>
            </h1>

            <p
              className="
                mt-7
                max-w-xl
                text-base
                leading-7
                text-slate-500
                dark:text-slate-400
                sm:text-lg
              "
            >
              {t('public.heroText')}
            </p>

            <div
              className="
                mt-9
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <MotionLink
                to="/registration"
                whileHover={{
                  y: -2,
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#635FC7]
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-xl
                  shadow-[#635FC7]/20
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#514db0]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#635FC7]
                  focus:ring-offset-2
                  dark:focus:ring-offset-[#0d1017]
                "
              >
                {t('public.getStarted')}

                <ArrowRight size={17} />
              </MotionLink>

              <MotionLink
                to="/login"
                whileHover={{
                  y: -2,
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:border-[#635FC7]/40
                  hover:text-[#635FC7]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#635FC7]
                  dark:border-white/10
                  dark:bg-white/5
                  dark:text-slate-200
                "
              >
                {t('public.signIn')}
              </MotionLink>
            </div>

            <div
              className="
                mt-8
                flex
                flex-wrap
                gap-x-5
                gap-y-2
                text-xs
                font-medium
                text-slate-500
                dark:text-slate-400
              "
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                "
              >
                <CheckCircle2
                  size={15}
                  className="text-[#67C28B]"
                />

                {t('public.visualWorkflow')}
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                "
              >
                <CheckCircle2
                  size={15}
                  className="text-[#67C28B]"
                />

                {t('public.builtForFocus')}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: false,
              amount: 0.2,
            }}
            variants={revealFromBelow}
            transition={{
              duration: 0.55,
              delay: 0.08,
              ease: 'easeOut',
            }}
          >
            <div
              className="
                absolute
                -inset-5
                rounded-[38px]
                bg-linear-to-br
                from-[#635FC7]/20
                via-transparent
                to-[#49A5D8]/15
                blur-2xl
              "
            />

            <KanbanPreview />
          </motion.div>
        </section>

        {/* FEATURES */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: false,
            amount: 0.15,
          }}
          variants={revealFromBelow}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="
            border-y
            border-slate-200/80
            bg-white/60
            px-5
            py-20
            dark:border-white/10
            dark:bg-white/2
            sm:px-8
            lg:px-10
          "
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-[#635FC7]
                "
              >
                {t('public.whyKanban')}
              </p>

              <h2
                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-tight
                  sm:text-4xl
                "
              >
                {t('public.featuresTitle')}
              </h2>
            </div>

            <div
              className="
                mt-10
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {features.map(
                ({ icon: Icon, title, text }, index) => (
                  <motion.article
                    key={title}
                    initial={{
                      opacity: 0,
                      y: 16,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    whileHover={{
                      y: -4,
                      scale: 1.01,
                    }}
                    viewport={{
                      once: false,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.08,
                      ease: 'easeOut',
                    }}
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-6
                      shadow-sm
                      dark:border-white/10
                      dark:bg-[#171a24]
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#635FC7]/10
                        text-[#635FC7]
                      "
                    >
                      <Icon size={21} />
                    </div>

                    <h3
                      className="
                        mt-5
                        text-base
                        font-bold
                      "
                    >
                      {title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {text}
                    </p>
                  </motion.article>
                ),
              )}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: false,
            amount: 0.25,
          }}
          variants={revealFromBelow}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="
            mx-5
            mb-16
            rounded-3xl
            bg-[#635FC7]
            px-6
            py-14
            text-center
            text-white
            shadow-2xl
            shadow-[#635FC7]/20
            sm:mx-8
            sm:px-10
            lg:mx-auto
            lg:max-w-7xl
          "
        >
          <h2
            className="
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            "
          >
            {t('public.readyTitle')}
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-lg
              text-sm
              leading-6
              text-indigo-100
            "
          >
            {t('public.readyText')}
          </p>

          <MotionLink
            to="/registration"
            whileHover={{
              y: -2,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-white
              px-6
              py-3.5
              text-sm
              font-bold
              text-[#635FC7]
              transition
              hover:bg-indigo-50
              focus:outline-none
              focus:ring-2
              focus:ring-white
              focus:ring-offset-2
              focus:ring-offset-[#635FC7]
            "
          >
            {t('public.getStarted')}

            <ArrowRight size={17} />
          </MotionLink>
        </motion.section>
      </main>

      <PublicFooter />
    </div>
  );
}