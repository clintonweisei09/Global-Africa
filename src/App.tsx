import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import FeaturedJobs from './components/FeaturedJobs';
import JobCategories from './components/JobCategories';
import Countries from './components/Countries';
import EmployerSpotlight from './components/EmployerSpotlight';
import SuccessStories from './components/SuccessStories';
import EmployerNews from './components/EmployerNews';
import Footer from './components/Footer';
import { kenyaJobs } from './data/kenyaJobs';
import { Loader2, ShieldCheck, Clock3, Briefcase, ArrowRight, CheckCircle2, Truck } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const JobListings = lazy(() => import('./pages/JobListings'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const EmployerProfile = lazy(() => import('./pages/EmployerProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Messages = lazy(() => import('./pages/Messages'));
const Admin = lazy(() => import('./pages/Admin'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Application = lazy(() => import('./pages/Application'));

function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedJobs />
      <JobCategories />
      <Countries />
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-full mb-3">
                Top Picks
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Kenya
              </h2>
            </div>
            <Link to="/jobs?country=Kenya" className="group flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all">
              View all Kenya jobs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kenyaJobs.slice(0, 18).map((job) => {
              const Icon = [ShieldCheck, Truck, CheckCircle2, Briefcase, Clock3][Math.abs(job.title.length + job.city.length) % 5];
              return (
                <div
                  key={job.id}
                  className="group relative p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-sky-500 text-white shadow-lg shadow-brand-500/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{job.company}</div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-brand-500" /> Verified
                        </div>
                      </div>
                    </div>
                    <span className="text-xl" title="Kenya">🇰🇪</span>
                  </div>

                  <Link to={`/jobs/${job.id}`}>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                      <Briefcase className="w-3.5 h-3.5" /> {job.city}, Kenya
                    </div>
                  </Link>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg">{tag}</span>
                    ))}
                  </div>

                  <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{job.salary}</div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock3 className="w-3.5 h-3.5" /> {job.type}
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                      <Truck className="w-3.5 h-3.5" /> Local
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium col-span-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Support available
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Open now</span>
                    <Link to={`/jobs/${job.id}`} className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-700 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      Apply Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <EmployerSpotlight />
      <SuccessStories />
      <EmployerNews />
    </>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:shadow-lg">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" role="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/employers/:id" element={<EmployerProfile />} />
            <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/apply/:id" element={<ProtectedRoute><Application /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
