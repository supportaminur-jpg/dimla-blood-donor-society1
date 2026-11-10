import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Droplet } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  setCurrentTab: (tab: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, setCurrentTab }) => {
  const { login } = useAuth();
  const { lang } = useLanguage();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('dimla12345');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success && data.token && data.admin) {
        login(data.token, data.admin);
        onLoginSuccess();
      } else {
        setErrorMessage(data.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড।');
      }
    } catch {
      setErrorMessage('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-red-600 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-lg shadow-red-600/30 border-2 border-red-500/40">
            <img
              src="/logo.jpg"
              alt="ডিমলা ব্লাড ডোনার সোসাইটি লোগো"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {lang === 'bn' ? 'অ্যাডমিন প্রবেশদ্বার' : 'Admin Portal Login'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'bn' ? 'ডিমলা ব্লাড ডোনার সোসাইটি সেন্ট্রাল ড্যাশবোর্ড' : 'Dimla Blood Donor Society Central Control'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'ব্যবহারকারী নাম (Username)' : 'Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Default credentials hint */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <span className="font-semibold block text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'ডিফল্ট অ্যাক্সেস তথ্য:' : 'Default Credentials:'}
              </span>
              <div>Username: <code className="font-mono text-red-600 font-bold">admin</code></div>
              <div>Password: <code className="font-mono text-red-600 font-bold">dimla12345</code></div>
              <span className="text-[10px] text-slate-400 block pt-1">
                *(ড্যাশবোর্ডের Settings মেনু থেকে যেকোনো সময় পাসওয়ার্ড পরিবর্তন করা যাবে)*
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? (lang === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : (lang === 'bn' ? 'লগইন করুন' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setCurrentTab('home')}
              className="text-xs text-slate-500 hover:text-red-600 transition-colors"
            >
              {lang === 'bn' ? '← মূল ওয়েবসাইটে ফিরে যান' : '← Back to Website'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
