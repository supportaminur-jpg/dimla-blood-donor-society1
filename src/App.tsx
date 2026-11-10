import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyRequestModal } from './components/EmergencyRequestModal';
import { HomePage } from './pages/HomePage';
import { DonorSearchPage } from './pages/DonorSearchPage';
import { DonorRegistrationPage } from './pages/DonorRegistrationPage';
import { BloodRequestsListPage } from './pages/BloodRequestsListPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Phone, Heart, PlusCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4 border border-red-100 dark:border-red-950">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ডিমলা ব্লাড ডোনার সোসাইটি
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              অ্যাপ্লিকেশনে একটি অপ্রত্যাশিত সমস্যা হয়েছে। পেজটি রিফ্রেশ করুন অথবা হোমপেজে ফিরে যান।
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                হোমপেজে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const VALID_TABS = ['home', 'search', 'register', 'requests', 'request-blood', 'about', 'contact', 'privacy', 'terms', 'admin'];

const getInitialTabFromLocation = (): string => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  if (VALID_TABS.includes(hash)) return hash;
  const path = window.location.pathname.replace(/^\/+/, '').split('/')[0];
  if (VALID_TABS.includes(path)) return path;
  return 'home';
};

function AppContent() {
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [currentTab, setTabState] = useState<string>(getInitialTabFromLocation);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  // Sync tab with HashRouter-style URL (#/tab) so root path "/" never breaks on refresh in Cloudflare Pages
  const setCurrentTab = (tab: string) => {
    const safeTab = VALID_TABS.includes(tab) ? tab : 'home';
    setTabState(safeTab);
    if (typeof window !== 'undefined') {
      const targetHash = safeTab === 'home' ? '#/' : `#/${safeTab}`;
      if (window.location.pathname !== '/') {
        window.history.pushState({ tab: safeTab }, '', `/${targetHash}`);
      } else if (window.location.hash !== targetHash) {
        window.history.pushState({ tab: safeTab }, '', targetHash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    // Normalize any direct subpath (e.g. /admin -> /#/admin) to preserve root "/" on refresh
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      const initialTab = getInitialTabFromLocation();
      const targetHash = initialTab === 'home' ? '#/' : `#/${initialTab}`;
      window.history.replaceState({ tab: initialTab }, '', `/${targetHash}`);
    }

    const handleRouteChange = () => {
      setTabState(getInitialTabFromLocation());
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Search parameters passed from Home to DonorSearchPage
  const [searchGroup, setSearchGroup] = useState<string>('ALL');
  const [searchUnion, setSearchUnion] = useState<string>('ALL');

  const handleSelectSearch = (group: string, union: string) => {
    setSearchGroup(group);
    setSearchUnion(union);
    setCurrentTab('search');
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            setCurrentTab={setCurrentTab}
            onSelectSearch={handleSelectSearch}
            openEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        );
      case 'search':
        return (
          <DonorSearchPage
            initialGroup={searchGroup}
            initialUnion={searchUnion}
            openEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        );
      case 'register':
        return <DonorRegistrationPage setCurrentTab={setCurrentTab} />;
      case 'requests':
        return <BloodRequestsListPage openEmergencyModal={() => setIsEmergencyModalOpen(true)} />;
      case 'request-blood':
        return <BloodRequestsListPage openEmergencyModal={() => setIsEmergencyModalOpen(true)} />;
      case 'about':
        return <AboutPage setCurrentTab={setCurrentTab} />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'admin':
        if (isAuthenticated) {
          return <AdminDashboardPage setCurrentTab={setCurrentTab} />;
        }
        return (
          <AdminLoginPage
            onLoginSuccess={() => setCurrentTab('admin')}
            setCurrentTab={setCurrentTab}
          />
        );
      default:
        return (
          <HomePage
            setCurrentTab={setCurrentTab}
            onSelectSearch={handleSelectSearch}
            openEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors font-sans w-full max-w-[100vw] overflow-x-hidden">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Emergency Request Modal */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSuccess={() => {
          setCurrentTab('requests');
        }}
      />

      {/* Floating Action Button for Mobile Hotline */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 sm:hidden">
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-full font-bold text-xs shadow-xl active:scale-95"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>রক্ত লাগবে</span>
        </button>

        <a
          href="tel:01712345678"
          className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg active:scale-95 border-2 border-white/20"
          title="জরুরি হটলাইন"
        >
          <Phone className="w-5 h-5 text-red-400" />
        </a>
      </div>

      {/* Offline Connectivity Indicator */}
      <OfflineBanner lang={lang} />
    </div>
  );
}

function OfflineBanner({ lang }: { lang: string }) {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>{lang === 'bn' ? 'অফলাইন মোড — ক্যাশড ডাটা ব্যবহৃত হচ্ছে' : 'Offline Mode — Cached data active'}</span>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
