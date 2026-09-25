export interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  country: string;
  flag: string;
  city: string;
  salary: string;
  type: string;
  visa: boolean;
  accommodation: boolean;
  contract: string;
  posted: string;
  tags: string[];
}

export const featuredJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Housekeeper',
    company: 'Royal Emirates Hospitality',
    logo: 'RE',
    country: 'UAE',
    flag: '🇦🇪',
    city: 'Dubai',
    salary: '$1,800/mo',
    type: 'Full-time',
    visa: true,
    accommodation: true,
    contract: '2 years',
    posted: '2 days ago',
    tags: ['Housekeeping', 'Live-in'],
  },
  {
    id: 2,
    title: 'Hotel Front Desk Agent',
    company: 'Marriott International',
    logo: 'MI',
    country: 'Qatar',
    flag: '🇶🇦',
    city: 'Doha',
    salary: '$2,200/mo',
    type: 'Full-time',
    visa: true,
    accommodation: true,
    contract: '2 years',
    posted: '1 day ago',
    tags: ['Hospitality', 'Bilingual'],
  },
  {
    id: 3,
    title: 'Factory Production Worker',
    company: 'Samsung Electronics',
    logo: 'SE',
    country: 'South Korea',
    flag: '🇰🇷',
    city: 'Suwon',
    salary: '$2,500/mo',
    type: 'Full-time',
    visa: true,
    accommodation: true,
    contract: '3 years',
    posted: '3 days ago',
    tags: ['Manufacturing', 'Overtime'],
  },
  {
    id: 4,
    title: 'Live-in Caregiver',
    company: 'BrightCare Senior Services',
    logo: 'BC',
    country: 'Canada',
    flag: '🇨🇦',
    city: 'Toronto',
    salary: '$3,000/mo',
    type: 'Full-time',
    visa: true,
    accommodation: true,
    contract: '2 years',
    posted: '5 hours ago',
    tags: ['Caregiving', 'PR Pathway'],
  },
  {
    id: 5,
    title: 'Professional Driver',
    company: 'Riyadh Transport Co.',
    logo: 'RT',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    city: 'Riyadh',
    salary: '$1,600/mo',
    type: 'Full-time',
    visa: true,
    accommodation: true,
    contract: '2 years',
    posted: '1 week ago',
    tags: ['Driving', 'CDL'],
  },
  {
    id: 6,
    title: 'Construction Worker',
    company: 'Tokyo Build Corp',
    logo: 'TB',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    salary: '$2,800/mo',
    type: 'Full-time',
    visa: true,
    accommodation: true,
    contract: '3 years',
    posted: '4 days ago',
    tags: ['Construction', 'Training'],
  },
];

export interface Category {
  name: string;
  icon: string;
  jobs: number;
  color: string;
}

export const jobCategories: Category[] = [
  { name: 'Caregivers & Nursing', icon: 'HeartHandshake', jobs: 1890, color: 'from-rose-500 to-pink-500' },
  { name: 'Housemaids & Nannies', icon: 'Home', jobs: 2240, color: 'from-pink-500 to-rose-500' },
  { name: 'Cleaners', icon: 'Wind', jobs: 1560, color: 'from-teal-500 to-emerald-500' },
  { name: 'Drivers', icon: 'Car', jobs: 1130, color: 'from-amber-500 to-orange-500' },
  { name: 'Hotel & Hospitality', icon: 'Building2', jobs: 1690, color: 'from-indigo-500 to-blue-500' },
  { name: 'Factory Workers', icon: 'Factory', jobs: 1320, color: 'from-slate-500 to-gray-600' },
  { name: 'Petrol Station Attendants', icon: 'Fuel', jobs: 540, color: 'from-red-500 to-orange-500' },
  { name: 'Security Guards', icon: 'ShieldCheck', jobs: 810, color: 'from-cyan-500 to-blue-500' },
  { name: 'Chefs & Cooks', icon: 'ChefHat', jobs: 680, color: 'from-orange-500 to-red-500' },
  { name: 'Office & Admin', icon: 'Briefcase', jobs: 740, color: 'from-blue-500 to-indigo-500' },
  { name: 'Retail & Supermarket', icon: 'ShoppingCart', jobs: 920, color: 'from-green-500 to-teal-500' },
  { name: 'Beauticians & Spa', icon: 'Scissors', jobs: 380, color: 'from-purple-500 to-pink-500' },
  { name: 'Teachers & Education', icon: 'GraduationCap', jobs: 420, color: 'from-yellow-500 to-amber-500' },
  { name: 'Gardeners & Grounds', icon: 'Trees', jobs: 320, color: 'from-green-500 to-lime-500' },
];

