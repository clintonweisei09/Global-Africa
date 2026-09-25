import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Smartphone, Wallet, Crown, Check, Loader2,
  Shield, Zap, ArrowLeft, Sparkles, Landmark,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { eastAfricanCountries } from '../lib/currency';

type Gateway = 'stripe' | 'paypal' | 'mpesa' | 'equity' | 'flutterwave' | 'paystack';

interface Plan {
  id: string;
  name: string;
  tier: 'applicant' | 'employer';
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'premium-applicant',
    name: 'Premium Applicant',
    tier: 'applicant',
    price: 9,
    features: ['Unlimited job applications', 'Priority AI assistant', 'CV review & optimization', 'Interview preparation', 'Document storage', 'Direct employer messaging', 'Application tracking'],
    popular: true,
  },
  {
    id: 'pro-employer',
    name: 'Pro Employer',
    tier: 'employer',
    price: 19,
    features: ['Post up to 10 jobs', 'View applicant profiles', 'Direct messaging', 'Candidate shortlisting', 'Basic analytics'],
  },
  {
    id: 'enterprise-employer',
    name: 'Enterprise Employer',
    tier: 'employer',
    price: 49,
    features: ['Unlimited job posts', 'Bulk hiring tools', 'Dedicated recruitment agent', 'Advanced analytics dashboard', 'API access', 'Priority support', 'Custom branding'],
  },
];

