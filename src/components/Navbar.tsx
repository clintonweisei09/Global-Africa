import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, Menu, X, Sun, Moon, LogOut, LayoutDashboard, Shield, Coins } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency, eastAfricanCountries } from '../context/CurrencyContext';

const navLinks: { label: string; href: string; icon?: any }[] = [
  { label: 'Jobs', href: '/jobs' },
  { label: 'AI Assistant', href: '/assistant' },
  { label: 'Messages', href: '/messages' },
  { label: 'Countries', href: '/#countries' },
  { label: 'Employers', href: '/#employers' },
  { label: 'Success Stories', href: '/#stories' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { country, setCountry } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.includes('/#')) {
      const [path, hash] = href.split('/#');
      if (window.location.pathname !== path) {
        navigate(path);
        setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass dark:glass-dark shadow-lg shadow-black/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">GlobalHire</span>
                <span className="text-[11px] font-semibold tracking-widest text-brand-600 dark:text-brand-400 uppercase">Africa</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-white/5 transition-all"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={country.code}
                  onChange={(e) => setCountry(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 outline-none hover:border-brand-400 dark:hover:border-brand-500/40 transition-colors cursor-pointer"
                  title="Select your currency"
                >
                  {eastAfricanCountries.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.currency}</option>
                  ))}
                </select>
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" aria-label="Toggle theme">
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div key="moon" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Login</Link>
                  <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all">Register</Link>
                </>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <div className="relative">
                <Coins className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={country.code}
                  onChange={(e) => setCountry(e.target.value)}
                  className="pl-7 pr-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 outline-none cursor-pointer"
                >
                  {eastAfricanCountries.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.currency}</option>
                  ))}
                </select>
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 lg:top-20 left-0 right-0 z-40 lg:hidden glass dark:glass-dark border-t border-slate-200/50 dark:border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button key={link.label} onClick={() => handleNavClick(link.href)} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-brand-50 dark:hover:bg-white/5">
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-200/50 dark:border-white/10 flex gap-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-white/10">Dashboard</Link>
                    <button onClick={handleSignOut} className="flex-1 text-center px-4 py-3 text-sm font-semibold text-red-600 rounded-xl border border-red-200 dark:border-red-500/30">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-white/10">Login</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