export interface Country {
  name: string;
  flag: string;
  jobs: number;
  gradient: string;
  employers: number;
}

export const countries: Country[] = [
  { name: 'United Arab Emirates', flag: '🇦🇪', jobs: 3200, gradient: 'from-emerald-500 to-teal-600', employers: 145 },
  { name: 'Saudi Arabia', flag: '🇸🇦', jobs: 2800, gradient: 'from-green-600 to-emerald-700', employers: 120 },
  { name: 'Qatar', flag: '🇶🇦', jobs: 1900, gradient: 'from-purple-600 to-indigo-700', employers: 88 },
  { name: 'Canada', flag: '🇨🇦', jobs: 1500, gradient: 'from-red-500 to-rose-600', employers: 95 },
  { name: 'United States', flag: '🇺🇸', jobs: 1200, gradient: 'from-blue-600 to-red-600', employers: 82 },
  { name: 'United Kingdom', flag: '🇬🇧', jobs: 980, gradient: 'from-indigo-500 to-blue-700', employers: 68 },
  { name: 'Australia', flag: '🇦🇺', jobs: 860, gradient: 'from-blue-600 to-indigo-700', employers: 55 },
  { name: 'New Zealand', flag: '🇳🇿', jobs: 420, gradient: 'from-blue-500 to-teal-600', employers: 28 },
  { name: 'Germany', flag: '🇩🇪', jobs: 750, gradient: 'from-amber-500 to-yellow-600', employers: 52 },
  { name: 'France', flag: '🇫🇷', jobs: 520, gradient: 'from-blue-500 to-red-500', employers: 38 },
  { name: 'Netherlands', flag: '🇳🇱', jobs: 480, gradient: 'from-orange-500 to-red-500', employers: 32 },
  { name: 'Ireland', flag: '🇮🇪', jobs: 360, gradient: 'from-green-600 to-emerald-700', employers: 24 },
  { name: 'Norway', flag: '🇳🇴', jobs: 320, gradient: 'from-red-500 to-blue-600', employers: 20 },
  { name: 'Sweden', flag: '🇸🇪', jobs: 290, gradient: 'from-blue-500 to-yellow-500', employers: 18 },
  { name: 'Finland', flag: '🇫🇮', jobs: 240, gradient: 'from-blue-500 to-white-500', employers: 15 },
  { name: 'Denmark', flag: '🇩🇰', jobs: 220, gradient: 'from-red-500 to-white-500', employers: 14 },
  { name: 'Poland', flag: '🇵🇱', jobs: 380, gradient: 'from-red-500 to-white-500', employers: 22 },
  { name: 'Japan', flag: '🇯🇵', jobs: 900, gradient: 'from-pink-500 to-rose-600', employers: 64 },
  { name: 'South Korea', flag: '🇰🇷', jobs: 1100, gradient: 'from-blue-500 to-cyan-600', employers: 72 },
  { name: 'Singapore', flag: '🇸🇬', jobs: 650, gradient: 'from-red-500 to-red-700', employers: 42 },
  { name: 'Oman', flag: '🇴🇲', jobs: 520, gradient: 'from-green-500 to-emerald-600', employers: 35 },
  { name: 'Kuwait', flag: '🇰🇼', jobs: 410, gradient: 'from-emerald-600 to-teal-700', employers: 30 },
  { name: 'Bahrain', flag: '🇧🇭', jobs: 380, gradient: 'from-red-500 to-rose-600', employers: 28 },
];

