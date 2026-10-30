import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Shield,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import API from '../api/axios';
import { AnalyticsSection, type AnalyticsData } from '../components/admin/AnalyticsCharts';

type AuthState = 'loading' | 'setup' | 'verify' | 'dashboard' | 'denied';
type Section = 'overview' | 'users' | 'workspaces' | 'boards' | 'activity' | 'security';

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  system_role: string;
  email_verified: boolean;
  is_active?: boolean;
  totp_enabled: boolean;
  created_at: string;
}

interface Stats {
  users: number;
  workspaces: number;
  boards: number;
  tasks: number;
}

interface Health {
  database: string;
  checkedAt?: string;
}

interface ActivityItem {
  id?: number;
  action?: string;
  actor_email?: string;
  target_type?: string;
  target_id?: number;
  created_at?: string;
}

const errorMessage = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong.';

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard; description: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Platform pulse' },
  { id: 'users', label: 'Users', icon: Users, description: 'Manage accounts' },
  { id: 'workspaces', label: 'Workspaces', icon: BriefcaseBusiness, description: 'Workspace inventory' },
  { id: 'boards', label: 'Boards', icon: BarChart3, description: 'Board inventory' },
  { id: 'activity', label: 'Activity', icon: Activity, description: 'Admin audit trail' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Access controls' },
];

