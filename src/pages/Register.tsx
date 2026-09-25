import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Fingerprint, Check, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eastAfricanCountries } from '../lib/currency';

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [country, setCountry] = useState('UG');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | '2fa-setup' | 'success'>('form');
  const [twoFactorChoice, setTwoFactorChoice] = useState<'fingerprint' | 'phone' | null>(null);

  const normalizePhoneInput = (value: string) => value.replace(/\D/g, '').slice(0, 10);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedPhone = normalizePhoneInput(recoveryPhone);
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError('Phone number must be 10 digits without the country code.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, normalizedPhone, country);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setStep('2fa-setup');
  };

  const handle2FASetup = (method: 'fingerprint' | 'phone') => {
    setTwoFactorChoice(method);
    setTimeout(() => setStep('success'), 1500);
  };

  const handleSkip = () => setStep('success');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-brand-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
      <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="glass dark:glass-dark rounded-3xl p-8 shadow-2xl shadow-brand-500/10">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Globe2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white">GlobalHire</span>
                <span className="text-[11px] font-semibold tracking-widest text-brand-600 dark:text-brand-400 uppercase">Africa</span>
              </div>
            </Link>
          </div>

          {step === 'form' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Start your international career journey</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <InputField icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="John Doe" />
                <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <InputField icon={Phone} label="Recovery Phone" type="tel" value={recoveryPhone} onChange={(value) => setRecoveryPhone(normalizePhoneInput(value))} placeholder="700000000" />
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Country (determines your currency)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50 appearance-none"
                    >
                      {eastAfricanCountries.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.currency})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">Sign in</Link>
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                <span className="text-xs text-slate-400">or sign up with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={async () => { setError(''); const { error } = await signInWithGoogle(); if (error) setError(error); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={async () => { setError(''); const { error } = await signInWithLinkedIn(); if (error) setError(error); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43c-1.14 0-2.06-.93-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.13-.92 2.06-2.06 2.06zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                  LinkedIn
                </button>
              </div>
            </motion.div>
          )}

          {step === '2fa-setup' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Your Account</h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Set up two-factor authentication for extra security</p>

              <div className="space-y-3">
                <button
                  onClick={() => handle2FASetup('fingerprint')}
                  disabled={!!twoFactorChoice}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition-all text-left disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center ${twoFactorChoice === 'fingerprint' ? 'animate-pulse' : ''}`}>
                    {twoFactorChoice === 'fingerprint' ? <Check className="w-6 h-6 text-white" /> : <Fingerprint className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Fingerprint Authentication</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Use biometric verification on your device</div>
                  </div>
                </button>

                <button
                  onClick={() => handle2FASetup('phone')}
                  disabled={!!twoFactorChoice}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition-all text-left disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ${twoFactorChoice === 'phone' ? 'animate-pulse' : ''}`}>
                    {twoFactorChoice === 'phone' ? <Check className="w-6 h-6 text-white" /> : <Phone className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Recovery Phone ({recoveryPhone || 'not set'})</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Receive SMS codes to your recovery phone</div>
                  </div>
                </button>
              </div>

              <button onClick={handleSkip} className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                Skip for now →
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Created!</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {twoFactorChoice ? `2FA enabled via ${twoFactorChoice}. ` : ''}Welcome to GlobalHire Africa.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Continue to Login
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50"
        />
      </div>
    </div>
  );
}
