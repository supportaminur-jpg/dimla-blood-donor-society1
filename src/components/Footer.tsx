import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Droplet, Phone, Mail, MapPin, Heart, Shield, Download, ExternalLink } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { lang, t } = useLanguage();

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Top Banner inside footer: Emergency Hospitals */}
      <div className="bg-red-950/60 border-b border-red-900/40 py-3 sm:py-4 px-3 sm:px-6 w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 text-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="font-semibold shrink-0">{lang === 'bn' ? 'ডিমলা জরুরি স্বাস্থ্য সেবা:' : 'Dimla Emergency Medical:'}</span>
            <span className="text-white">ডিমলা স্বাস্থ্য কমপ্লেক্স: 01712-345678</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400 text-[11px] sm:text-xs">
            <span>সিভিল সার্জন: 01713-333333</span>
            <span>জরুরি সেবা: ৯৯৯</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-red-600 flex items-center justify-center shadow-md shrink-0 border border-red-500/30">
                <img
                  src="/logo.jpg"
                  alt="ডিমলা ব্লাড ডোনার সোসাইটি লোগো"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold text-white">
                {lang === 'bn' ? 'ডিমলা ব্লাড ডোনার সোসাইটি' : 'Dimla Blood Donor Society'}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'নীলফামারী জেলার ডিমলা উপজেলার ১০টি ইউনিয়নের মানবিক ও স্বেচ্ছাসেবী রক্তদাতাদের একত্রিত করার সর্বাধুনিক অনলাইন প্ল্যাটফর্ম। রক্তের প্রয়োজনে পাশে আছি আমরা।'
                : 'A dedicated voluntary blood donation platform connecting compassionate donors across the 10 unions of Dimla Upazila, Nilphamari.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleNav('register')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>{lang === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন করুন' : 'Join as Blood Donor'}</span>
              </button>
            </div>
          </div>

          {/* Col 2: Dimla 10 Unions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              {lang === 'bn' ? 'ডিমলা উপজেলার ইউনিয়নসমূহ' : 'Dimla Upazila Unions'}
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <li>• ডিমলা সদর</li>
              <li>• বালাপাড়া</li>
              <li>• নাউতারা</li>
              <li>• খগাখড়িবাড়ী</li>
              <li>• গয়াবাড়ী</li>
              <li>• পশ্চিম ছাতনাই</li>
              <li>• পূর্ব ছাতনাই</li>
              <li>• টেপাখড়িবাড়ী</li>
              <li>• ঝুনাগাছ চাপানী</li>
              <li>• খালিশা চাপানী</li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-500">
              * শুধুমাত্র ডিমলা উপজেলার বাসিন্দাদের জন্য কার্যকর।
            </p>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              {lang === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleNav('search')} className="hover:text-white transition-colors">
                  {lang === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Search Blood Donors'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('requests')} className="hover:text-white transition-colors">
                  {lang === 'bn' ? 'জরুরি রক্তের অনুরোধসমূহ' : 'Emergency Requests'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('request-blood')} className="hover:text-white transition-colors text-red-400">
                  {lang === 'bn' ? 'রক্তের জন্য আবেদন করুন' : 'Post Blood Request'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors">
                  {lang === 'bn' ? 'আমাদের লক্ষ্য ও উদ্দেশ্য' : 'Our Mission & Vision'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors">
                  {lang === 'bn' ? 'যোগাযোগ ও হেল্পলাইন' : 'Contact & Helpline'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors text-xs text-slate-400">
                  {lang === 'bn' ? 'গোপনীয়তা নীতিমালা (Privacy)' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors text-xs text-slate-400">
                  {lang === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms)' : 'Terms & Conditions'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Admin Portal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              {lang === 'bn' ? 'যোগাযোগ ও তথ্য' : 'Contact & Info'}
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স রোড, ডিমলা, নীলফামারী, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>হটলাইন: 01712-345678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>info@dimlablood.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center md:text-left max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? 'ঘোষণা: ডিমলা ব্লাড ডোনার সোসাইটি একটি সম্পূর্ণ অরাজনৈতিক ও অলাভজনক স্বেচ্ছাসেবী মানবিক প্ল্যাটফর্ম। রক্তদানের চিকিৎসাগত উপযোগিতা যাচাইয়ের দায়িত্ব সংশ্লিষ্ট চিকিৎসক বা ল্যাব কর্মীদের।'
              : 'Disclaimer: Dimla Blood Donor Society is a non-political, voluntary humanitarian initiative. Medical fitness for donation must be verified by health professionals.'}
          </p>
          <p className="shrink-0">
            © {new Date().getFullYear()} {lang === 'bn' ? 'ডিমলা ব্লাড ডোনার সোসাইটি। সর্বস্বত্ব সংরক্ষিত।' : 'Dimla Blood Donor Society. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
