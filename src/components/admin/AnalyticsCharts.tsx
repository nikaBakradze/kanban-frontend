import { BarChart3, CheckCircle2, Database, Users } from 'lucide-react';

export interface AnalyticsSeriesPoint {
  period: string;
  count: number;
}

export interface AnalyticsData {
  range: { from: string; to: string; interval: 'day' | 'week' | 'month'; timezone: 'UTC' };
  summary: { users: number; workspaces: number; boards: number; tasks: number };
  users: {
    newToday: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    growth: AnalyticsSeriesPoint[];
  };
  workspaces: {
    byType: { type: string; count: number }[];
    growth: AnalyticsSeriesPoint[];
    averageMembers: number;
  };
  boards: {
    personal: number;
    workspace: number;
    growth: AnalyticsSeriesPoint[];
  };
  tasks: {
    growth: AnalyticsSeriesPoint[];
    subtasks: { total: number; completed: number; incomplete: number; completionRate: number };
  };
  adminActivity: {
    growth: AnalyticsSeriesPoint[];
    byAction: { action: string; count: number }[];
  };
}

type Interval = 'day' | 'week' | 'month';

export function AnalyticsSection({
  analytics,
  loading,
  range,
  interval,
  onRangeChange,
  onIntervalChange,
}: {
  analytics: AnalyticsData | null;
  loading: boolean;
  range: string;
  interval: Interval;
  onRangeChange: (range: string) => void;
  onIntervalChange: (interval: Interval) => void;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xl font-semibold tracking-tight">Analytics</p>
          <p className="mt-1 text-sm text-slate-400">Real platform aggregates, grouped in UTC.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Analytics date controls">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1">
            {[['7', '7 Days'], ['30', '30 Days'], ['90', '90 Days'], ['365', '12 Months']].map(([value, label]) => (
              <button key={value} onClick={() => onRangeChange(value)} className={`rounded-lg px-2.5 py-1.5 text-xs transition sm:px-3 ${range === value ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{label}</button>
            ))}
          </div>
          <label className="sr-only" htmlFor="analytics-interval">Analytics interval</label>
          <select id="analytics-interval" value={interval} onChange={(event) => onIntervalChange(event.target.value as Interval)} className="rounded-xl border border-white/10 bg-[#0b1325] px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>
      {loading ? <AnalyticsLoading /> : !analytics ? <AnalyticsEmpty text="Analytics could not be loaded." /> : (
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="User registrations" subtitle="New accounts created in the selected range" icon={Users}><TrendChart data={analytics.users.growth} color="#67e8f9" /></ChartCard>
          <ChartCard title="Workspace distribution" subtitle={`Average ${analytics.workspaces.averageMembers.toLocaleString()} members per workspace`} icon={Database}><DistributionChart data={analytics.workspaces.byType.map((item) => ({ label: item.type, count: item.count }))} colors={['#67e8f9', '#60a5fa', '#a78bfa']} /></ChartCard>
          <ChartCard title="Board creation" subtitle={`${analytics.boards.personal.toLocaleString()} personal · ${analytics.boards.workspace.toLocaleString()} workspace-associated`} icon={BarChart3}><TrendChart data={analytics.boards.growth} color="#a78bfa" /></ChartCard>
          <ChartCard title="Task and subtask analytics" subtitle="Task creation and subtask completion are tracked separately" icon={CheckCircle2}><div className="space-y-5"><TrendChart data={analytics.tasks.growth} color="#60a5fa" /><div className="grid grid-cols-3 gap-2"><Stat label="Subtasks" value={analytics.tasks.subtasks.total} /><Stat label="Completed" value={analytics.tasks.subtasks.completed} tone="emerald" /><Stat label="Incomplete" value={analytics.tasks.subtasks.incomplete} tone="amber" /></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${analytics.tasks.subtasks.completionRate}%` }} /></div><p className="text-xs text-slate-500">Subtask completion: {analytics.tasks.subtasks.completionRate.toLocaleString()}%</p></div></ChartCard>
          <ChartCard title="Admin Activity" subtitle="Administrative events only; not general platform activity" icon={BarChart3}><div className="space-y-5"><TrendChart data={analytics.adminActivity.growth} color="#34d399" /><DistributionChart data={analytics.adminActivity.byAction.map((item) => ({ label: item.action, count: item.count }))} colors={['#34d399', '#67e8f9', '#a78bfa', '#fbbf24']} /></div></ChartCard>
        </div>
      )}
    </section>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof Users; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-xl shadow-black/10 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div><div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300"><Icon size={18} /></div></div><div className="mt-6">{children}</div></div>;
}

function TrendChart({ data, color }: { data: AnalyticsSeriesPoint[]; color: string }) {
  if (!data.length) return <AnalyticsEmpty text="No events in this date range." />;
  const max = Math.max(...data.map((point) => point.count), 1);
  const points = data.map((point, index) => {
    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
    const y = 100 - (point.count / max) * 82 - 9;
    return `${x},${y}`;
  }).join(' ');
  return <div><div className="relative h-40 rounded-xl border border-white/[0.06] bg-slate-950/30 p-3"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Analytics trend chart"><line x1="0" y1="91" x2="100" y2="91" stroke="rgba(255,255,255,.08)" /><line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,.06)" strokeDasharray="2 3" /><polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="mt-2 flex justify-between gap-2 text-[10px] text-slate-600"><span>{data[0].period}</span><span>{data[data.length - 1].period}</span><span className="text-slate-500">{data.reduce((sum, item) => sum + item.count, 0).toLocaleString()} total</span></div></div>;
}

function DistributionChart({ data, colors }: { data: { label: string; count: number }[]; colors: string[] }) {
  if (!data.length) return <AnalyticsEmpty text="No distribution data available." />;
  const max = Math.max(...data.map((item) => item.count), 1);
  return <div className="space-y-3">{data.map((item, index) => <div key={item.label}><div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="truncate text-slate-400">{item.label}</span><span className="text-slate-200">{item.count.toLocaleString()}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full transition-all" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: colors[index % colors.length] }} /></div></div>)}</div>;
}

function Stat({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'emerald' | 'amber' }) {
  const text = { default: 'text-slate-200', emerald: 'text-emerald-300', amber: 'text-amber-300' }[tone];
  return <div className="rounded-xl bg-slate-950/40 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p><p className={`mt-1 text-lg font-semibold ${text}`}>{value.toLocaleString()}</p></div>;
}

function AnalyticsLoading() {
  return <div className="grid gap-6 xl:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.035]" />)}</div>;
}

function AnalyticsEmpty({ text }: { text: string }) {
  return <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-center text-sm text-slate-500"><BarChart3 size={20} className="text-slate-600" /><p>{text}</p></div>;
}
