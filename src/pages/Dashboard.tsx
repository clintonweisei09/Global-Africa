import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Bookmark, Send, Calendar, Plane, Bell, CreditCard,
  ShieldCheck, Fingerprint, Phone, Upload, CheckCircle2, XCircle,
  Loader2, MapPin, Briefcase, LogOut, Settings, Home, FileCheck,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Application, SavedJob, UserDocument, Notification, Payment, UserProfile, TravelDocument } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const STAGE_LABELS = [
  'Application Submitted', 'Documents Verified', 'Employer Review', 'Interview',
  'Medical', 'Visa Processing', 'Flight Booking', 'Departure', 'Arrival',
];
const STAGE_ICONS = [Send, FileCheck, Briefcase, Calendar, ShieldCheck, Plane, CreditCard, Home, CheckCircle2];

type Tab = 'overview' | 'applications' | 'documents' | 'saved' | 'notifications' | 'payments' | 'settings';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, enable2FA, enableFingerprint, refreshProfile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [travelDocs, setTravelDocs] = useState<TravelDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [appsRes, savedRes, docsRes, notifRes, payRes, travelRes] = await Promise.all([
      supabase.from('applications').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('saved_jobs').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('travel_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setApplications(appsRes.data as Application[] || []);
    setSavedJobs(savedRes.data as SavedJob[] || []);
    setDocuments(docsRes.data as UserDocument[] || []);
    setNotifications(notifRes.data as Notification[] || []);
    setPayments(payRes.data as Payment[] || []);
    setTravelDocs(travelRes.data as TravelDocument[] || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user && !authLoading) { navigate('/login'); return; }
    fetchAll();
  }, [user, authLoading, navigate, fetchAll]);

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const uploadDocument = async (type: string) => {
    if (!user) return;
    const name = prompt(`Enter ${type} file name:`);
    if (!name) return;
    const { data } = await supabase.from('documents').insert({
      user_id: user.id, type, name, status: 'pending',
    }).select('*').maybeSingle();
    if (data) setDocuments((prev) => [data as UserDocument, ...prev]);
    // Update profile completion
    const newCompletion = Math.min(100, (profile?.profile_completion ?? 0) + 10);
    await updateProfile({ profile_completion: newCompletion });
  };

  const deleteDocument = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const unsaveJob = async (jobId: string) => {
    if (!user) return;
    await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('user_id', user.id);
    setSavedJobs((prev) => prev.filter((s) => s.job_id !== jobId));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || (!user && !authLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  if (!user || !profile) return null;

  const completion = profile.profile_completion ?? 0;
  const activeApps = applications.filter((a) => a.current_stage < 8);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'applications', label: 'Applications', icon: Send, badge: activeApps.length },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'saved', label: 'Saved Jobs', icon: Bookmark, badge: savedJobs.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 mb-6 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-2xl">
                {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">{profile.full_name || 'Welcome'}</h1>
                <p className="text-brand-100">{profile.email}</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 lg:sticky lg:top-24">
              <nav className="space-y-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        tab === t.id
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {t.label}
                      {t.badge ? (
                        <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400'}`}>
                          {t.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {tab === 'overview' && <OverviewTab applications={applications} documents={documents} savedJobs={savedJobs} payments={payments} completion={completion} />}
                {tab === 'applications' && <ApplicationsTab applications={applications} />}
                {tab === 'documents' && <DocumentsTab documents={documents} uploadDocument={uploadDocument} deleteDocument={deleteDocument} travelDocs={travelDocs} user={user} onDocUpdate={(updated) => setTravelDocs(prev => prev.map(d => d.id === updated.id ? updated : d))} />}
                {tab === 'saved' && <SavedTab savedJobs={savedJobs} unsaveJob={unsaveJob} loading={loading} />}
                {tab === 'notifications' && <NotificationsTab notifications={notifications} markRead={markNotificationRead} />}
                {tab === 'payments' && <PaymentsTab payments={payments} />}
                {tab === 'settings' && <SettingsTab profile={profile} updateProfile={updateProfile} enable2FA={enable2FA} enableFingerprint={enableFingerprint} refreshProfile={refreshProfile} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewTab({ applications, documents, savedJobs, payments, completion }: {
  applications: Application[]; documents: UserDocument[]; savedJobs: SavedJob[]; payments: Payment[]; completion: number;
}) {
  const stats = [
    { label: 'Active Applications', value: applications.filter((a) => a.current_stage < 8).length, icon: Send, color: 'from-brand-500 to-brand-700' },
    { label: 'Documents Uploaded', value: documents.length, icon: FileText, color: 'from-green-500 to-emerald-600' },
    { label: 'Saved Jobs', value: savedJobs.length, icon: Bookmark, color: 'from-orange-500 to-amber-600' },
    { label: 'Total Payments', value: payments.length, icon: CreditCard, color: 'from-purple-500 to-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile completion */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Completion</h2>
          <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">{completion}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full" />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {completion < 50 ? 'Complete your profile to increase your chances of getting hired.' : completion < 100 ? 'Almost there! Upload remaining documents to reach 100%.' : 'Your profile is complete!'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Active applications preview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Application Status</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No applications yet. <Link to="/jobs" className="text-brand-600 hover:underline">Browse jobs →</Link></p>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
                  {app.job?.logo || 'J'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{app.job?.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{app.job?.company} • {STAGE_LABELS[app.current_stage]}</div>
                </div>
                <div className="text-xs font-bold text-brand-600 dark:text-brand-400">{app.current_stage + 1}/9</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Applications with timeline ---------- */
function ApplicationsTab({ applications }: { applications: Application[] }) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <Send className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Start applying to jobs to track your progress here</p>
        <Link to="/jobs" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">Browse Jobs</Link>
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shrink-0">
              {app.job?.logo || 'J'}
            </div>
            <div className="flex-1">
              <Link to={`/jobs/${app.job_id}`} className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{app.job?.title}</Link>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                {app.job?.flag} {app.job?.company} • {app.job?.city}, {app.job?.country}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 rounded-full">
                  Stage {app.current_stage + 1}/9: {STAGE_LABELS[app.current_stage]}
                </span>
              </div>
            </div>
          </div>

          {selectedApp === app.id || (selectedApp === null && app.id === applications[0].id) ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5">
              <Timeline currentStage={app.current_stage} stageDates={app.stage_dates} interviewDate={app.interview_date} />
            </motion.div>
          ) : (
            <button onClick={() => setSelectedApp(app.id)} className="mt-3 text-sm text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              View timeline →
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function Timeline({ currentStage, stageDates, interviewDate }: { currentStage: number; stageDates: Record<string, string>; interviewDate: string | null }) {
  return (
    <div className="relative pl-2">
      {STAGE_LABELS.map((label, i) => {
        const Icon = STAGE_ICONS[i];
        const isComplete = i < currentStage;
        const isCurrent = i === currentStage;
        const isFuture = i > currentStage;
        const date = stageDates[STAGE_LABELS[i].toLowerCase().replace(/ /g, '_')] || (i === 3 && interviewDate ? interviewDate : null);

        return (
          <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
            {/* Line */}
            {i < STAGE_LABELS.length - 1 && (
              <div className={`absolute left-5 top-12 w-0.5 h-full ${isComplete ? 'bg-green-500' : 'bg-slate-200 dark:bg-white/10'}`} />
            )}
            {/* Icon */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isComplete ? 'bg-green-500 text-white' :
              isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-500/20' :
              'bg-slate-100 dark:bg-white/5 text-slate-400'
            }`}>
              {isComplete ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
            </div>
            {/* Content */}
            <div className={`pt-1.5 ${isFuture ? 'opacity-40' : ''}`}>
              <div className={`font-semibold text-sm ${isComplete ? 'text-green-600 dark:text-green-400' : isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                {label}
              </div>
              {date && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>}
              {isCurrent && <div className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">In progress...</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Documents ---------- */
function DocumentsTab({ documents, uploadDocument, deleteDocument, travelDocs, user, onDocUpdate }: {
  documents: UserDocument[]; uploadDocument: (type: string) => void; deleteDocument: (id: string) => void; travelDocs: TravelDocument[]; user: any; onDocUpdate: (doc: TravelDocument) => void;
}) {
  const [paying, setPaying] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
  const docTypes = ['Resume', 'Passport', 'Birth Certificate', 'Medical Certificate', 'Police Clearance', 'Education Certificate'];
  const triggerMpesaStkPush = async ({
    phone,
    amount,
    description,
    reference,
  }: {
    phone?: string;
    amount: number;
    description: string;
    reference: string;
  }) => {
    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: { phone, amount, description, reference },
    });
    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error || 'Unable to start the M-Pesa STK push.');
  };

  const handlePay = async (doc: TravelDocument) => {
    setPaying(doc.id);
    try {
      const totalFee = doc.document_type === 'passport' ? 7550 : Math.round((doc.fee_amount / 100) + 49);
      const paymentReference = `${doc.document_type}_dl_${Date.now()}`;

      const { data: currentDocument, error: documentError } = await supabase.from('travel_documents').select('*').eq('id', doc.id).single();
      if (!documentError && currentDocument) {
        await supabase.from('payments').insert({
          user_id: user.id,
          description: `${doc.document_type} document fee + access fee — ${doc.document_number}`,
          amount: totalFee.toString() as any,
          currency: 'USD',
          status: 'pending',
          method: 'mpesa',
        });
        await triggerMpesaStkPush({
          phone: user.phone || user.recovery_phone || '',
          amount: totalFee,
          description: `${doc.document_type} fee + access fee - ${doc.document_number}`,
          reference: paymentReference,
        });
        onDocUpdate(currentDocument as TravelDocument);
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
    setPaying(null);
  };

  const handleDownload = (doc: TravelDocument) => {
    const content = generateDocumentContent(doc);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.document_type}_${doc.document_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    supabase.from('travel_documents').update({ status: 'downloaded' }).eq('id', doc.id);
  };

  return (
    <div className="space-y-6">
      {/* Travel Documents (auto-generated) */}
      {travelDocs.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 dark:from-brand-500/10 dark:to-cyan-500/10 border border-brand-200 dark:border-brand-500/20">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Plane className="w-5 h-5 text-brand-600" /> Travel Documents ({travelDocs.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            These documents were auto-generated when you applied for a job. Pay the required fee to unlock download and printing.
          </p>
          <div className="space-y-3">
            {travelDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${doc.document_type === 'visa' ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
                  {doc.document_type === 'visa' ? <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{doc.document_type} — {doc.country}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{doc.document_number} • {doc.full_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Issued: {new Date(doc.issue_date).toLocaleDateString()}</div>
                </div>
                <div className="text-right shrink-0">
                  {doc.status === 'paid' || doc.status === 'downloaded' ? (
                    <button onClick={() => handleDownload(doc)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      Download
                    </button>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Pay {doc.document_type === 'passport' ? formatPrice(7550 / 129) : '$150'} & Download</div>
                      <button
                        onClick={() => handlePay(doc)}
                        disabled={paying === doc.id}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
                      >
                        {paying === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay ${doc.document_type === 'passport' ? formatPrice(7550 / 129) : '$150'} & Download`}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upload Documents</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {docTypes.map((type) => (
            <button key={type} onClick={() => uploadDocument(type)} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition-all">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center">{type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Uploaded Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{doc.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{doc.type} • {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  doc.status === 'verified' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                  doc.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                }`}>{doc.status}</span>
                <button onClick={() => deleteDocument(doc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function generateDocumentContent(doc: TravelDocument): string {
  const isVisa = doc.document_type === 'visa';
  const title = isVisa ? 'WORK VISA' : 'PASSPORT';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} — ${doc.document_number}</title>
<style>
body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
.header { text-align: center; border-bottom: 3px solid #1a4d80; padding-bottom: 20px; margin-bottom: 30px; }
.header h1 { font-size: 28px; color: #1a4d80; margin: 0; }
.header .country { font-size: 18px; margin-top: 5px; }
.doc-number { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
.info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ddd; }
.info-label { font-weight: bold; color: #555; }
.footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 2px solid #ddd; padding-top: 15px; }
.seal { width: 80px; height: 80px; border: 3px solid #1a4d80; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 20px auto; font-size: 10px; font-weight: bold; color: #1a4d80; text-align: center; }
</style></head><body>
<div class="header"><h1>${title}</h1><div class="country">${doc.country}</div></div>
<div class="doc-number">${doc.document_number}</div>
<div class="info-row"><span class="info-label">Full Name:</span><span>${doc.full_name}</span></div>
<div class="info-row"><span class="info-label">Document Type:</span><span>${isVisa ? 'Work Visa' : 'Passport'}</span></div>
<div class="info-row"><span class="info-label">Country:</span><span>${doc.country}</span></div>
<div class="info-row"><span class="info-label">Issue Date:</span><span>${new Date(doc.issue_date).toLocaleDateString()}</span></div>
<div class="info-row"><span class="info-label">Expiry Date:</span><span>${doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Status:</span><span>${doc.status.toUpperCase()}</span></div>
<div class="seal">OFFICIAL<br>SEAL</div>
<div class="footer"><p>This is a computer-generated document from GlobalHire. Verify authenticity at globalhire.com/verify/${doc.document_number}</p></div>
</body></html>`;
}

/* ---------- Saved Jobs ---------- */
function SavedTab({ savedJobs, unsaveJob, loading }: { savedJobs: SavedJob[]; unsaveJob: (id: string) => void; loading: boolean }) {
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;

  if (savedJobs.length === 0) {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No saved jobs</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Bookmark jobs to save them for later</p>
        <Link to="/jobs" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {savedJobs.map((saved) => (
        <div key={saved.id} className="group p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-3">
            <Link to={`/jobs/${saved.job_id}`} className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">{saved.job?.logo}</div>
                <span className="text-xl">{saved.job?.flag}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{saved.job?.title}</h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> {saved.job?.city}, {saved.job?.country}</div>
            </Link>
            <button onClick={() => unsaveJob(saved.job_id)} className="text-brand-600 dark:text-brand-400 p-1">
              <Bookmark className="w-5 h-5 fill-current" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">{saved.job?.salary}</span>
            <Link to={`/jobs/${saved.job_id}`} className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">View</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Notifications ---------- */
function NotificationsTab({ notifications, markRead }: { notifications: Notification[]; markRead: (id: string) => void }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-20">
        <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No notifications</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${n.read ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10' : 'bg-brand-50/50 dark:bg-brand-500/5 border-brand-200 dark:border-brand-500/20'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-100 dark:bg-green-500/20' : n.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-brand-100 dark:bg-brand-500/20'}`}>
            {n.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : n.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-600" /> : <Bell className="w-5 h-5 text-brand-600" />}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
            <div className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">Mark read</button>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Payments ---------- */
function PaymentsTab({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-20">
        <CreditCard className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No payment history</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Your payment transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20' : 'bg-yellow-100 dark:bg-yellow-500/20'}`}>
            <CreditCard className={`w-5 h-5 ${p.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.description}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • {p.method}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900 dark:text-white">${p.amount} {p.currency}</div>
            <span className={`text-xs font-bold ${p.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{p.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsTab({ profile, updateProfile, enable2FA, enableFingerprint, refreshProfile }: {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  enable2FA: () => Promise<{ error: string | null }>;
  enableFingerprint: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [recoveryPhone, setRecoveryPhone] = useState(profile.recovery_phone || '');
  const [profession, setProfession] = useState(profile.profession || '');
  const [country, setCountry] = useState(profile.country || '');
  const [city, setCity] = useState(profile.city || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [experience, setExperience] = useState(profile.experience_years || 0);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const completion = Math.min(100, 15 + (fullName ? 10 : 0) + (phone ? 10 : 0) + (profession ? 10 : 0) + (country ? 10 : 0) + (bio ? 10 : 0) + (experience ? 5 : 0) + (city ? 5 : 0));
    const { error } = await updateProfile({ full_name: fullName, phone, recovery_phone: recoveryPhone, profession, country, city, bio, experience_years: experience, profile_completion: completion });
    setSaving(false);
    if (!error) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={fullName} onChange={setFullName} />
          <Input label="Phone" value={phone} onChange={setPhone} />
          <Input label="Recovery Phone" value={recoveryPhone} onChange={setRecoveryPhone} />
          <Input label="Profession" value={profession} onChange={setProfession} />
          <Input label="Country" value={country} onChange={setCountry} />
          <Input label="City" value={city} onChange={setCity} />
          <Input label="Experience (years)" value={String(experience)} onChange={(v) => setExperience(parseInt(v) || 0)} type="number" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell employers about yourself..." className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50 resize-none" />
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {savedMsg ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* 2FA settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security & Two-Factor Authentication</h2>
        <div className="space-y-3">
          <ToggleRow
            icon={Fingerprint}
            title="Fingerprint Authentication"
            desc="Use biometric verification to log in"
            enabled={profile.fingerprint_enabled}
            onToggle={async () => { await enableFingerprint(); await refreshProfile(); }}
          />
          <ToggleRow
            icon={Phone}
            title="Recovery Phone 2FA"
            desc={`SMS codes sent to ${profile.recovery_phone || 'your recovery phone'}`}
            enabled={profile.two_factor_enabled}
            onToggle={async () => { await enable2FA(); await refreshProfile(); }}
          />
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50" />
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, enabled, onToggle }: {
  icon: React.ComponentType<{ className?: string }>; title: string; desc: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-green-100 dark:bg-green-500/20' : 'bg-slate-200 dark:bg-white/10'}`}>
        <Icon className={`w-5 h-5 ${enabled ? 'text-green-600' : 'text-slate-400'}`} />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-900 dark:text-white text-sm">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{desc}</div>
      </div>
      <button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