export interface Story {
  name: string;
  role: string;
  country: string;
  flag: string;
  image: string;
  quote: string;
  rating: number;
}

export const successStories: Story[] = [
  {
    name: 'Amara Okonkwo',
    role: 'Senior Housekeeper',
    country: 'Dubai, UAE',
    flag: '🇦🇪',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    quote: 'GlobalHire Africa transformed my life. Within 3 weeks I had a verified offer in Dubai with full visa sponsorship and accommodation. I now support my family back in Lagos.',
    rating: 5,
  },
  {
    name: 'Kwame Mensah',
    role: 'Factory Worker',
    country: 'Suwon, South Korea',
    flag: '🇰🇷',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    quote: 'I was skeptical at first, but every employer on this platform is verified. Samsung hired me with a 3-year contract and I am now building a future I never thought possible.',
    rating: 5,
  },
  {
    name: 'Fatima Diallo',
    role: 'Live-in Caregiver',
    country: 'Toronto, Canada',
    flag: '🇨🇦',
    image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    quote: 'The caregiver pathway to Canadian permanent residency felt impossible until I found GlobalHire. Their team guided me through every step. I am now a PR candidate.',
    rating: 5,
  },
];

export interface NewsItem {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

export const employerNews: NewsItem[] = [
  {
    title: 'UAE Announces 50,000 New Work Visas for African Workers',
    excerpt: 'The Ministry of Human Resources unveils a major expansion of work permits targeting skilled and semi-skilled African talent across hospitality and construction sectors.',
    date: 'Jul 10, 2026',
    category: 'Policy Update',
    image: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Canada Expands Caregiver Pilot Program for 2026',
    excerpt: 'Immigration Canada opens 5,500 additional slots under the Home Child Care and Home Support Worker pilots, offering direct PR pathways for qualified applicants.',
    date: 'Jul 8, 2026',
    category: 'Immigration',
    image: 'https://images.pexels.com/photos/2638026/pexels-photo-2638026.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'South Korea Signs New Labor Agreement with 4 African Nations',
    excerpt: 'EPS-TOPIK quotas increased by 35% as Korea addresses labor shortages in manufacturing and construction with verified African recruitment partners.',
    date: 'Jul 5, 2026',
    category: 'Trade Agreement',
    image: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export interface Employer {
  name: string;
  logo: string;
  tagline: string;
  country: string;
  flag: string;
  openRoles: number;
  rating: number;
}

export const employerSpotlight: Employer[] = [
  { name: 'Marriott International', logo: 'M', tagline: 'World\'s largest hotel chain', country: 'Qatar', flag: '🇶🇦', openRoles: 42, rating: 4.9 },
  { name: 'Samsung Electronics', logo: 'S', tagline: 'Global tech manufacturing leader', country: 'South Korea', flag: '🇰🇷', openRoles: 28, rating: 4.8 },
  { name: 'BrightCare Services', logo: 'B', tagline: 'Canada\'s top caregiver agency', country: 'Canada', flag: '🇨🇦', openRoles: 35, rating: 4.9 },
  { name: 'Royal Emirates Group', logo: 'R', tagline: 'Premium hospitality employer', country: 'UAE', flag: '🇦🇪', openRoles: 56, rating: 4.7 },
];

export const stats = [
  { label: 'Available Jobs', value: 12480, suffix: '+' },
  { label: 'Countries', value: 23, suffix: '' },
  { label: 'Verified Employers', value: 690, suffix: '+' },
  { label: 'Successful Placements', value: 18500, suffix: '+' },
];
