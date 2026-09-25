import { motion } from 'framer-motion';
import { Check, Circle, Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function KanbanPreview() {
  const { t } = useTranslation();
  const columns = [
    { title: t('public.todo'), color: 'bg-[#635FC7]', icon: Circle, tasks: [t('public.designLanding'), t('public.planSprint')] },
    { title: t('public.inProgress'), color: 'bg-[#49A5D8]', icon: Clock3, tasks: [t('public.buildAuth'), t('public.fixLayout')] },
    { title: t('public.done'), color: 'bg-[#67C28B]', icon: Check, tasks: [t('public.deployProject'), t('public.setupWorkspace')] },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}

      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.65, delay: 0.15 }}
      className="relative rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_30px_90px_rgba(69,62,160,0.18)] dark:border-white/10 dark:bg-[#171a24]/90"
    >
      <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#635FC7]" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">Your Board Name</span>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-white/10">{t('public.myBoard')}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {columns.map(({ title, color, icon: Icon, tasks }, columnIndex) => (
          <div key={title} className="rounded-2xl bg-slate-50 p-3 dark:bg-[#20232f]">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              {title}
            </div>
            <div className="space-y-2">
              {tasks.map((task, taskIndex) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  whileHover={{ y: -2 }}
                  transition={{ delay: 0.45 + columnIndex * 0.12 + taskIndex * 0.08 }}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-[#2b2d39]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Icon size={13} className="text-slate-400" />
                    <span className="text-[9px] text-slate-400">#{taskIndex + 1}</span>
                  </div>
                  <p className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">{task}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
