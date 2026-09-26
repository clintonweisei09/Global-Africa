import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plane, Home, Clock, MapPin, BadgeCheck, Bookmark, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { kenyaJobs } from '../data/kenyaJobs';
import { fallbackJobs } from '../components/FeaturedJobs';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const PAGE_SIZE = 9;

const categories = ['All', 'Housekeepers', 'Maids', 'Cleaners', 'Gardeners', 'Drivers', 'Hotel Staff', 'Factory Workers', 'Petrol Attendants', 'Caregivers', 'Construction', 'Security Guards', 'Chefs & Cooks'];
const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'salary_high', label: 'Highest Salary' },
  { value: 'salary_low', label: 'Lowest Salary' },
  { value: 'country', label: 'Country A-Z' },
];

export default function JobListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState(searchParams.get('country') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [jobType, setJobType] = useState(searchParams.get('type') || 'All');
  const [visaOnly, setVisaOnly] = useState(searchParams.get('visa') === 'true');
  const [minSalary, setMinSalary] = useState(searchParams.get('salary') || '');
  const { formatJobSalary } = useCurrency();
  const [sortBy, setSortBy] = useState('newest');

  const [countryList, setCountryList] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('jobs').select('country').order('country').then(({ data }) => {
      const localCountries = [...fallbackJobs, ...kenyaJobs].map((job) => job.country);
      const unique = Array.from(new Set([...(data || []).map((d) => d.country), ...localCountries])).filter(Boolean).sort();
      setCountryList(unique);
    });
  }, []);

  const fetchSaved = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
    if (data) setSavedIds(new Set(data.map((s) => s.job_id)));
  }, [user]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.from('jobs').select('*').eq('status', 'active').then(({ data }) => {
      if (cancelled) return;
      const seen = new Set<string>();
      const allJobs = [...((data as Job[] | null) || []), ...fallbackJobs, ...kenyaJobs].filter((job) => {
        const key = `${job.country}|${job.company}|${job.title}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const searchTerm = search.trim().toLowerCase();
      const selectedCategoryTerms: Record<string, string[]> = {
        Housekeepers: ['housekeep', 'housemaid'],
        Maids: ['maid', 'housekeep'],
        Cleaners: ['clean'],
        Gardeners: ['garden'],
        Drivers: ['driver', 'transport'],
        'Hotel Staff': ['hotel', 'hospitality'],
        'Factory Workers': ['factory', 'manufactur'],
        'Petrol Attendants': ['petrol', 'fuel'],
        Caregivers: ['caregiver', 'healthcare'],
        Construction: ['construction'],
        'Security Guards': ['security'],
        'Chefs & Cooks': ['chef', 'cook'],
      };
      const filteredJobs = allJobs.filter((job) => {
        const searchableText = [job.title, job.company, job.city, job.country, ...(job.tags || [])].join(' ').toLowerCase();
        const categoryText = [job.title, job.category, ...(job.tags || [])].join(' ').toLowerCase();
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        const matchesCountry = country === 'All' || job.country.toLowerCase() === country.toLowerCase();
        const matchesCategory = category === 'All' || (selectedCategoryTerms[category] || [category.toLowerCase()]).some((term) => categoryText.includes(term.toLowerCase()));
        const matchesType = jobType === 'All' || (job.type || job.contract || '').toLowerCase() === jobType.toLowerCase();
        const matchesVisa = !visaOnly || job.visa;
        const matchesSalary = !minSalary || (job.salary_min ?? 0) >= Number.parseInt(minSalary, 10);
        return matchesSearch && matchesCountry && matchesCategory && matchesType && matchesVisa && matchesSalary;
      });

      if (sortBy === 'salary_high') filteredJobs.sort((a, b) => (b.salary_min ?? 0) - (a.salary_min ?? 0));
      else if (sortBy === 'salary_low') filteredJobs.sort((a, b) => (a.salary_min ?? 0) - (b.salary_min ?? 0));
      else if (sortBy === 'country') filteredJobs.sort((a, b) => a.country.localeCompare(b.country));
      else filteredJobs.sort((a, b) => b.created_at.localeCompare(a.created_at));

      setTotal(filteredJobs.length);
      setJobs(filteredJobs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [search, country, category, jobType, visaOnly, minSalary, sortBy, page]);

  const toggleSave = async (jobId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (savedIds.has(jobId)) {
      await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('user_id', user.id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    } else {
      await supabase.from('saved_jobs').insert({ job_id: jobId, user_id: user.id });
      setSavedIds((prev) => new Set(prev).add(jobId));
    }
  };

  const applySearch = () => {
    setPage(0);
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (country !== 'All') params.country = country;
    if (category !== 'All') params.category = category;
    if (jobType !== 'All') params.type = jobType;
    if (visaOnly) params.visa = 'true';
    if (minSalary) params.salary = minSalary;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch(''); setCountry('All'); setCategory('All'); setJobType('All'); setVisaOnly(false); setMinSalary(''); setSortBy('newest'); setPage(0);
    setSearchParams({});
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-slate-50/50 dark:bg-slate-950">
      {/* Search bar */}
      <div className="bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                placeholder="Search jobs, companies, or cities..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" /> Filters
            </button>
            <button onClick={applySearch} className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-all">
              Search
            </button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <SelectField label="Country" value={country} onChange={(v) => { setCountry(v); setPage(0); }} options={['All', ...countryList]} />
              <SelectField label="Category" value={category} onChange={(v) => { setCategory(v); setPage(0); }} options={categories} />
              <SelectField label="Job Type" value={jobType} onChange={(v) => { setJobType(v); setPage(0); }} options={jobTypes} />
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Min Salary ($)</label>
                <input type="number" value={minSalary} onChange={(e) => { setMinSalary(e.target.value); setPage(0); }} placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={visaOnly} onChange={(e) => { setVisaOnly(e.target.checked); setPage(0); }} className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Visa Sponsorship Only</span>
              </label>
              <SelectField label="Sort By" value={sortBy} onChange={setSortBy} options={sortOptions.map((o) => o.value)} labels={sortOptions.map((o) => o.label)} />
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" /> Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'Loading...' : `${total} job${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
                      {job.logo}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{job.company}</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5 text-brand-500" /> Verified
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleSave(job.id)} className={`p-1.5 rounded-lg transition-colors ${savedIds.has(job.id) ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Bookmark className={`w-5 h-5 ${savedIds.has(job.id) ? 'fill-current' : ''}`} />
                    </button>
                    <span className="text-2xl">{job.flag}</span>
                  </div>
                </div>

                <Link to={`/jobs/${job.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <MapPin className="w-4 h-4" /> {job.city}, {job.country}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg">{tag}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">{formatJobSalary(job.salary_min ?? (Number.parseInt((job.salary || '').replace(/[^0-9]/g, '')) || 0), job.country)}</span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Clock className="w-4 h-4" /> {job.contract}</span>
                    {job.visa && <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium"><Plane className="w-3.5 h-3.5" /> Visa</span>}
                    {job.accommodation && <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-xs font-medium"><Home className="w-3.5 h-3.5" /> Housing</span>}
                  </div>
                </Link>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{job.posted}</span>
                  <Link to={`/jobs/${job.id}`} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Apply Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${page === i ? '' : 'hidden sm:inline-flex'} ${
                  page === i
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options, labels,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: string[];
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50"
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt} className="dark:bg-slate-800">{labels?.[i] ?? opt}</option>
        ))}
      </select>
    </div>
  );
}
