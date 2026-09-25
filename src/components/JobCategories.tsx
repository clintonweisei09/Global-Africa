import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home, Sparkles, Wind, Trees, Car, Building2, Factory, Fuel,
  HeartHandshake, HardHat, ShieldCheck, ChefHat, ArrowRight,
  Briefcase, ShoppingCart, Scissors, GraduationCap,
} from 'lucide-react';
import { jobCategories } from '../data/content';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Sparkles, Wind, Trees, Car, Building2, Factory, Fuel,
  HeartHandshake, HardHat, ShieldCheck, ChefHat, Briefcase, ShoppingCart, Scissors, GraduationCap,
};

export default function JobCategories() {
  const navigate = useNavigate();
  return (
    <section className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-full mb-3"
          >
            Explore by Category
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Find Your Field of Expertise
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Browse opportunities across in-demand sectors with employers actively recruiting from Africa.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {jobCategories.map((cat, i) => {
            const Icon = iconMap[cat.icon] ?? Home;
            return (
              <motion.button
                key={cat.name}
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors">
                      {cat.jobs.toLocaleString()} jobs
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
