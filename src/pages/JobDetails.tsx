import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Plane, Home, UtensilsCrossed, Shield, BadgeCheck,
  CheckCircle2, Briefcase, Building2, Star, Bookmark, Send, Loader2, Wallet,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job, Employer } from '../lib/supabase';
import { kenyaJobs } from '../data/kenyaJobs';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import JobAgentChat from '../components/JobAgentChat';

const getJobById = (id?: string) => {
  if (!id) return null;
  return kenyaJobs.find((job) => job.id === id) ?? null;
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatJobSalary } = useCurrency();
  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const localJob = getJobById(id);
    if (localJob) {
      setJob(localJob as Job);
      setLoading(false);
      return;
    }

    supabase.from('jobs').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      setJob(data as Job | null);
      if (data?.employer_id) {
        supabase.from('employers').select('*').eq('id', data.employer_id).maybeSingle().then(({ data: emp }) => {
          setEmployer(emp as Employer | null);
        });
      }
      setLoading(false);
    });

    if (user) {
      supabase.from('saved_jobs').select('id').eq('job_id', id).eq('user_id', user.id).maybeSingle().then(({ data }) => {
        setSaved(!!data);
      });
      supabase.from('applications').select('id').eq('job_id', id).eq('user_id', user.id).maybeSingle().then(({ data }) => {
        setApplied(!!data);
      });
    }
  }, [id, user]);

  const toggleSave = async () => {
    if (!user) { navigate('/login'); return; }
    if (saved) {
      await supabase.from('saved_jobs').delete().eq('job_id', id).eq('user_id', user.id);
      setSaved(false);
    } else {
      await supabase.from('saved_jobs').insert({ job_id: id, user_id: user.id });
      setSaved(true);
    }
  };

  const handleApply = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/apply/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job not found</h2>
        <Link to="/jobs" className="text-brand-600 hover:underline mt-4 inline-block">Back to jobs</Link>
      </div>
    );
  }

  const benefits = [
    { icon: Plane, label: 'Visa Sponsorship', enabled: job.visa, color: 'text-green-600 dark:text-green-400' },
    { icon: Home, label: 'Accommodation', enabled: job.accommodation, color: 'text-brand-600 dark:text-brand-400' },
    { icon: UtensilsCrossed, label: 'Meals Provided', enabled: job.meals, color: 'text-orange-600 dark:text-orange-400' },
    { icon: Shield, label: 'Health Insurance', enabled: job.insurance, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
              {job.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{job.flag}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><BadgeCheck className="w-4 h-4 text-brand-500" /> Verified Employer</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.city}, {job.country}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.contract}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSave} className={`p-3 rounded-xl border transition-colors ${saved ? 'border-brand-300 text-brand-600 dark:border-brand-500/40 dark:text-brand-400' : 'border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600'}`}>
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg">{tag}</span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div className={`flex items-center gap-2 p-3 rounded-xl ${b.enabled ? 'bg-green-50 dark:bg-green-500/10' : 'bg-slate-50 dark:bg-white/5 opacity-50'}`}>
                  <Icon className={`w-5 h-5 ${b.color}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{b.label}</span>
                  {b.enabled && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {job.description && (
              <Section title="Job Description">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{job.description}</p>
              </Section>
            )}

            <JobAgentChat job={job} />

            {job.responsibilities.length > 0 && (
              <Section title="Responsibilities">
                <ul className="space-y-2.5">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.requirements.length > 0 && (
              <Section title="Requirements">
                <ul className="space-y-2.5">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.benefits.length > 0 && (
              <Section title="Benefits">
                <ul className="space-y-2.5">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <Star className="w-5 h-5 text-accent-500 fill-accent-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.working_hours && (
              <Section title="Working Hours">
                <p className="text-slate-600 dark:text-slate-300">{job.working_hours}</p>
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Salary & Apply */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 sticky top-24">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Monthly Salary</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{formatJobSalary(job.salary_min ?? (Number.parseInt((job.salary || '').replace(/[^0-9]/g, '')) || 0), job.country)}</div>
              {job.salary_max && (
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">up to {formatJobSalary(job.salary_max, job.country)}</div>
              )}
              {!job.salary_max && <div className="mb-4" />}

              <div className="space-y-2.5 mb-6 text-sm">
                <Row icon={MapPin} label="Location" value={`${job.city}, ${job.country}`} />
                <Row icon={Briefcase} label="Job Type" value={job.type} />
                <Row icon={Clock} label="Contract" value={job.contract} />
                <Row icon={Wallet} label="Category" value={job.category} />
              </div>

              {applied ? (
                <div className="flex items-center justify-center gap-2 py-3.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-semibold rounded-xl">
                  <CheckCircle2 className="w-5 h-5" /> Application Submitted
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Apply Now</>}
                </button>
              )}

              <button onClick={toggleSave} className="w-full mt-3 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-current text-brand-600' : ''}`} /> {saved ? 'Saved' : 'Save Job'}
              </button>
            </div>

            {/* Employer info */}
            {employer && (
              <Link to={`/employers/${employer.id}`} className="block p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xl">
                    {employer.logo}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {employer.name} {employer.verified && <BadgeCheck className="w-4 h-4 text-brand-500" />}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{employer.tagline}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent-500 text-accent-500" /> {employer.rating}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {employer.open_roles} open</span>
                </div>
                <div className="mt-3 text-sm text-brand-600 dark:text-brand-400 font-semibold">View employer profile →</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Icon className="w-4 h-4" /> {label}</span>
      <span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}
