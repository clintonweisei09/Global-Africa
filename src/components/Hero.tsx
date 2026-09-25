import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, FileText, Plane } from 'lucide-react';

interface BlinkDot {
  id: number;
  top: string;
  left: string;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const dotColors = [
  'bg-brand-500',
  'bg-red-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
];

function generateRandomDots(count: number): BlinkDot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 90 + 5}%`,
    size: Math.random() * 6 + 4,
    color: dotColors[Math.floor(Math.random() * dotColors.length)],
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1.5,
  }));
}

export default function Hero() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [country, setCountry] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('');
  const [visaOnly, setVisaOnly] = useState(false);
  const [blinkDots, setBlinkDots] = useState<BlinkDot[]>([]);

  useEffect(() => {
    setBlinkDots(generateRandomDots(14));
    const interval = setInterval(() => {
      setBlinkDots(generateRandomDots(14));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (jobTitle) params.set('q', jobTitle);
    if (country) params.set('country', country);
    if (salary) params.set('salary', salary);
    if (jobType) params.set('type', jobType);
    if (visaOnly) params.set('visa', 'true');
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/30" />
      <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/4 left-10 w-72 h-72 bg-red-400/20 dark:bg-red-500/15 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, -20, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/4 right-10 w-96 h-96 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0, 30, 0], y: [0, -15, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 right-1/3 w-64 h-64 bg-brand-400/20 dark:bg-brand-500/10 rounded-full blur-3xl" />

      <div className="absolute inset-0 flex items-center justify-center opacity-70 dark:opacity-50">
        <div className="relative w-full max-w-5xl h-[60%]">
          {blinkDots.map((dot) => (
            <div key={dot.id} className="absolute" style={{ top: dot.top, left: dot.left }}>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                transition={{
                  duration: dot.duration,
                  delay: dot.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`rounded-full ${dot.color}`}
                style={{ width: dot.size, height: dot.size }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{
                  duration: dot.duration,
                  delay: dot.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute inset-0 rounded-full ${dot.color} blur-sm`}
                style={{ width: dot.size * 2, height: dot.size * 2, left: -dot.size / 2, top: -dot.size / 2 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass dark:glass-dark text-sm font-medium text-brand-700 dark:text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Trusted by 690+ verified international employers
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Your Gateway to <span className="text-gradient-animated">International Careers</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover verified overseas job opportunities from trusted employers across 24 countries. Full visa sponsorship, accommodation, and contract security — your journey starts here.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-10 glass dark:glass-dark rounded-2xl p-4 sm:p-5 shadow-2xl shadow-brand-500/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <SearchField icon={Briefcase} label="Job Title" placeholder="e.g. Housekeeper" value={jobTitle} onChange={setJobTitle} />
              <SearchField icon={MapPin} label="Country" placeholder="Any country" value={country} onChange={setCountry} />
              <SearchField icon={DollarSign} label="Min Salary ($)" placeholder="e.g. 1500" value={salary} onChange={setSalary} type="number" />
              <SearchField icon={FileText} label="Job Type" placeholder="Full-time" value={jobType} onChange={setJobType} />
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <Plane className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Visa Sponsorship</div>
                  <label className="flex items-center gap-2 mt-0.5 cursor-pointer">
                    <input type="checkbox" checked={visaOnly} onChange={(e) => setVisaOnly(e.target.checked)} className="w-4 h-4 rounded accent-brand-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Sponsored only</span>
                  </label>
                </div>
              </div>
              <button onClick={handleSearch} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Search className="w-5 h-5" /> Search Jobs
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Verified Employers</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full" /> Visa Sponsorship</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Accommodation Included</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Contract Security</span>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
    </section>
  );
}

function SearchField({
  icon: Icon, label, placeholder, value, onChange, type = 'text',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors text-left">
      <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none" />
      </div>
    </div>
  );
}
