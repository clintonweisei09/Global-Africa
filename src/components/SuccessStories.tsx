import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { successStories } from '../data/content';

export default function SuccessStories() {
  return (
    <section id="stories" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-full mb-3"
          >
            Success Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Dreams Turned Into Careers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Real journeys from job seekers to thriving professionals abroad.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-brand-100 dark:text-brand-500/20" />

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: story.rating }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-accent-500 text-accent-500" />
                ))}
              </div>

              <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-6 relative z-10">
                "{story.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-500/20"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{story.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {story.role} • {story.flag} {story.country}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
