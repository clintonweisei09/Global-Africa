import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Home, Clock, MapPin, ArrowRight, BadgeCheck, Building2, Briefcase, HeartHandshake, CarFront, HardHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';

const fallbackJobs: Job[] = [
  { id: 'fallback-1', title: 'Housekeeping Supervisor', employer_id: null, company: 'Royal Emirates Hospitality', logo: '', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Dubai', salary: 'AED 3,200/mo', salary_min: 3200, salary_max: 4200, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Hospitality', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Linen management', 'Guest room checks'], requirements: ['Experience in housekeeping'], benefits: ['Visa support'], description: 'Lead cleaning and guest support for resort operations.', tags: ['Housekeeping', 'Supervisor', 'Resort'], posted: '2 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-2', title: 'Caregiver', employer_id: null, company: 'BrightCare Senior Services', logo: '', country: 'Canada', flag: '🇨🇦', city: 'Toronto', salary: '$2,800/mo', salary_min: 2800, salary_max: 3600, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Healthcare', visa: true, accommodation: true, meals: false, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Patient care'], requirements: ['Caregiving background'], benefits: ['Healthcare'], description: 'Support seniors in assisted living homes.', tags: ['Caregiver', 'Healthcare', 'Canada'], posted: '3 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-3', title: 'Warehouse Picker', employer_id: null, company: 'Riyadh Transport Co.', logo: '', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Riyadh', salary: 'SAR 2,600/mo', salary_min: 2600, salary_max: 3300, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Logistics', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '9 hours/day', responsibilities: ['Order picking'], requirements: ['Forklift certificate'], benefits: ['Transport allowance'], description: 'Support warehouse operations and inventory management.', tags: ['Warehouse', 'Logistics', 'Packing'], posted: '1 week ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-4', title: 'Construction Labourer', employer_id: null, company: 'Tokyo Build Corp', logo: '', country: 'Japan', flag: '🇯🇵', city: 'Osaka', salary: '¥230,000/mo', salary_min: 230000, salary_max: 290000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Construction', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Contract', working_hours: '10 hours/day', responsibilities: ['Site support'], requirements: ['Manual labour experience'], benefits: ['Housing'], description: 'Assist with building and infrastructure projects.', tags: ['Construction', 'Labour', 'Skilled'], posted: '2 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-5', title: 'Chef de Partie', employer_id: null, company: 'Marriott International', logo: '', country: 'Qatar', flag: '🇶🇦', city: 'Doha', salary: 'QAR 4,000/mo', salary_min: 4000, salary_max: 5200, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Hospitality', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Line cooking'], requirements: ['Pastry or grill experience'], benefits: ['Flight ticket'], description: 'Prepare premium dishes in a luxury hotel kitchen.', tags: ['Chef', 'Kitchen', 'Hotel'], posted: '4 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-6', title: 'Security Officer', employer_id: null, company: 'Royal Emirates Hospitality', logo: '', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Abu Dhabi', salary: 'AED 2,700/mo', salary_min: 2700, salary_max: 3400, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Security', visa: true, accommodation: true, meals: false, insurance: true, contract: 'Permanent', working_hours: '12 hours/day', responsibilities: ['Patrol and checks'], requirements: ['Security background'], benefits: ['Medical cover'], description: 'Monitor property safety and guest security.', tags: ['Security', 'Safety', 'Guard'], posted: '6 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-7', title: 'Cleaner', employer_id: null, company: 'Samsung Electronics', logo: '', country: 'South Korea', flag: '🇰🇷', city: 'Seoul', salary: '₩2,050,000/mo', salary_min: 2050000, salary_max: 2600000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'part-time', category: 'Facilities', visa: false, accommodation: false, meals: false, insurance: true, contract: 'Temporary', working_hours: '6 hours/day', responsibilities: ['Facility sanitation'], requirements: ['Basic hygiene training'], benefits: ['Shift allowance'], description: 'Support facility hygiene and cleaning schedules.', tags: ['Cleaning', 'Facilities', 'Support'], posted: '3 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-8', title: 'Delivery Driver', employer_id: null, company: 'Riyadh Transport Co.', logo: '', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Jeddah', salary: 'SAR 3,100/mo', salary_min: 3100, salary_max: 3900, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Transport', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Route delivery'], requirements: ['Valid driving license'], benefits: ['Fuel allowance'], description: 'Handle scheduled package and freight deliveries.', tags: ['Driver', 'Logistics', 'Delivery'], posted: '5 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-9', title: 'Housemaid', employer_id: null, company: 'BrightCare Senior Services', logo: '', country: 'Canada', flag: '🇨🇦', city: 'Vancouver', salary: '$2,200/mo', salary_min: 2200, salary_max: 3000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Domestic', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '7 hours/day', responsibilities: ['Daily home upkeep'], requirements: ['Household experience'], benefits: ['Visa support'], description: 'Support households with cleaning and daily living tasks.', tags: ['Housemaid', 'Domestic', 'Support'], posted: '2 weeks ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-10', title: 'Factory Operator', employer_id: null, company: 'Samsung Electronics', logo: '', country: 'South Korea', flag: '🇰🇷', city: 'Busan', salary: '₩2,400,000/mo', salary_min: 2400000, salary_max: 3100000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Manufacturing', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Production line tasks'], requirements: ['Factory operation training'], benefits: ['Annual bonus'], description: 'Operate machinery and maintain production efficiency.', tags: ['Factory', 'Manufacturing', 'Operator'], posted: '1 week ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-11', title: 'Hotel Front Desk Agent', employer_id: null, company: 'Marriott International', logo: '', country: 'Qatar', flag: '🇶🇦', city: 'Doha', salary: 'QAR 3,800/mo', salary_min: 3800, salary_max: 4700, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Hospitality', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Guest welcome and check-in'], requirements: ['Hospitality experience'], benefits: ['Relocation support'], description: 'Deliver quality guest services and front office operations.', tags: ['Hotel', 'Front Desk', 'Hospitality'], posted: '3 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-12', title: 'Nurse Assistant', employer_id: null, company: 'BrightCare Senior Services', logo: '', country: 'Canada', flag: '🇨🇦', city: 'Calgary', salary: '$3,000/mo', salary_min: 3000, salary_max: 3800, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Healthcare', visa: true, accommodation: true, meals: false, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Patient support'], requirements: ['Medical support background'], benefits: ['Health coverage'], description: 'Assist nurses with daily patient care and medicine schedules.', tags: ['Healthcare', 'Nurse', 'Support'], posted: '4 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-13', title: 'Waiter/Waitress', employer_id: null, company: 'Royal Emirates Hospitality', logo: '', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Sharjah', salary: 'AED 2,500/mo', salary_min: 2500, salary_max: 3300, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Hospitality', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Table service'], requirements: ['Food service experience'], benefits: ['Tips and tips share'], description: 'Serve guests with professionalism and hospitality care.', tags: ['Waiter', 'Dining', 'Hospitality'], posted: '6 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-14', title: 'Gardener', employer_id: null, company: 'Tokyo Build Corp', logo: '', country: 'Japan', flag: '🇯🇵', city: 'Nagoya', salary: '¥210,000/mo', salary_min: 210000, salary_max: 270000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Maintenance', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Contract', working_hours: '8 hours/day', responsibilities: ['Landscape care'], requirements: ['Gardening skills'], benefits: ['Accommodation'], description: 'Maintain garden and outdoor spaces for residential estates.', tags: ['Gardener', 'Maintenance', 'Outdoor'], posted: '5 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-15', title: 'Barista', employer_id: null, company: 'Marriott International', logo: '', country: 'Qatar', flag: '🇶🇦', city: 'Al Rayyan', salary: 'QAR 2,900/mo', salary_min: 2900, salary_max: 3700, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Hospitality', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Coffee service'], requirements: ['Coffee-making experience'], benefits: ['Meal allowance'], description: 'Prepare drinks and assist café guests in high-volume service.', tags: ['Barista', 'Cafe', 'Hospitality'], posted: '7 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-16', title: 'Warehouse Supervisor', employer_id: null, company: 'Riyadh Transport Co.', logo: '', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Dammam', salary: 'SAR 4,200/mo', salary_min: 4200, salary_max: 5200, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Logistics', visa: true, accommodation: true, meals: true, insurance: true, contract: 'Permanent', working_hours: '9 hours/day', responsibilities: ['Team coordination'], requirements: ['Inventory leadership'], benefits: ['Bonus'], description: 'Coordinate picking, loading, and inventory accuracy.', tags: ['Supervisor', 'Warehouse', 'Logistics'], posted: '2 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-17', title: 'Laundry Attendant', employer_id: null, company: 'Royal Emirates Hospitality', logo: '', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Ajman', salary: 'AED 2,000/mo', salary_min: 2000, salary_max: 2600, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Facilities', visa: true, accommodation: true, meals: false, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Laundry processing'], requirements: ['Attention to detail'], benefits: ['Allowance'], description: 'Handle linen, washing, and room turnover support.', tags: ['Laundry', 'Equipment', 'Hotel'], posted: '4 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-18', title: 'Petrol Attendant', employer_id: null, company: 'Riyadh Transport Co.', logo: '', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Khobar', salary: 'SAR 2,800/mo', salary_min: 2800, salary_max: 3500, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Service', visa: true, accommodation: true, meals: false, insurance: true, contract: 'Permanent', working_hours: '9 hours/day', responsibilities: ['Fuel and customer service'], requirements: ['Customer service skills'], benefits: ['Transport support'], description: 'Support station operations and provide efficient fueling service.', tags: ['Fuel', 'Service', 'Station'], posted: '1 week ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-19', title: 'Security Guard', employer_id: null, company: 'Nairobi City Protection Ltd.', logo: '', country: 'Kenya', flag: '🇰🇪', city: 'Nairobi', salary: 'KES 32,000/mo', salary_min: 32000, salary_max: 42000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Security', visa: false, accommodation: false, meals: false, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Gate monitoring', 'Property patrols'], requirements: ['Security training', 'Discipline'], benefits: ['Transport allowance'], description: 'Protect residential and office locations with routine patrols and access control.', tags: ['Security', 'Guard', 'Nairobi'], posted: '2 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-20', title: 'Warehouse Clerk', employer_id: null, company: 'East Africa Supply Hub', logo: '', country: 'Kenya', flag: '🇰🇪', city: 'Mombasa', salary: 'KES 35,000/mo', salary_min: 35000, salary_max: 48000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Logistics', visa: false, accommodation: false, meals: true, insurance: true, contract: 'Permanent', working_hours: '9 hours/day', responsibilities: ['Inventory tracking', 'Dispatch records'], requirements: ['Computer literacy', 'Logistics experience'], benefits: ['Medical insurance'], description: 'Manage stock movement, dispatch documentation, and inventory accuracy for regional distribution.', tags: ['Warehouse', 'Logistics', 'Mombasa'], posted: '3 days ago', status: 'active', created_at: new Date().toISOString() },
  { id: 'fallback-21', title: 'Housekeeper', employer_id: null, company: 'City Stay Apartments', logo: '', country: 'Kenya', flag: '🇰🇪', city: 'Kisumu', salary: 'KES 24,000/mo', salary_min: 24000, salary_max: 32000, agent_name: null, agent_avatar: null, agent_personality: null, type: 'full-time', category: 'Hospitality', visa: false, accommodation: false, meals: false, insurance: true, contract: 'Permanent', working_hours: '8 hours/day', responsibilities: ['Room cleaning', 'Laundry handling'], requirements: ['Attention to detail', 'Reliability'], benefits: ['Annual leave'], description: 'Maintain clean, comfortable accommodation for short-stay and residential clients.', tags: ['Housekeeping', 'Cleaning', 'Hospitality'], posted: '5 days ago', status: 'active', created_at: new Date().toISOString() },
];

