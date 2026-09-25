import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);
import { Star, ArrowRight, BadgeCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employer } from '../lib/supabase';

export default function EmployerSpotlight() {
  const [employers, setEmployers] = useState<Employer[]>([]);

  useEffect(() => {
    supabase.from('employers').select('*').limit(4).then(({ data }) => {
      setEmployers(data as Employer[] || []);
    });
  }, []);

  return (
    <section id="employers" className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-full mb-3">
            Employer Spotlight
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trusted by Global Industry Leaders
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {employers.map((emp, i) => (
            <MotionLink
              key={emp.id}
              to={`/employers/${emp.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {emp.logo}
                </div>
                <span className="text-3xl">{emp.flag}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{emp.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{emp.tagline}</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{emp.rating}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{emp.open_roles} open roles</span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-green-600 dark:text-green-400">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified Employer
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 rounded-xl group-hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors group-hover:gap-3">
                View Profile
                <ArrowRight className="w-4 h-4" />
              </div>
            </MotionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
