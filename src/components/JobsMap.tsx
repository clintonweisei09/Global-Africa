import { motion } from 'framer-motion';
import { MapPin, Briefcase, X } from 'lucide-react';
import { useState } from 'react';

interface MapJob {
  id: number;
  title: string;
  company: string;
  country: string;
  flag: string;
  city: string;
  lat: number;
  lng: number;
  salary: string;
  jobs: number;
}

const mapJobs: MapJob[] = [
  { id: 1, title: 'Housemaid', company: 'Royal Emirates Hospitality', country: 'UAE', flag: '🇦🇪', city: 'Dubai', lat: 25.2, lng: 55.27, salary: '$1,500/mo', jobs: 3200 },
  { id: 2, title: 'Factory Worker', company: 'Samsung Electronics', country: 'South Korea', flag: '🇰🇷', city: 'Suwon', lat: 37.26, lng: 127.03, salary: '$2,500/mo', jobs: 1100 },
  { id: 3, title: 'Live-in Caregiver', company: 'BrightCare Services', country: 'Canada', flag: '🇨🇦', city: 'Toronto', lat: 43.65, lng: -79.38, salary: '$3,000/mo', jobs: 1500 },
  { id: 4, title: 'Hotel Front Desk Agent', company: 'Sheraton', country: 'Qatar', flag: '🇶🇦', city: 'Doha', lat: 25.28, lng: 51.52, salary: '$1,700/mo', jobs: 1900 },
  { id: 5, title: 'Dishwasher', company: 'Doutor Coffee', country: 'Japan', flag: '🇯🇵', city: 'Osaka', lat: 34.69, lng: 135.5, salary: '$2,200/mo', jobs: 900 },
  { id: 6, title: 'Professional Driver', company: 'Riyadh Transport', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Riyadh', lat: 24.71, lng: 46.68, salary: '$1,600/mo', jobs: 2800 },
  { id: 7, title: 'Registered Nurse', company: 'Royal Melbourne Hospital', country: 'Australia', flag: '🇦🇺', city: 'Melbourne', lat: -37.81, lng: 144.96, salary: '$4,500/mo', jobs: 860 },
  { id: 8, title: 'Factory Worker', company: 'Siemens', country: 'Germany', flag: '🇩🇪', city: 'Munich', lat: 48.14, lng: 11.58, salary: '$3,200/mo', jobs: 750 },
  { id: 9, title: 'Beautician', company: 'Shangri-La Spa', country: 'Singapore', flag: '🇸🇬', city: 'Singapore', lat: 1.35, lng: 103.82, salary: '$1,800/mo', jobs: 650 },
  { id: 10, title: 'Private Cook', company: 'Royal Family', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Jeddah', lat: 21.49, lng: 39.19, salary: '$2,000/mo', jobs: 1200 },
  { id: 11, title: 'Barista', company: 'Costa Coffee', country: 'United Kingdom', flag: '🇬🇧', city: 'London', lat: 51.51, lng: -0.13, salary: '$2,600/mo', jobs: 980 },
  { id: 12, title: 'Chef', company: 'Hilton Hotels', country: 'Bahrain', flag: '🇧🇭', city: 'Manama', lat: 26.23, lng: 50.59, salary: '$2,000/mo', jobs: 380 },
  { id: 13, title: 'Security Guard', company: 'G4S Security', country: 'Oman', flag: '🇴🇲', city: 'Muscat', lat: 23.59, lng: 58.38, salary: '$1,400/mo', jobs: 520 },
  { id: 14, title: 'Cashier', company: 'Carrefour', country: 'Kuwait', flag: '🇰🇼', city: 'Kuwait City', lat: 29.38, lng: 47.97, salary: '$1,300/mo', jobs: 410 },
  { id: 15, title: 'Office Assistant', company: 'KPMG', country: 'Norway', flag: '🇳🇴', city: 'Oslo', lat: 59.91, lng: 10.75, salary: '$3,400/mo', jobs: 320 },
  { id: 16, title: 'Early Childhood Educator', company: 'Bright Horizons', country: 'Canada', flag: '🇨🇦', city: 'Vancouver', lat: 49.28, lng: -123.12, salary: '$3,800/mo', jobs: 1500 },
  { id: 17, title: 'Data Entry Clerk', company: 'Accenture', country: 'Finland', flag: '🇫🇮', city: 'Helsinki', lat: 60.17, lng: 24.94, salary: '$3,000/mo', jobs: 240 },
  { id: 18, title: 'Receptionist', company: 'Deloitte', country: 'Poland', flag: '🇵🇱', city: 'Warsaw', lat: 52.23, lng: 21.01, salary: '$2,200/mo', jobs: 380 },
  { id: 19, title: 'Supermarket Assistant', company: 'Lidl', country: 'Germany', flag: '🇩🇪', city: 'Berlin', lat: 52.52, lng: 13.4, salary: '$2,600/mo', jobs: 750 },
  { id: 20, title: 'Storekeeper', company: 'IKEA', country: 'Netherlands', flag: '🇳🇱', city: 'Amsterdam', lat: 52.37, lng: 4.9, salary: '$2,900/mo', jobs: 480 },
  { id: 21, title: 'Hairdresser', company: 'Toni & Guy', country: 'United Kingdom', flag: '🇬🇧', city: 'London', lat: 51.51, lng: -0.13, salary: '$3,000/mo', jobs: 980 },
  { id: 22, title: 'Baker', company: 'Copenhagen Bakery', country: 'Denmark', flag: '🇩🇰', city: 'Copenhagen', lat: 55.68, lng: 12.57, salary: '$3,200/mo', jobs: 220 },
  { id: 23, title: 'Customer Service Rep', company: 'Vodafone', country: 'Australia', flag: '🇦🇺', city: 'Sydney', lat: -33.87, lng: 151.21, salary: '$3,800/mo', jobs: 860 },
  { id: 24, title: 'University Lecturer', company: 'University of Auckland', country: 'New Zealand', flag: '🇳🇿', city: 'Auckland', lat: -36.85, lng: 174.76, salary: '$5,500/mo', jobs: 420 },
  { id: 25, title: 'Special Needs Teacher', company: 'Dubai Education Council', country: 'UAE', flag: '🇦🇪', city: 'Dubai', lat: 25.2, lng: 55.27, salary: '$3,200/mo', jobs: 3200 },
  { id: 26, title: 'Security Guard', company: 'Securitas', country: 'Sweden', flag: '🇸🇪', city: 'Stockholm', lat: 59.33, lng: 18.07, salary: '$2,800/mo', jobs: 290 },
  { id: 27, title: 'Administrative Assistant', company: 'Ernst & Young', country: 'New Zealand', flag: '🇳🇿', city: 'Auckland', lat: -36.85, lng: 174.76, salary: '$3,600/mo', jobs: 420 },
  { id: 28, title: 'Petrol Station Attendant', company: 'Shell', country: 'Oman', flag: '🇴🇲', city: 'Muscat', lat: 23.59, lng: 58.38, salary: '$1,100/mo', jobs: 520 },
  { id: 29, title: 'Truck Driver', company: 'Eddie Stobart', country: 'United Kingdom', flag: '🇬🇧', city: 'Liverpool', lat: 53.4, lng: -2.99, salary: '$3,400/mo', jobs: 980 },
  { id: 30, title: 'Catering Assistant', company: 'Sodexo', country: 'Ireland', flag: '🇮🇪', city: 'Dublin', lat: 53.35, lng: -6.26, salary: '$2,600/mo', jobs: 360 },
];

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export default function JobsMap() {
  const [selected, setSelected] = useState<MapJob | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 1000;
  const H = 500;

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold mb-4">
            <MapPin className="w-4 h-4" /> Live Job Map
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Jobs Across the Globe</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Explore verified job opportunities in 23+ countries. Click any pin to see available positions.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900">
          <div className="relative w-full" style={{ aspectRatio: '2 / 1' }}>
            {/* Realistic world map using detailed SVG paths */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                {/* Ocean gradient */}
                <radialGradient id="ocean" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="100%" stopColor="#0f1e33" />
                </radialGradient>
                {/* Land gradient */}
                <linearGradient id="land" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2d5a3d" />
                  <stop offset="100%" stopColor="#1a3d28" />
                </linearGradient>
                <linearGradient id="landHover" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3d7a4d" />
                  <stop offset="100%" stopColor="#2a5d38" />
                </linearGradient>
                {/* Glow filter for pins */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ocean background */}
              <rect width="1000" height="500" fill="url(#ocean)" />

              {/* Latitude/longitude grid */}
              <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="0.5">
                {Array.from({ length: 19 }, (_, i) => {
                  const x = (i / 18) * 1000;
                  return <line key={`v${i}`} x1={x} y1="0" x2={x} y2="500" />;
                })}
                {Array.from({ length: 9 }, (_, i) => {
                  const y = (i / 8) * 500;
                  return <line key={`h${i}`} x1="0" y1={y} x2="1000" y2={y} />;
                })}
              </g>

              {/* Equator line */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="4 4" />

              {/* Detailed continent paths - approximate but recognizable world map shapes */}
              {/* North America */}
              <path d="M 80,80 Q 120,60 180,70 L 240,80 Q 280,90 300,120 L 310,150 Q 300,180 270,200 L 240,220 Q 200,230 180,220 L 150,210 Q 120,200 100,180 L 80,150 Q 70,120 80,80 Z M 60,180 Q 80,190 100,200 L 120,220 Q 100,230 80,225 L 60,210 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Greenland */}
              <path d="M 320,40 Q 360,30 390,50 L 400,80 Q 380,100 350,95 L 330,80 Q 315,60 320,40 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* South America */}
              <path d="M 260,260 Q 290,250 310,270 L 320,310 Q 310,360 290,390 L 270,410 Q 250,400 245,370 L 240,320 Q 245,280 260,260 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Europe */}
              <path d="M 470,100 Q 510,90 540,100 L 560,120 Q 555,140 530,150 L 500,145 Q 480,140 470,120 L 465,110 Z M 460,120 Q 470,130 480,140 L 470,150 Q 455,145 450,130 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Africa */}
              <path d="M 480,170 Q 520,160 560,170 L 580,200 Q 575,250 560,290 L 540,330 Q 510,350 490,340 L 475,310 Q 465,270 470,230 L 475,190 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Middle East / Arabian Peninsula */}
              <path d="M 560,160 Q 590,155 610,170 L 620,195 Q 610,210 590,205 L 570,195 Q 555,180 560,160 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Asia (Russia + Central Asia) */}
              <path d="M 560,80 Q 650,70 750,80 L 820,90 Q 850,110 840,130 L 800,140 Q 750,145 700,140 L 620,135 Q 580,130 565,110 L 555,95 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* India */}
              <path d="M 680,170 Q 710,165 725,180 L 730,215 Q 720,235 705,240 L 690,230 Q 675,210 680,185 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Southeast Asia */}
              <path d="M 750,180 Q 780,175 800,190 L 810,215 Q 800,230 780,225 L 760,210 Q 745,200 750,185 Z M 770,235 Q 790,240 800,255 L 790,270 Q 775,265 770,250 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Japan */}
              <path d="M 850,140 Q 865,135 870,150 L 865,165 Q 855,170 850,160 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* South Korea */}
              <path d="M 835,145 Q 845,142 848,155 L 843,165 Q 838,162 835,155 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Australia */}
              <path d="M 800,310 Q 850,300 890,315 L 900,345 Q 880,365 850,360 L 820,355 Q 800,345 795,330 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* New Zealand */}
              <path d="M 910,370 Q 925,365 930,380 L 925,395 Q 915,398 910,388 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Singapore (small dot) */}
              <circle cx="790" cy="250" r="3" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Iceland */}
              <path d="M 430,75 Q 445,70 455,85 L 450,95 Q 440,98 430,90 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* UK / Ireland */}
              <path d="M 455,100 Q 465,95 470,110 L 468,125 Q 458,128 453,118 Z M 448,115 Q 453,118 452,125 L 448,128 Q 445,125 446,120 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />

              {/* Scandinavia */}
              <path d="M 500,70 Q 530,65 550,80 L 545,105 Q 525,110 510,100 L 498,85 Z" fill="url(#land)" stroke="#3a6a4a" strokeWidth="0.5" />
            </svg>

            {/* Job pins overlay */}
            <div className="absolute inset-0">
              {mapJobs.map((job, i) => {
                const { x, y } = latLngToXY(job.lat, job.lng, W, H);
                const pctX = (x / W) * 100;
                const pctY = (y / H) * 100;
                const isSelected = selected?.id === job.id;
                const isHovered = hovered === job.id;
                return (
                  <motion.button
                    key={job.id}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
                    onClick={() => setSelected(job)}
                    onMouseEnter={() => setHovered(job.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="absolute group"
                    style={{ left: `${pctX}%`, top: `${pctY}%`, transform: 'translate(-50%, -100%)', zIndex: isSelected ? 30 : isHovered ? 20 : 10 }}
                  >
                    {/* Pin */}
                    <div className="relative">
                      <div
                        className={`rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 cursor-pointer group-hover:scale-125 transition-all ${isSelected ? 'scale-125 w-9 h-9' : 'w-7 h-7 sm:w-8 sm:h-8'} bg-gradient-to-br from-brand-500 to-brand-700`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                      >
                        <span className="text-white text-sm">{job.flag}</span>
                      </div>
                      {/* Pulse ring */}
                      <span className="absolute inset-0 rounded-full bg-brand-500/40 animate-ping group-hover:animate-none" style={{ animationDuration: '2s' }} />
                    </div>
                    {/* Label on hover */}
                    <div className={`absolute left-1/2 -translate-x-1/2 -top-9 transition-all pointer-events-none whitespace-nowrap ${isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0'}`}>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10">
                        {job.city}, {job.country}
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Subtle ocean texture overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.1) 0%, transparent 50%)' }} />
          </div>

          {/* Legend bar */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/10">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 border border-white/30" />
              <span className="text-xs font-medium text-white">{mapJobs.length} job locations</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-medium text-white/80">Click pins to explore</span>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/10">
              <div className="text-xs text-white/60">Countries</div>
              <div className="text-lg font-bold text-white">{new Set(mapJobs.map((j) => j.country)).size}</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/10">
              <div className="text-xs text-white/60">Total Jobs</div>
              <div className="text-lg font-bold text-white">{mapJobs.reduce((s, j) => s + j.jobs, 0).toLocaleString()}</div>
            </div>
          </div>
        </motion.div>

        {/* Selected job popup */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-2xl">{selected.flag}</div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">{selected.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selected.company} - {selected.city}, {selected.country}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-sm font-semibold"><Briefcase className="w-4 h-4" /> {selected.jobs} open positions</div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 text-sm font-semibold">{selected.salary}</div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