const gateways: { id: Gateway; name: string; icon: React.ComponentType<{ className?: string }>; color: string; description: string }[] = [
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'from-purple-600 to-indigo-600', description: 'Visa, Mastercard, Amex' },
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'from-blue-500 to-cyan-600', description: 'Pay with PayPal balance' },
  { id: 'mpesa', name: 'M-Pesa STK', icon: Smartphone, color: 'from-green-500 to-emerald-600', description: 'Safaricom STK push' },
  { id: 'equity', name: 'Equity Bank', icon: Landmark, color: 'from-red-500 to-rose-600', description: 'Equity Paybill / Bank transfer' },
  { id: 'flutterwave', name: 'Flutterwave', icon: CreditCard, color: 'from-orange-500 to-amber-600', description: 'African payment gateway' },
  { id: 'paystack', name: 'Paystack', icon: CreditCard, color: 'from-cyan-500 to-teal-600', description: 'Nigerian payment gateway' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { country, formatPrice, formatPriceWithUSD, setCountry } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [gateway, setGateway] = useState<Gateway>('mpesa');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [phone, setPhone] = useState('');
  const [equityAccount, setEquityAccount] = useState('');
  const [error, setError] = useState('');

  const finalPrice = billingCycle === 'annual' ? Math.round((selectedPlan?.price || 0) * 12 * 0.8) : selectedPlan?.price || 0;
  const localPrice = formatPriceWithUSD(finalPrice);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setError('');
  };

  const handlePay = async () => {
    if (!user || !selectedPlan) return;
    setError('');
    if (gateway === 'mpesa' && !phone) { setError('Please enter your M-Pesa phone number.'); return; }
    if (gateway === 'equity' && !equityAccount) { setError('Please enter your Equity account number.'); return; }
    if ((gateway === 'stripe' || gateway === 'flutterwave' || gateway === 'paystack') && (!cardData.number || !cardData.expiry || !cardData.cvc)) {
      setError('Please fill in all card details.'); return;
    }
    setProcessing(true);

    try {
      const { error: txError } = await supabase.from('payment_transactions').insert({
        user_id: user.id,
        user_email: user.email,
        amount: finalPrice,
        currency: 'USD',
        gateway,
        description: `${selectedPlan.name} - ${billingCycle}`,
        status: 'completed',
        reference: `${gateway}_tx_${Date.now()}`,
        platform_fee: Math.round(finalPrice * 0.10 * 100) / 100,
        employer_payout: Math.round(finalPrice * 0.90 * 100) / 100,
      });
      if (txError) throw new Error(txError.message);

      const { error: subError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan: selectedPlan.name.toLowerCase().includes('enterprise') ? 'enterprise' : selectedPlan.name.toLowerCase().includes('pro') ? 'pro' : 'premium',
        tier: selectedPlan.tier,
        billing_cycle: billingCycle,
        price: finalPrice,
        currency: 'USD',
        payment_method: gateway,
        status: 'active',
        expires_at: billingCycle === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (subError) throw new Error(subError.message);

      setProcessing(false);
      setSuccess(true);
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-brand-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Payment Successful!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You are now subscribed to <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedPlan?.name}</span> ({billingCycle}). Your subscription is active.
          </p>
          <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-950 dark:to-slate-900 pt-16 lg:pt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold mb-4">
              <Crown className="w-4 h-4" /> Premium Plans
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Upgrade Your GlobalHire Experience</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Choose a plan that fits your career or hiring goals. Cancel anytime.</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>Your currency:</span>
              <select
                value={country.code}
                onChange={(e) => setCountry(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
              >
                {eastAfricanCountries.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.currency}</option>
                ))}
              </select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border-2 transition-all ${
                  plan.popular
                    ? 'border-brand-500 bg-white dark:bg-slate-800/50 shadow-2xl shadow-brand-500/20 scale-105'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-brand-500 to-brand-700 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Crown className={`w-5 h-5 ${plan.popular ? 'text-amber-500' : 'text-slate-400'}`} />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{plan.name}</h3>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">{plan.tier}</div>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${plan.price}</span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <div className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-4">{formatPrice(plan.price)}/mo</div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 font-semibold rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-950 dark:to-slate-900 pt-16 lg:pt-20">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to plans
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold">{selectedPlan.name}</h2>
                </div>
                <p className="text-sm text-white/80">{selectedPlan.tier} plan</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold">${finalPrice}</div>
                <div className="text-sm text-white/80">{localPrice}</div>
                <div className="text-xs text-white/60">{billingCycle === 'annual' ? '/year' : '/month'}</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
              <button onClick={() => setBillingCycle('monthly')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Monthly</button>
              <button onClick={() => setBillingCycle('annual')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${billingCycle === 'annual' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Annual <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full">Save 20%</span></button>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 block">Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gateways.map((g) => {
                  const Icon = g.icon;
                  return (
                    <button key={g.id} onClick={() => setGateway(g.id)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${gateway === g.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.color} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(gateway === 'stripe' || gateway === 'flutterwave' || gateway === 'paystack') && (
                <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Card Number</label>
                    <input type="text" value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Expiry</label><input type="text" value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" /></div>
                    <div><label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">CVC</label><input type="text" value={cardData.cvc} onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })} placeholder="123" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Name on Card</label><input type="text" value={cardData.name} onChange={(e) => setCardData({ ...cardData, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" /></div>
                </motion.div>
              )}

              {gateway === 'paypal' && (
                <motion.div key="paypal" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-center"><Wallet className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-slate-700 dark:text-slate-200">You will be redirected to PayPal to complete your payment securely.</p></div>
                </motion.div>
              )}

              {gateway === 'mpesa' && (
                <motion.div key="mpesa" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400"><Smartphone className="w-5 h-5" /> M-Pesa STK Push Payment</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="flex justify-between"><span>Paybill Number:</span><span className="font-bold text-slate-900 dark:text-white">247247</span></div>
                      <div className="flex justify-between"><span>Account Number:</span><span className="font-bold text-slate-900 dark:text-white">GLOBALHIRE-{finalPrice}</span></div>
                      <div className="flex justify-between"><span>Amount:</span><span className="font-bold text-slate-900 dark:text-white">{localPrice}</span></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">M-Pesa Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You will receive an STK push prompt on your phone. Enter your M-Pesa PIN to authorize the payment.</p>
                  </div>
                </motion.div>
              )}

              {gateway === 'equity' && (
                <motion.div key="equity" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400"><Landmark className="w-5 h-5" /> Equity Bank Payment</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="flex justify-between"><span>Paybill Number:</span><span className="font-bold text-slate-900 dark:text-white">247100</span></div>
                      <div className="flex justify-between"><span>Account Number:</span><span className="font-bold text-slate-900 dark:text-white">GH-{user?.email?.slice(0, 8).toUpperCase()}</span></div>
                      <div className="flex justify-between"><span>Bank:</span><span className="font-bold text-slate-900 dark:text-white">Equity Bank Kenya</span></div>
                      <div className="flex justify-between"><span>Branch:</span><span className="font-bold text-slate-900 dark:text-white">Nairobi CBD</span></div>
                      <div className="flex justify-between"><span>Amount:</span><span className="font-bold text-slate-900 dark:text-white">{localPrice}</span></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Your Equity Account Number</label>
                    <input type="text" value={equityAccount} onChange={(e) => setEquityAccount(e.target.value)} placeholder="0011xxxxxxx" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Use Equity Paybill 247100 or visit any Equity Bank branch. Reference: your account number.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">{error}</div>}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Shield className="w-4 h-4" /> Secured with 256-bit SSL encryption. PCI DSS compliant.</div>

            <button onClick={handlePay} disabled={processing} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Zap className="w-5 h-5" /> Pay {localPrice}</>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