const companyBrandIcons: Record<string, typeof Building2> = {
  'Royal Emirates Hospitality': Building2,
  'Marriott International': Building2,
  'Samsung Electronics': Briefcase,
  'BrightCare Senior Services': HeartHandshake,
  'Riyadh Transport Co.': CarFront,
  'Tokyo Build Corp': HardHat,
};

function CompanyLogo({ company }: { company: string }) {
  const Icon = companyBrandIcons[company] ?? Briefcase;

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-sky-500 text-white shadow-lg shadow-brand-500/20">
      <Icon className="h-5 w-5" />
    </div>
  );
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { formatJobSalary } = useCurrency();

  useEffect(() => {
    supabase.from('jobs').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(18).then(({ data }) => {
      const activeJobs = (data as Job[] | null) || [];
      const mix = [...activeJobs];

      for (const fallbackJob of fallbackJobs) {
        if (mix.length >= 18) break;
        const duplicate = mix.some((job) => job.company === fallbackJob.company && job.title === fallbackJob.title);
        if (!duplicate) mix.push(fallbackJob);
      }

      const kenyaJobs = mix.filter((job) => job.country && job.country.toLowerCase().includes('kenya'));
      const nonKenyaJobs = mix.filter((job) => !job.country || !job.country.toLowerCase().includes('kenya'));
      const orderedJobs = [...kenyaJobs, ...nonKenyaJobs].slice(0, 18);

      setJobs(orderedJobs);
    });
  }, []);

  return (
    <section id="jobs" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-full mb-3">
              Top Jobs
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Top Jobs for You
            </motion.h2>
          </div>
          <Link to="/jobs" className="group flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all">
            View all jobs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <CompanyLogo company={job.company} />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{job.company}</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-brand-500" /> Verified
                    </div>
                  </div>
                </div>
                <span className="text-2xl" title={job.country}>{job.flag}</span>
              </div>

              <Link to={`/jobs/${job.id}`}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <MapPin className="w-4 h-4" /> {job.city}, {job.country}
                </div>
              </Link>

              <div className="flex flex-wrap gap-2 mb-5">
                {job.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg">{tag}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-base font-bold text-slate-900 dark:text-white">{formatJobSalary(Number.parseInt((job.salary || '').replace(/[^0-9]/g, '')) || 0, job.country)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" /> {job.contract}
                </div>
                {job.visa && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
                    <Plane className="w-3.5 h-3.5" /> Visa Sponsored
                  </div>
                )}
                {job.accommodation && (
                  <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-medium">
                    <Home className="w-3.5 h-3.5" /> Accommodation
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs text-slate-400 dark:text-slate-500">{job.posted}</span>
                <Link to={`/jobs/${job.id}`} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-700 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Apply Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
