import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Clock, Heart } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError(lang === 'bn' ? 'নাম, ফোন নম্বর এবং বার্তা আবশ্যক।' : 'Name, phone and message are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', phone: '', subject: '', message: '' });
      } else {
        setError(data.error || 'বার্তা পাঠানো সম্ভব হয়নি।');
      }
    } catch {
      setError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {lang === 'bn' ? 'যোগাযোগ ও হেল্পলাইন' : 'Contact & Helpline'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {lang === 'bn'
            ? 'যেকোনো জরুরি রক্তের পরামর্শ, স্বেচ্ছাসেবী হিসেবে কাজ করা বা সহযোগিতার জন্য সরাসরি যোগাযোগ করুন।'
            : 'Get in touch with Dimla Blood Donor Society for any emergency assistance or volunteer queries.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Info & Hospital Hotlines */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সোসাইটি হেল্পলাইন' : 'Society Hotline'}
            </h2>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'জরুরি কল ও হোয়াটসঅ্যাপ' : 'Direct Call / WhatsApp'}</span>
                  <a href="tel:01712345678" className="font-bold text-base text-red-600 dark:text-red-400 hover:underline">
                    01712-345678
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Email'}</span>
                  <a href="mailto:info@dimlablood.org" className="font-semibold text-slate-900 dark:text-white hover:underline">
                    info@dimlablood.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স রোড, ডিমলা সদর, নীলফামারী, বাংলাদেশ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Hotlines */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আঞ্চলিক জরুরি হাসপাতাল নম্বর' : 'Emergency Hospital Contacts'}
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="min-w-0">ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono shrink-0">01712-345678</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="min-w-0">জলঢাকা উপজেলা স্বাস্থ্য কমপ্লেক্স:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono shrink-0">01730-324488</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="min-w-0">নীলফামারী আধুনিক সদর হাসপাতাল:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono shrink-0">0551-61244</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="min-w-0">রংপুর মেডিকেল কলেজ ব্লাড ব্যাংক:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono shrink-0">0521-63167</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'বার্তা পাঠান' : 'Send a Message'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'আপনার পরামর্শ, অভিযোগ বা সহায়তার বার্তা এখানে লিখুন' : 'Leave your feedback or inquiry'}
          </p>

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{lang === 'bn' ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!' : 'Message sent successfully. Thank you!'}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'বিষয়' : 'Subject'}
              </label>
              <input
                type="text"
                placeholder={lang === 'bn' ? 'যেমন: রক্তদান সংক্রান্ত তথ্য' : 'e.g. Donation inquiry'}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'বার্তা লিখুন *' : 'Your Message *'}
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...') : (lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message')}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
