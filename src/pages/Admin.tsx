import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Building2, Users, Globe2, CreditCard,
  Newspaper, Star, ShieldAlert, Ticket, Bot, BarChart3,
  UserCog, Crown, Loader2, TrendingUp, DollarSign, AlertTriangle,
  CheckCircle2, Clock, XCircle, Search, Plus, Trash2,
  MapPin, Smartphone,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'revenue' | 'locations' | 'jobs' | 'employers' | 'applicants' | 'agents' | 'countries' | 'payments' | 'subscriptions' | 'news' | 'stories' | 'reviews' | 'analytics' | 'fraud' | 'roles' | 'tickets' | 'ai' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'revenue', label: 'Revenue & Commission', icon: DollarSign },
  { id: 'locations', label: 'User Locations', icon: MapPin },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'employers', label: 'Employers', icon: Building2 },
  { id: 'applicants', label: 'Applicants', icon: Users },
  { id: 'agents', label: 'Agents', icon: UserCog },
  { id: 'countries', label: 'Countries', icon: Globe2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'subscriptions', label: 'Premium Plans', icon: Crown },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'stories', label: 'Success Stories', icon: Star },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert },
  { id: 'roles', label: 'User Roles', icon: UserCog },
  { id: 'tickets', label: 'Support Tickets', icon: Ticket },
  { id: 'ai', label: 'AI Settings', icon: Bot },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 lg:pt-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 lg:sticky lg:top-24">
              <div className="mb-3 px-2">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">GlobalHire Africa</p>
              </div>
              <nav className="space-y-0.5 max-h-[70vh] overflow-y-auto">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        tab === t.id
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {tab === 'overview' && <OverviewTab />}
                {tab === 'revenue' && <RevenueTab />}
                {tab === 'locations' && <UserLocationsTab />}
                {tab === 'jobs' && <JobsTab />}
                {tab === 'employers' && <EmployersTab />}
                {tab === 'applicants' && <ApplicantsTab />}
                {tab === 'agents' && <AgentsTab />}
                {tab === 'countries' && <CountriesTab />}
                {tab === 'payments' && <PaymentsTab />}
                {tab === 'subscriptions' && <SubscriptionsTab />}
                {tab === 'news' && <NewsTab />}
                {tab === 'stories' && <StoriesTab />}
                {tab === 'reviews' && <ReviewsTab />}
                {tab === 'analytics' && <AnalyticsTab />}
                {tab === 'fraud' && <FraudTab />}
                {tab === 'roles' && <RolesTab />}
                {tab === 'tickets' && <TicketsTab />}
                {tab === 'ai' && <AITab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ OVERVIEW ============ */
function OverviewTab() {
  const [stats, setStats] = useState({ jobs: 0, employers: 0, applications: 0, revenue: 0, tickets: 0, fraud: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('payment_transactions').select('amount').eq('status', 'completed'),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('fraud_alerts').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]).then(([j, e, a, p, t, f]) => {
      const revenue = (p.data || []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0);
      setStats({ jobs: j.count || 0, employers: e.count || 0, applications: a.count || 0, revenue, tickets: t.count || 0, fraud: f.count || 0 });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Total Jobs', value: stats.jobs, icon: Briefcase, color: 'from-brand-500 to-brand-700' },
    { label: 'Employers', value: stats.employers, icon: Building2, color: 'from-blue-500 to-cyan-600' },
    { label: 'Applications', value: stats.applications, icon: Users, color: 'from-green-500 to-emerald-600' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: 'from-amber-500 to-orange-600' },
    { label: 'Open Tickets', value: stats.tickets, icon: Ticket, color: 'from-purple-500 to-indigo-600' },
    { label: 'Fraud Alerts', value: stats.fraud, icon: ShieldAlert, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{c.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ JOBS ============ */
function JobsTab() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleStatus = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status: status === 'active' ? 'paused' : 'active' }).eq('id', id);
    fetch();
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    await supabase.from('jobs').delete().eq('id', id);
    fetch();
  };

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Jobs ({jobs.length})</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"><Plus className="w-4 h-4" /> Add Job</button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search jobs..." />
      <div className="space-y-2">
        {filtered.map((job) => (
          <div key={job.id} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">{job.logo}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{job.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{job.company} • {job.city}, {job.country} {job.flag}</div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${job.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'}`}>{job.status}</span>
            <button onClick={() => toggleStatus(job.id, job.status)} className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Clock className="w-4 h-4" /></button>
            <button onClick={() => deleteJob(job.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ EMPLOYERS ============ */
function EmployersTab() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('employers').select('*').order('rating', { ascending: false }).then(({ data }) => {
      setEmployers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Employers ({employers.length})</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"><Plus className="w-4 h-4" /> Add Employer</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {employers.map((emp) => (
          <div key={emp.id} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold">{emp.logo}</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1">{emp.name} {emp.verified && <CheckCircle2 className="w-4 h-4 text-brand-500" />}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{emp.country} {emp.flag} • {emp.open_roles} open roles</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /> {emp.rating}</span>
              <span className="text-slate-500 dark:text-slate-400">{emp.hiring_history} hires</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ APPLICANTS ============ */
function ApplicantsTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProfiles(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Applicants ({profiles.length})</h2>
      {profiles.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" subtitle="Registered applicants will appear here" />
      ) : (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">{(p.full_name || p.email || 'U').charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.full_name || 'Unnamed'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{p.email} • {p.profession || 'No profession set'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-brand-600 dark:text-brand-400">{p.profile_completion || 0}%</div>
                <div className="text-xs text-slate-400">profile</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ AGENTS ============ */
function AgentsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Recruitment Agents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Sarah Johnson', region: 'West Africa', placements: 142, rating: 4.9 },
          { name: 'David Chen', region: 'East Africa', placements: 98, rating: 4.8 },
          { name: 'Aisha Mohammed', region: 'North Africa', placements: 115, rating: 4.7 },
        ].map((agent) => (
          <div key={agent.name} className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mb-3">{agent.name.charAt(0)}</div>
            <div className="font-semibold text-slate-900 dark:text-white">{agent.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{agent.region}</div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="font-bold text-slate-900 dark:text-white">{agent.placements}</span>
              <span className="text-slate-500 dark:text-slate-400">placements</span>
              <span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /> {agent.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ COUNTRIES ============ */
function CountriesTab() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('jobs').select('country, flag').eq('status', 'active').then(({ data }) => {
      if (!data) { setLoading(false); return; }
      const grouped: Record<string, { flag: string; count: number }> = {};
      data.forEach((d: { country: string; flag: string }) => {
        if (!grouped[d.country]) grouped[d.country] = { flag: d.flag, count: 0 };
        grouped[d.country].count++;
      });
      setCountries(Object.entries(grouped).map(([name, info]) => ({ name, ...info })).sort((a, b) => b.count - a.count));
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Countries ({countries.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {countries.map((c) => (
          <div key={c.name} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-4xl mb-2">{c.flag}</div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</div>
            <div className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-1">{c.count} jobs</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ PAYMENTS ============ */
function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('payment_transactions').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setPayments(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const gatewayColors: Record<string, string> = {
    stripe: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
    paypal: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    mpesa: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    flutterwave: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
    paystack: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Payments ({payments.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {['stripe', 'paypal', 'mpesa', 'flutterwave', 'paystack'].map((g) => (
          <div key={g} className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-center">
            <div className={`text-xs font-bold uppercase ${gatewayColors[g].split(' ').slice(-2).join(' ')}`}>{g}</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">{payments.filter((p) => p.gateway === g).length}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center"><CreditCard className="w-5 h-5 text-slate-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.description}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{p.user_email} • {new Date(p.created_at).toLocaleDateString()}</div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${gatewayColors[p.gateway] || 'bg-slate-100 dark:bg-white/5 text-slate-600'}`}>{p.gateway}</span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${p.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'}`}>{p.status}</span>
            <div className="font-bold text-slate-900 dark:text-white">${p.amount} {p.currency}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ SUBSCRIPTIONS ============ */
function SubscriptionsTab() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setSubs(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const plans = [
    { name: 'Free', tier: 'applicant', price: 0, features: ['Browse jobs', 'Apply to 3 jobs/month', 'Basic AI assistant'] },
    { name: 'Premium', tier: 'applicant', price: 49, features: ['Unlimited applications', 'Priority AI assistant', 'CV review', 'Interview prep', 'Document storage'] },
    { name: 'Pro', tier: 'employer', price: 99, features: ['Post 10 jobs', 'View applicant profiles', 'Direct messaging'] },
    { name: 'Enterprise', tier: 'employer', price: 299, features: ['Unlimited job posts', 'Bulk hiring', 'Dedicated agent', 'Analytics dashboard', 'API access'] },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Premium Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className={`p-5 rounded-2xl border ${plan.name === 'Premium' || plan.name === 'Enterprise' ? 'border-brand-300 dark:border-brand-500/40 bg-brand-50/50 dark:bg-brand-500/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Crown className={`w-5 h-5 ${plan.price > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              <h3 className="font-extrabold text-slate-900 dark:text-white">{plan.name}</h3>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">{plan.tier}</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">${plan.price}<span className="text-sm font-normal text-slate-400">/mo</span></div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Active Subscriptions ({subs.length})</h3>
        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <Crown className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{s.plan} — {s.tier}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.billing_cycle} • ${s.price} {s.currency} • {s.payment_method}</div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ NEWS ============ */
function NewsTab() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setNews(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">News ({news.length})</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"><Plus className="w-4 h-4" /> Add Article</button>
      </div>
      <div className="space-y-2">
        {news.map((n) => (
          <div key={n.id} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</h3>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">{n.category}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{n.excerpt}</p>
            <div className="text-xs text-slate-400 mt-2">{n.author} • {new Date(n.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ SUCCESS STORIES ============ */
function StoriesTab() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('success_stories').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setStories(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Success Stories ({stories.length})</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"><Plus className="w-4 h-4" /> Add Story</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stories.map((s) => (
          <div key={s.id} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">{s.name.charAt(0)}</div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{s.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.flag} {s.country} • {s.job_title}</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{s.story}</p>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: s.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ REVIEWS ============ */
function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setReviews(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reviews ({reviews.length})</h2>
      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{r.title}</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />)}
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{r.content}</p>
            <div className="text-xs text-slate-400 mt-2">{r.author_name} • {new Date(r.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ ANALYTICS ============ */
function AnalyticsTab() {
  const [data, setData] = useState({ jobs: 0, employers: 0, applications: 0, reviews: 0, revenue: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('payment_transactions').select('amount, status'),
    ]).then(([j, e, a, r, p]) => {
      const revenue = (p.data || []).filter((x: { status: string }) => x.status === 'completed').reduce((s: number, x: { amount: number }) => s + x.amount, 0);
      setData({ jobs: j.count || 0, employers: e.count || 0, applications: a.count || 0, reviews: r.count || 0, revenue, payments: (p.data || []).length });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const metrics = [
    { label: 'Job Posts', value: data.jobs, change: '+12%', icon: Briefcase, color: 'text-brand-600' },
    { label: 'Active Employers', value: data.employers, change: '+8%', icon: Building2, color: 'text-blue-600' },
    { label: 'Applications', value: data.applications, change: '+24%', icon: Users, color: 'text-green-600' },
    { label: 'Reviews', value: data.reviews, change: '+15%', icon: Star, color: 'text-amber-600' },
    { label: 'Revenue', value: `$${data.revenue.toFixed(0)}`, change: '+18%', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Transactions', value: data.payments, change: '+10%', icon: CreditCard, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analytics Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${m.color}`} />
                <span className="flex items-center gap-0.5 text-xs font-bold text-green-600 dark:text-green-400"><TrendingUp className="w-3 h-3" /> {m.change}</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.label}</div>
            </motion.div>
          );
        })}
      </div>
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Applications by Stage</h3>
        <div className="space-y-3">
          {['Submitted', 'Documents Verified', 'Employer Review', 'Interview', 'Medical', 'Visa Processing', 'Flight Booking', 'Departure', 'Arrival'].map((stage, i) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-32 truncate">{stage}</span>
              <div className="flex-1 h-6 bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(5, 90 - i * 10)}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-8 text-right">{Math.max(5, 90 - i * 10)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ FRAUD DETECTION ============ */
function FraudTab() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('fraud_alerts').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setAlerts(data || []);
      setLoading(false);
    });
  }, []);

  const resolveAlert = async (id: string) => {
    await supabase.from('fraud_alerts').update({ status: 'resolved' }).eq('id', id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Fraud Detection ({alerts.filter((a) => a.status === 'open').length} open)</h2>
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-300">Automated fraud detection monitors job postings, employer profiles, and user activity for suspicious patterns.</p>
      </div>
      <div className="space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.severity === 'high' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-yellow-100 dark:bg-yellow-500/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${a.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.target_name || a.target_type}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.reason}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">{a.target_type}</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${a.severity === 'high' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'}`}>{a.severity}</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${a.status === 'open' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'}`}>{a.status}</span>
              </div>
            </div>
            {a.status === 'open' && <button onClick={() => resolveAlert(a.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">Resolve</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ USER ROLES ============ */
function RolesTab() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('user_roles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setRoles(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    agent: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
    employer: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    editor: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    applicant: 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Roles ({roles.length})</h2>
      <div className="space-y-2">
        {roles.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold">{r.email.charAt(0).toUpperCase()}</div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{r.email}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Joined {new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${roleColors[r.role] || roleColors.applicant}`}>{r.role}</span>
          </div>
        ))}
        {roles.length === 0 && <EmptyState icon={UserCog} title="No role assignments" subtitle="User role assignments will appear here" />}
      </div>
    </div>
  );
}

/* ============ SUPPORT TICKETS ============ */
function TicketsTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setTickets(data || []);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  if (loading) return <LoadingSpinner />;

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    medium: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    low: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  };
  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    open: Clock, resolved: CheckCircle2, closed: XCircle,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Support Tickets ({tickets.filter((t) => t.status === 'open').length} open)</h2>
      <div className="space-y-2">
        {tickets.map((t) => {
          const StatusIcon = statusIcons[t.status] || Clock;
          return (
            <div key={t.id} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t.subject}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${priorityColors[t.priority]}`}>{t.priority}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><StatusIcon className="w-3.5 h-3.5" /> {t.status}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">{t.category}</span>
                <span className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
                {t.status === 'open' && (
                  <button onClick={() => updateStatus(t.id, 'resolved')} className="ml-auto px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">Mark Resolved</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ AI SETTINGS ============ */
function AITab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    supabase.from('ai_settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('ai_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Settings</h2>
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Model</label>
          <select value={settings.model || 'gpt-4o'} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50">
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Temperature: {settings.temperature || '0.7'}</label>
          <input type="range" min="0" max="2" step="0.1" value={settings.temperature || '0.7'} onChange={(e) => setSettings({ ...settings, temperature: e.target.value })} className="w-full accent-brand-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Max Tokens</label>
          <input type="number" value={settings.max_tokens || '2000'} onChange={(e) => setSettings({ ...settings, max_tokens: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">System Prompt</label>
          <textarea value={settings.system_prompt || ''} onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50 resize-none" />
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.enabled === 'true'} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked ? 'true' : 'false' })} className="w-4 h-4 rounded accent-brand-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Assistant Enabled</span>
          </label>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {savedMsg ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

/* ============ REVENUE & COMMISSION ============ */
function RevenueTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("payment_transactions").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setPayments(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalCommission = payments.filter((p) => p.status === "completed").reduce((s, p) => s + (p.platform_fee || p.amount * 0.10), 0);
  const totalPayouts = payments.filter((p) => p.status === "completed").reduce((s, p) => s + (p.employer_payout || p.amount * 0.90), 0);
  const pendingRevenue = payments.filter((p) => p.status !== "completed").reduce((s, p) => s + p.amount, 0);

  const gatewayRevenue: Record<string, number> = {};
  payments.filter((p) => p.status === "completed").forEach((p) => {
    gatewayRevenue[p.gateway] = (gatewayRevenue[p.gateway] || 0) + p.amount;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Revenue & Commission</h2>
      <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-cyan-50 dark:from-brand-500/10 dark:to-cyan-500/10 border border-brand-200 dark:border-brand-500/20">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">Platform Commission Model</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">GlobalHire Africa earns a <span className="font-bold text-brand-600 dark:text-brand-400">10% commission</span> on every transaction. The remaining 90% is disbursed to employers/service providers.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Revenue</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">${totalCommission.toFixed(2)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Owner Commission (10%)</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">${totalPayouts.toFixed(2)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Employer Payouts (90%)</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">${pendingRevenue.toFixed(2)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Revenue</div>
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Revenue by Payment Gateway</h3>
        <div className="space-y-3">
          {Object.entries(gatewayRevenue).map(([gw, amt]) => {
            const pct = totalRevenue > 0 ? (amt / totalRevenue) * 100 : 0;
            return (
              <div key={gw} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-24 capitalize">{gw}</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-16 text-right">${amt.toFixed(0)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Commission Transactions ({payments.length})</h3>
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.description}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{p.user_email} - {p.gateway} - {new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white">${p.amount}</div>
                <div className="text-xs text-brand-600 dark:text-brand-400">fee: ${(p.platform_fee || p.amount * 0.10).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ USER LOCATIONS ============ */
function UserLocationsTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("*").order("last_login_at", { ascending: false, nullsFirst: false }).then(({ data }) => {
      setUsers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const usersWithLocation = users.filter((u) => u.login_lat != null);
  const W = 800; const H = 400;

  function latLngToXY(lat: number, lng: number) {
    const x = ((lng + 180) / 360) * W;
    const y = ((90 - lat) / 180) * H;
    return { x, y };
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Live Locations</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Real-time location of users when they logged in. {usersWithLocation.length} users with location data.</p>

      {/* Map with user pins */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-xl">
        <div className="relative w-full" style={{ aspectRatio: "2 / 1" }}>
          <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <defs>
              <pattern id="userdots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="0.8" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
              </pattern>
            </defs>
            <path d="M120,80 Q200,60 280,90 L320,140 Q300,200 260,210 L180,220 Q120,200 100,160 Z" fill="url(#userdots)" className="opacity-60" />
            <path d="M380,70 Q500,50 620,80 L680,140 Q660,200 580,210 L420,200 Q360,150 380,70 Z" fill="url(#userdots)" className="opacity-60" />
            <path d="M400,220 Q480,210 540,240 L560,320 Q500,360 440,340 L400,280 Z" fill="url(#userdots)" className="opacity-60" />
            <path d="M620,200 Q700,190 740,230 L760,320 Q720,360 660,340 L620,280 Z" fill="url(#userdots)" className="opacity-60" />
            <path d="M160,240 Q220,230 260,260 L280,340 Q240,380 180,360 L140,300 Z" fill="url(#userdots)" className="opacity-60" />
            {[100,200,300,400,500,600,700].map((x) => (<line key={"v"+x} x1={x} y1="0" x2={x} y2="400" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="0.5" />))}
            {[100,200,300].map((y) => (<line key={"h"+y} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="0.5" />))}
          </svg>
          {usersWithLocation.map((u) => {
            const { x, y } = latLngToXY(u.login_lat, u.login_lng);
            const pctX = (x / W) * 100;
            const pctY = (y / H) * 100;
            return (
              <div key={u.id} className="absolute group" style={{ left: `${pctX}%`, top: `${pctY}%`, transform: "translate(-50%, -100%)" }}>
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 cursor-pointer group-hover:scale-125 transition-transform">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs shadow-lg">
                    <div className="font-semibold">{u.full_name || u.email}</div>
                    <div className="text-white/70">{u.login_city || "Unknown"}, {u.login_country || ""}</div>
                    <div className="text-white/50 text-[10px]">{u.login_device || ""}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-white/10">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{usersWithLocation.length} active users on map</span>
        </div>
      </div>

      {/* User location list */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Users ({users.length})</h3>
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{u.full_name || u.email}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {u.login_city ? `${u.login_city}, ` : ""}{u.login_country || "Location not available"}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Smartphone className="w-3 h-3" /> {u.login_device || "Unknown"}</div>
              <div className="text-xs text-slate-400 mt-0.5">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never logged in"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ SHARED COMPONENTS ============ */
function LoadingSpinner() {
  return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="text-center py-20">
      <Icon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" />
    </div>
  );
}
