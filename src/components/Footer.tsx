import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Youtube, BellRing, Sparkles } from 'lucide-react';

interface LinkItem {
  label: string;
  to: string;
  external?: boolean;
}

const footerLinks: Record<string, LinkItem[]> = {
  'For Job Seekers': [
    { label: 'Browse Jobs', to: '/jobs' },
    { label: 'Search by Country', to: '/#countries' },
    { label: 'Visa Guide', to: '/#countries' },
    { label: 'Career Resources', to: '/#success-stories' },
    { label: 'Success Stories', to: '/#success-stories' },
  ],
  'For Employers': [
    { label: 'Post a Job', to: '/register' },
    { label: 'Pricing', to: '/checkout' },
    { label: 'Talent Search', to: '/jobs' },
    { label: 'Verification', to: '/#employers' },
    { label: 'Employer FAQ', to: '/#employers' },
  ],
  'Company': [
    { label: 'About Us', to: '/#about' },
    { label: 'Our Mission', to: '/#about' },
    { label: 'Press & Media', to: '/#about' },
    { label: 'Partnerships', to: '/#employers' },
    { label: 'Careers at GlobalHire', to: '/jobs' },
  ],
  'Support': [
    { label: 'Help Center', to: '/#contact' },
    { label: 'Contact Us', to: '/#contact' },
    { label: 'Privacy Policy', to: '/#contact' },
    { label: 'Terms of Service', to: '/#contact' },
    { label: 'Cookie Policy', to: '/#contact' },
  ],
};

const socials = [
  { icon: Facebook, label: 'Facebook', url: 'https://facebook.com' },
  { icon: Twitter, label: 'Twitter', url: 'https://twitter.com' },
  { icon: Instagram, label: 'Instagram', url: 'https://instagram.com' },
  { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
  { icon: Youtube, label: 'YouTube', url: 'https://youtube.com' },
];

function FooterLink({ item, onClick }: { item: LinkItem; onClick: () => void }) {
  if (item.to.startsWith('/#')) {
    return (
      <a href={item.to} onClick={onClick} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.to} onClick={onClick} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">
      {item.label}
    </Link>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer id="contact" className="relative bg-slate-950 text-slate-300 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 p-7 shadow-[0_25px_80px_rgba(124,58,237,0.35)] lg:p-10 mb-16"
        >
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute bottom-0 left-12 h-32 w-32 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_35%)]" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-50 backdrop-blur-sm">
                <BellRing className="w-3.5 h-3.5" /> Weekly alerts
              </div>
              <h3 className="text-2xl lg:text-4xl font-black tracking-tight text-white">Never Miss a Job Opportunity</h3>
              <p className="mt-3 text-sm lg:text-base text-orange-50/90">Get fresh verified roles, visa updates, and relocation insights delivered straight to your inbox.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex w-full max-w-lg lg:w-auto gap-3 rounded-2xl border border-white/15 bg-slate-950/18 p-2 shadow-lg shadow-violet-900/20 backdrop-blur-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/95 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-500 outline-none ring-0 focus:bg-white"
              />
              <button type="submit" className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/40 transition-all hover:-translate-y-0.5 hover:bg-slate-900">
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                {!subscribed && <Sparkles className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
                <Globe2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white">GlobalHire</span>
                <span className="text-[11px] font-semibold tracking-widest text-brand-400 uppercase">Africa</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-5">Connecting African talent with verified international employers. Your trusted gateway to global career opportunities.</p>
            <div className="space-y-2 text-sm">
              <a href="mailto:hello@globalhire.africa" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors"><Mail className="w-4 h-4" /> hello@globalhire.africa</a>
              <a href="tel:+254700000000" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors"><Phone className="w-4 h-4" /> +254 700 000 000</a>
              <div className="flex items-center gap-2 text-slate-400"><MapPin className="w-4 h-4" /> Nairobi, Kenya</div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink item={link} onClick={() => {}} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-sm text-slate-500">© 2026 GlobalHire Africa. All rights reserved.</p>
            <p className="text-xs text-slate-400">Designed by Clinton weisei</p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-600 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:-translate-y-0.5"
                >
                  <Icon className="w-4.5 h-4.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
