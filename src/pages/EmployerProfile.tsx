import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BadgeCheck, Star, Globe, MapPin, Briefcase,
  Users, Clock, Plane, Home, Bookmark, Loader2, Quote,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employer, Job, Review } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function EmployerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('employers').select('*').eq('id', id).maybeSingle(),
      supabase.from('jobs').select('*').eq('employer_id', id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').eq('employer_id', id).order('created_at', { ascending: false }),
    ]).then(([empRes, jobRes, revRes]) => {
      setEmployer(empRes.data as Employer | null);
      setJobs(jobRes.data as Job[] || []);
      setReviews(revRes.data as Review[] || []);
      setLoading(false);
    });

    if (user) {
      supabase.from('saved_jobs').select('job_id').eq('user_id', user.id).then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((s) => s.job_id)));
      });
    }
  }, [id, user]);

  const toggleSave = async (jobId: string) => {
    if (!user) { window.location.href = '/login'; return; }
    if (savedIds.has(jobId)) {
      await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('user_id', user.id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    } else {
      await supabase.from('saved_jobs').insert({ job_id: jobId, user_id: user.id });
      setSavedIds((prev) => new Set(prev).add(jobId));
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-32 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  if (!employer) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employer not found</h2>
        <Link to="/" className="text-brand-600 hover:underline mt-4 inline-block">Back home</Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : employer.rating.toFixed(1);

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/jobs" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">
              {employer.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">{employer.name}</h1>
                {employer.verified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-3">{employer.tagline}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {employer.city}, {employer.country} {employer.flag}</span>
                {employer.website && <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {employer.website.replace('https://', '')}</span>}
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent-500 text-accent-500" /> {avgRating} ({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {employer.description && (
            <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed">{employer.description}</p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat icon={Briefcase} label="Open Positions" value={employer.open_roles} />
            <Stat icon={Users} label="Total Hires" value={employer.hiring_history} />
            <Stat icon={Star} label="Rating" value={avgRating} />
          </div>
        </motion.div>

        {/* Open positions */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Open Positions ({jobs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <Link to={`/jobs/${job.id}`} className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{job.title}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {job.city}, {job.country} {job.flag}
                  </div>
                </Link>
                <button onClick={() => toggleSave(job.id)} className={`p-1.5 rounded-lg transition-colors ${savedIds.has(job.id) ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Bookmark className={`w-4.5 h-4.5 ${savedIds.has(job.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm mb-3">
                <span className="font-bold text-slate-900 dark:text-white">{job.salary}</span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.contract}</span>
                {job.visa && <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs"><Plane className="w-3.5 h-3.5" /> Visa</span>}
                {job.accommodation && <span className="text-brand-600 dark:text-brand-400 flex items-center gap-1 text-xs"><Home className="w-3.5 h-3.5" /> Housing</span>}
              </div>
              <Link to={`/jobs/${job.id}`} className="block text-center py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                View Details
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Reviews */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-brand-100 dark:text-brand-500/20" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-accent-500 text-accent-500" />
                  ))}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{review.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{review.content}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                    {review.author_name.charAt(0)}
                  </div>
                  {review.author_name}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
      <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400 mx-auto mb-2" />
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
    </div>
  );
}