export default function Admin() {
  const [authState, setAuthState] = useState<AuthState>(() => localStorage.getItem('adminToken') ? 'dashboard' : 'loading');
  const [challengeToken, setChallengeToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [section, setSection] = useState<Section>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [workspaces, setWorkspaces] = useState<Record<string, unknown>[]>([]);
  const [boards, setBoards] = useState<Record<string, unknown>[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [security, setSecurity] = useState<{ twoFactorEnabled: boolean; lockedUntil: string | null } | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingSection, setLoadingSection] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState('30');
  const [analyticsInterval, setAnalyticsInterval] = useState<'day' | 'week' | 'month'>('day');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('adminToken')) return;
    API.post('/api/admin/auth/start')
      .then(({ data }) => {
        if (data.setupRequired) setAuthState('setup');
        else {
          setChallengeToken(data.challengeToken);
          setAuthState('verify');
        }
      })
      .catch((error) => {
        setMessage(errorMessage(error));
        setAuthState('denied');
      });
  }, []);

  useEffect(() => {
    if (authState !== 'dashboard') return;
    const load = async () => {
      setLoadingDashboard(true);
      try {
        const [overview, securityResponse, healthResponse, activityResponse] = await Promise.all([
          API.get<Stats>('/api/admin/overview'),
          API.get<{ twoFactorEnabled: boolean; lockedUntil: string | null }>('/api/admin/security'),
          API.get<Health>('/api/admin/health'),
          API.get<ActivityItem[]>('/api/admin/activity'),
        ]);
        setStats(overview.data);
        setSecurity(securityResponse.data);
        setHealth(healthResponse.data);
        setActivity(activityResponse.data);
      } catch (error) {
        setMessage(errorMessage(error));
        if ((error as { response?: { status?: number } })?.response?.status === 401) {
          localStorage.removeItem('adminToken');
          setAuthState('verify');
        }
      } finally {
        setLoadingDashboard(false);
      }
    };
    void load();
  }, [authState]);

  const loadAnalytics = async (rangeDays: string, interval: 'day' | 'week' | 'month') => {
    setLoadingAnalytics(true);
    try {
      const end = new Date();
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - Number(rangeDays) + 1);
      const format = (date: Date) => date.toISOString().slice(0, 10);
      const { data } = await API.get<AnalyticsData>('/api/admin/analytics', {
        params: { from: format(start), to: format(end), interval },
      });
      setAnalytics(data);
    } catch (error) {
      setMessage(errorMessage(error));
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (authState !== 'dashboard') return;
    const request = window.setTimeout(() => {
      void loadAnalytics(analyticsRange, analyticsInterval);
    }, 0);
    return () => window.clearTimeout(request);
  }, [authState, analyticsRange, analyticsInterval]);

  useEffect(() => {
    if (authState !== 'dashboard' || section === 'overview' || section === 'security') return;
    const endpoints: Record<string, string> = {
      users: '/api/admin/users',
      workspaces: '/api/admin/workspaces',
      boards: '/api/admin/boards',
      activity: '/api/admin/activity',
    };
    API.get<Record<string, unknown>[]>(endpoints[section])
      .then(({ data }) => {
        if (section === 'users') setUsers(data as AdminUser[]);
        if (section === 'workspaces') setWorkspaces(data);
        if (section === 'boards') setBoards(data);
        if (section === 'activity') setActivity(data as ActivityItem[]);
      })
      .catch((error) => setMessage(errorMessage(error)))
      .finally(() => setLoadingSection(false));
  }, [authState, section]);

  const startSetup = async () => {
    try {
      const { data } = await API.post<{ qrCode: string }>('/api/admin/auth/setup');
      setQrCode(data.qrCode);
      setMessage('');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const completeSetup = async () => {
    try {
      const { data } = await API.post<{ recoveryCodes: string[] }>('/api/admin/auth/setup/complete', { code });
      setRecoveryCodes(data.recoveryCodes);
      setCode('');
      setMessage('Save these recovery codes securely. They will not be shown again.');
      setAuthState('verify');
      const start = await API.post('/api/admin/auth/start');
      setChallengeToken(start.data.challengeToken);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const verify = async () => {
    try {
      const { data } = await API.post<{ token: string }>('/api/admin/auth/verify', {
        challenge_token: challengeToken,
        code: recoveryCode ? undefined : code,
        recovery_code: recoveryCode || undefined,
      });
      localStorage.setItem('adminToken', data.token);
      setRecoveryCode('');
      setCode('');
      setAuthState('dashboard');
      setMessage('');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await API.post('/api/admin/auth/logout');
    } finally {
      localStorage.removeItem('adminToken');
      setAuthState('verify');
      setMessage('');
      API.post('/api/admin/auth/start').then(({ data }) => setChallengeToken(data.challengeToken)).catch(() => undefined);
    }
  };

  const selectSection = (nextSection: Section) => {
    setSection(nextSection);
    setLoadingSection(nextSection !== 'overview' && nextSection !== 'security');
    setMobileNavOpen(false);
    setMessage('');
  };

  if (authState === 'denied') return <StatusScreen title="Access denied" message={message || 'You do not have administrator access.'} />;
  if (authState === 'loading') return <StatusScreen title="Securing your session" message="Loading admin security..." loading />;
  if (authState === 'setup') return (
    <AdminShell title="Secure your admin account">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/20 sm:p-10">
        <AuthIntro icon={ShieldCheck} eyebrow="First-time setup" title="Enable authenticator 2FA" description="Protect the control center with a time-based code from Google Authenticator or Microsoft Authenticator." />
        {!qrCode ? (
          <button onClick={startSetup} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto">
            Generate secure QR code <ChevronRight size={17} />
          </button>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
            <img src={qrCode} alt="Authenticator enrollment QR code" className="w-48 rounded-2xl bg-white p-3 shadow-xl" />
            <div>
              <p className="text-sm leading-6 text-slate-400">Scan the QR code, then confirm the six-digit code generated by your authenticator app.</p>
              <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" maxLength={6} placeholder="6-digit code" className="mt-5 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400" />
              <button onClick={completeSetup} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Confirm and enable 2FA <ChevronRight size={17} /></button>
            </div>
          </div>
        )}
        {message && <Message text={message} />}
      </div>
    </AdminShell>
  );
  if (authState === 'verify') return (
    <AdminShell title="Admin verification">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/20 sm:p-10">
        <AuthIntro icon={ShieldCheck} eyebrow="Private access" title="Verify your identity" description="Enter the current code from your authenticator app, or use one recovery code." />
        <div className="mt-8 space-y-3">
          <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" maxLength={6} placeholder="Authenticator code" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400" />
          <input value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} placeholder="Recovery code (optional)" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400" />
          <button onClick={verify} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Enter Admin Panel <ChevronRight size={17} /></button>
        </div>
        {recoveryCodes.length > 0 && <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200">Recovery codes: {recoveryCodes.join(', ')}</div>}
        {message && <Message text={message} />}
      </div>
    </AdminShell>
  );

  if (authState !== 'dashboard') return <Navigate to="/login" replace />;
  const currentNav = navItems.find((item) => item.id === section) ?? navItems[0];
  const formattedDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  const cards = [
    { label: 'Total users', value: stats?.users, icon: Users, tone: 'cyan', hint: 'All registered accounts' },
    { label: 'Workspaces', value: stats?.workspaces, icon: BriefcaseBusiness, tone: 'blue', hint: 'Personal and shared' },
    { label: 'Boards', value: stats?.boards, icon: LayoutDashboard, tone: 'violet', hint: 'Across the platform' },
    { label: 'Tasks', value: stats?.tasks, icon: CheckCircle2, tone: 'emerald', hint: 'Tracked work items' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#070d1b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      </div>
      <AnimatePresence>
        {mobileNavOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden" />}
      </AnimatePresence>
      <AdminSidebar section={section} onSelect={selectSection} onLogout={logout} mobileOpen={mobileNavOpen} />
      <main className="relative min-h-screen md:ml-72">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070d1b]/85 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => setMobileNavOpen(true)} className="rounded-xl border border-white/10 p-2 text-slate-300 md:hidden"><Menu size={20} /></button>
            <div className="min-w-0">
              <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-cyan-300 sm:block">Private system administration</p>
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{currentNav.label}</h1>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> Systems operational</div>
              <button onClick={logout} className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white" title="Sign out"><LogOut size={17} /></button>
            </div>
          </div>
        </header>
        <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          {message && <Message text={message} />}
          {section === 'overview' && (
            <div className="space-y-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><p className="text-sm text-slate-400">{formattedDate}</p><h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, Admin.</h2><p className="mt-2 text-sm text-slate-400">Here is what is happening across your platform today.</p></div>
                <button onClick={() => window.location.reload()} className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/40 hover:text-white"><RefreshCw size={15} /> Refresh data</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card, index) => <MetricCard key={card.label} {...card} index={index} loading={loadingDashboard} />)}
              </div>
              <AnalyticsSection
                analytics={analytics}
                loading={loadingAnalytics}
                range={analyticsRange}
                interval={analyticsInterval}
                onRangeChange={setAnalyticsRange}
                onIntervalChange={setAnalyticsInterval}
              />
              <HealthPanel health={health} security={security} loading={loadingDashboard} />
              <ActivityFeed activity={activity.slice(0, 6)} loading={loadingDashboard} onViewAll={() => selectSection('activity')} />
            </div>
          )}
          {section === 'security' && <SecurityPanel security={security} />}
          {section === 'users' && <SectionPanel title="Users" description="Review registered accounts and administrator status." loading={loadingSection}><DataTable columns={['ID', 'Name', 'Email', 'Role', '2FA']} rows={users.map((user) => [user.id, user.full_name, user.email, user.system_role, user.totp_enabled ? 'Enabled' : 'Not set'])} empty="No users found." /></SectionPanel>}
          {section === 'workspaces' && <SectionPanel title="Workspaces" description="Monitor personal and shared workspace inventory." loading={loadingSection}><DataTable columns={['ID', 'Name', 'Type', 'Owner', 'Members']} rows={workspaces.map((item) => [item.id, item.name, item.type, item.owner_email, item.member_count])} empty="No workspaces found." /></SectionPanel>}
          {section === 'boards' && <SectionPanel title="Boards" description="Browse boards across every workspace." loading={loadingSection}><DataTable columns={['ID', 'Title', 'Workspace', 'Columns']} rows={boards.map((item) => [item.id, item.title, item.workspace_name || 'Personal', item.column_count])} empty="No boards found." /></SectionPanel>}
          {section === 'activity' && <SectionPanel title="Administrative activity" description="A security-focused audit trail of recent admin actions." loading={loadingSection}><DataTable columns={['Action', 'Actor', 'Target', 'Time']} rows={activity.map((item) => [item.action, item.actor_email, `${item.target_type || ''} ${item.target_id || ''}`, formatDate(item.created_at)])} empty="No administrative activity recorded." /></SectionPanel>}
        </div>
      </main>
    </div>
  );
}

function AdminSidebar({ section, onSelect, onLogout, mobileOpen }: { section: Section; onSelect: (section: Section) => void; onLogout: () => void; mobileOpen: boolean }) {
  return <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/[0.07] bg-[#0b1325] px-5 py-6 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-300"><Shield size={20} /></div><div><p className="font-semibold tracking-tight">Control Center</p><p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Super Admin</p></div></div><button onClick={() => onSelect(section)} className="rounded-lg p-2 text-slate-500 hover:text-white md:hidden"><X size={18} /></button></div>
    <div className="mt-10"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p><nav className="space-y-1.5">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => onSelect(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${section === item.id ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}><Icon size={18} /><span className="flex-1"><span className="block text-sm font-medium">{item.label}</span><span className={`mt-0.5 block text-[11px] ${section === item.id ? 'text-slate-700' : 'text-slate-600 group-hover:text-slate-500'}`}>{item.description}</span></span>{section === item.id && <ChevronRight size={15} />}</button>; })}</nav></div>
    <div className="absolute bottom-6 left-5 right-5 border-t border-white/[0.07] pt-5"><div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-bold text-cyan-300">SA</div><div className="min-w-0"><p className="truncate text-sm font-medium">Super Admin</p><p className="text-xs text-slate-500">Secure session</p></div></div><button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.06] hover:text-white"><LogOut size={16} /> Sign out</button></div>
  </aside>;
}

function MetricCard({ label, value, icon: Icon, tone, hint, index, loading }: { label: string; value?: number; icon: typeof Users; tone: 'cyan' | 'blue' | 'violet' | 'emerald'; hint: string; index: number; loading: boolean }) {
  const colors = { cyan: 'bg-cyan-400/10 text-cyan-300', blue: 'bg-blue-400/10 text-blue-300', violet: 'bg-violet-400/10 text-violet-300', emerald: 'bg-emerald-400/10 text-emerald-300' };
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-white/[0.14]"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{loading ? <span className="inline-block h-9 w-20 animate-pulse rounded-lg bg-white/10" /> : (value ?? '-').toLocaleString()}</p></div><div className={`rounded-xl p-3 ${colors[tone]}`}><Icon size={19} /></div></div><p className="mt-5 text-xs text-slate-500">{hint}</p></motion.div>;
}

function HealthPanel({ health, security, loading }: { health: Health | null; security: { twoFactorEnabled: boolean } | null; loading: boolean }) {
  const databaseOk = health?.database === 'ok';
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-xl shadow-black/10 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">System health</p><p className="mt-1 text-xs text-slate-500">Live operational status</p></div><Database size={19} className="text-emerald-300" /></div><div className="mt-6 space-y-3"><StatusRow label="Database" value={loading ? 'Checking' : databaseOk ? 'Operational' : 'Unavailable'} ok={!loading && databaseOk} loading={loading} /><StatusRow label="Admin authentication" value={security?.twoFactorEnabled ? 'Protected' : 'Action needed'} ok={Boolean(security?.twoFactorEnabled)} loading={loading} /></div>{health?.checkedAt && <p className="mt-5 text-[11px] text-slate-600">Checked {formatDate(health.checkedAt)}</p>}</div>;
}

function StatusRow({ label, value, ok, loading }: { label: string; value: string; ok: boolean; loading?: boolean }) {
  return <div className="flex items-center justify-between rounded-xl bg-slate-950/40 px-3.5 py-3"><span className="text-sm text-slate-300">{label}</span>{loading ? <span className="h-4 w-20 animate-pulse rounded bg-white/10" /> : <span className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-300' : 'text-amber-300'}`}><span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />{value}</span>}</div>;
}

function ActivityFeed({ activity, loading, onViewAll }: { activity: ActivityItem[]; loading: boolean; onViewAll: () => void }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-xl shadow-black/10 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Recent activity</p><p className="mt-1 text-xs text-slate-500">Latest administrative events</p></div><button onClick={onViewAll} className="flex items-center gap-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200">View all <ExternalLink size={13} /></button></div>{loading ? <div className="mt-6 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-white/5" />)}</div> : activity.length === 0 ? <EmptyState icon={Activity} text="No administrative activity recorded yet." /> : <div className="mt-5 grid gap-2 lg:grid-cols-2">{activity.map((item, index) => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }} key={item.id ?? `${item.action}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-950/35 px-3.5 py-3"><div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-300"><Activity size={15} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm text-slate-200">{item.action || 'Administrative action'}</p><p className="truncate text-xs text-slate-500">{item.actor_email || 'System'}{item.target_type ? ` · ${item.target_type} ${item.target_id ?? ''}` : ''}</p></div><span className="shrink-0 text-[11px] text-slate-600">{relativeTime(item.created_at)}</span></motion.div>)}</div>}</div>;
}

function SecurityPanel({ security }: { security: { twoFactorEnabled: boolean; lockedUntil: string | null } | null }) {
  return <SectionPanel title="Security settings" description="Review the protection status of your administrator account."><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5"><ShieldCheck className="text-emerald-300" size={22} /><p className="mt-5 text-sm text-slate-300">Two-factor authentication</p><p className="mt-1 text-xl font-semibold text-emerald-300">{security?.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p><p className="mt-2 text-xs leading-5 text-slate-500">Authenticator verification is required before admin access is granted.</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5"><Shield className="text-cyan-300" size={22} /><p className="mt-5 text-sm text-slate-300">Session policy</p><p className="mt-1 text-xl font-semibold">15 minute expiry</p><p className="mt-2 text-xs leading-5 text-slate-500">Sessions are server-revocable and invalidated when account access changes.</p></div></div>{security?.lockedUntil && <Message text={`Verification is temporarily locked until ${formatDate(security.lockedUntil)}.`} />}</SectionPanel>;
}

function SectionPanel({ title, description, loading, children }: { title: string; description: string; loading?: boolean; children: React.ReactNode }) {
  return <div><div className="mb-6"><p className="text-3xl font-semibold tracking-tight">{title}</p><p className="mt-2 text-sm text-slate-400">{description}</p></div>{loading ? <div className="h-64 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.035]" /> : children}</div>;
}

function DataTable({ columns, rows, empty }: { columns: string[]; rows: unknown[][]; empty: string }) {
  if (!rows.length) return <EmptyState icon={Database} text={empty} />;
  return <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.035]"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-500"><tr>{columns.map((column) => <th key={column} className="px-5 py-4 font-medium">{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-b border-white/[0.05] transition last:border-0 hover:bg-white/[0.025]">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-4 text-slate-300">{String(cell ?? '-')}</td>)}</tr>)}</tbody></table></div>;
}

function EmptyState({ icon: Icon, text }: { icon: typeof Database; text: string }) {
  return <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-center text-sm text-slate-500"><Icon size={20} className="text-slate-600" /><p>{text}</p></div>;
}

function AuthIntro({ icon: Icon, eyebrow, title, description }: { icon: typeof Shield; eyebrow: string; title: string; description: string }) {
  return <div><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Icon size={24} /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></div>;
}

function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="min-h-screen w-full bg-[#070d1b] p-5 text-white sm:p-10"><div className="mx-auto mb-8 flex max-w-5xl items-center gap-3 text-sm text-slate-300"><div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300"><Shield size={18} /></div><span className="font-semibold">{title}</span></div>{children}</div>;
}

function StatusScreen({ title, message, loading }: { title: string; message: string; loading?: boolean }) {
  return <div className="flex min-h-screen items-center justify-center bg-[#070d1b] p-6 text-white"><div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">{loading ? <RefreshCw className="animate-spin" size={22} /> : <Shield size={22} />}</div><h1 className="mt-5 text-xl font-semibold">{title}</h1><p className="mt-2 text-sm text-slate-400">{message}</p></div></div>;
}

function Message({ text }: { text: string }) {
  return <p className="mt-5 rounded-xl border border-amber-300/15 bg-amber-400/10 p-3 text-sm leading-5 text-amber-200">{text}</p>;
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function relativeTime(value?: string) {
  if (!value) return '-';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '-';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
