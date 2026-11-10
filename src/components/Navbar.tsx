import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Heart, Droplet, Menu, X, Sun, Moon, ShieldCheck, PlusCircle, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openEmergencyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openEmergencyModal }) => {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'search', label: t('find_donors') },
    { id: 'requests', label: t('blood_requests') },
    { id: 'register', label: t('donor_registration') },
    { id: 'about', label: t('about_us') },
    { id: 'contact', label: t('contact') },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 h-16 sm:h-20 min-w-0">
          
          {/* Zone 1: Brand Wordmark (Responsive & Auto-truncated) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 text-left group min-w-0 max-w-[65%] sm:max-w-none focus:outline-none shrink"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-red-600 flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform shrink-0 border border-red-200 dark:border-red-900">
              <img
                src="/logo.jpg"
                alt="ডিমলা ব্লাড ডোনার সোসাইটি লোগো"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm xs:text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white block truncate leading-tight">
                {lang === 'bn' ? 'ডিমলা ব্লাড ডোনার' : 'Dimla Blood Donor'}
                <span className="hidden sm:inline"> {lang === 'bn' ? 'সোসাইটি' : 'Society'}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium block truncate">
                {lang === 'bn' ? 'রক্তের প্রয়োজনে, পাশে আছি আমরা' : 'Standing by in blood emergency'}
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-red-600 dark:hover:text-red-400 ${
                    isActive ? 'text-red-600 dark:text-red-400 font-semibold' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Language Switch (Desktop only; on mobile available inside drawer) */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              aria-label="Switch Language"
              className="hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>

            {/* Emergency Blood Request Primary CTA */}
            <button
              onClick={() => {
                if (openEmergencyModal) {
                  openEmergencyModal();
                } else {
                  handleNavClick('request-blood');
                }
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-md shadow-red-600/20 transition-all shrink-0"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
              <span>{lang === 'bn' ? 'রক্ত লাগবে' : 'Need Blood'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === item.id
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Mobile Utilities Strip */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'English Version' : 'বাংলা সংস্করণ'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
