import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CountryData {
  name: string;
  flag: string;
  jobs: number;
  employers: number;
  gradient: string;
}

const gradientMap: Record<string, string> = {
  'UAE': 'from-emerald-500 to-teal-600',
  'Saudi Arabia': 'from-green-600 to-emerald-700',
  'Qatar': 'from-purple-600 to-indigo-700',
  'Canada': 'from-red-500 to-rose-600',
  'South Korea': 'from-blue-500 to-cyan-600',
  'Japan': 'from-pink-500 to-rose-600',
  'United Kingdom': 'from-indigo-500 to-blue-700',
  'Germany': 'from-amber-500 to-yellow-600',
};

export default function Countries() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryData[]>([]);

  useEffect(() => {
    supabase.from('jobs').select('country, flag').eq('status', 'active').then(({ data }) => {
      if (!data) return;
      const grouped: Record<string, { flag: string; jobs: number }> = {};
      data.forEach((d: { country: string; flag: string }) => {
        if (!grouped[d.country]) grouped[d.country] = { flag: d.flag, jobs: 0 };
        grouped[d.country].jobs++;
      });
      const result = Object.entries(grouped).map(([name, info]) => ({
        name, flag: info.flag, jobs: info.jobs, employers: 0,
        gradient: gradientMap[name] || 'from-brand-500 to-brand-700',
      }));
      setCountries(result);
    });
  }, []);

  const handleClick = (country: string) => {
    navigate(`/jobs?country=${encodeURIComponent(country)}`);
  };

  return (
    <section id="countries" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-full mb-3">
              Destinations
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Countries Hiring Now
            </motion.h2>
          </div>
          <Link to="/jobs" className="group flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all">
            View all countries
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.map((country, i) => (
            <motion.button
              key={country.name}
              onClick={() => handleClick(country.name)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
              className="group relative p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left"
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${country.gradient} opacity-10 dark:opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative">
                <div className="text-4xl mb-3">{country.flag}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{country.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{country.jobs} jobs</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Hiring</span>
                </div>
                <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${country.gradient} opacity-30 group-hover:opacity-100 transition-opacity`} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
