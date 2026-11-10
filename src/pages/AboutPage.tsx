import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Heart, MapPin, ShieldCheck, Users, Droplet, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  setCurrentTab: (tab: string) => void;
}

const DIMLA_UNIONS = [
  { bn: 'ডিমলা সদর', en: 'Dimla Sadar', desc: 'উপজেলা পরিষদ ও স্বাস্থ্য কমপ্লেক্স কেন্দ্রিক' },
  { bn: 'বালাপাড়া', en: 'Balapara', desc: 'সুন্দরখাতা ও তহশিলদারপাড়া সংলগ্ন' },
  { bn: 'নাউতারা', en: 'Nautara', desc: 'আকাশকুড়ি ও বাঘেরহাট সংলগ্ন' },
  { bn: 'খগাখড়িবাড়ী', en: 'Khagakharibari', desc: 'দোহলপাড়া ও বন্দরখড়িবাড়ী এলাকা' },
  { bn: 'গয়াবাড়ী', en: 'Gayabari', desc: 'শুটিবাড়ী বাজার ও মধ্য গয়াবাড়ী এলাকা' },
  { bn: 'পশ্চিম ছাতনাই', en: 'Paschim Chhatnai', desc: 'ডালিয়া তিস্তা ব্যারেজ ও কালীগঞ্জ বাজার' },
  { bn: 'পূর্ব ছাতনাই', en: 'Purbo Chhatnai', desc: 'ডাঙ্গাপাড়া ও বাঘমারা সীমানা' },
  { bn: 'টেপাখড়িবাড়ী', en: 'Tepakharibari', desc: 'তিস্তা নদীর তীরবর্তী চরাঞ্চল' },
  { bn: 'ঝুনাগাছ চাপানী', en: 'Jhunagachh Chapani', desc: 'চাপানী বাজার ও ভেন্ডাবাড়ী এলাকা' },
  { bn: 'খালিশা চাপানী', en: 'Khalisha Chapani', desc: 'ছোটখাতা ও জলঢাকা সংযোগ এলাকা' },
];

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentTab }) => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-red-600" />
          <span>{lang === 'bn' ? 'মানবতার সেবায় নিবেদিতপ্রাণ ডিমলাবাসী' : 'Humanitarian Blood Service'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {lang === 'bn' ? 'ডিমলা ব্লাড ডোনার সোসাইটি সম্পর্কে' : 'About Dimla Blood Donor Society'}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {lang === 'bn'
            ? 'নীলফামারী জেলার ডিমলা উপজেলার প্রতিটি গ্রামে রক্তের অভাবে যেন কোনো মানুষের প্রাণ বিপন্ন না হয়, সেই মহান ব্রত নিয়ে আমাদের এই অরাজনৈতিক ও স্বেচ্ছাসেবী ডিজিটাল উদ্যোগ।'
            : 'A 100% voluntary, non-profit community platform built to save lives in every village of Dimla Upazila, Nilphamari.'}
        </p>
      </div>

      {/* Core Mission Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/50 text-red-600 rounded-xl flex items-center justify-center">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'bn'
              ? 'ডিমলা উপজেলার যেকোনো নাগরিক যেন মাত্র কয়েক মিনিটের মধ্যেই সঠিক রক্তের গ্রুপের ডোনার খুঁজে পেতে পারেন এবং বিনামূল্যে জরুরি রক্ত পেতে পারেন।'
              : 'Empowering citizens of Dimla to find matching voluntary donors within minutes at zero financial cost.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'নিরাপত্তা ও গোপনীয়তা' : 'Privacy & Security'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'bn'
              ? 'ডোনারদের ব্যক্তিগত তথ্যের সুরক্ষা আমাদের প্রধান অগ্রাধিকার। ডোনার নিজে নির্ধারণ করতে পারেন তার মোবাইল নম্বর উন্মুক্ত থাকবে নাকি কেবল হেল্পলাইনের মাধ্যমে যোগাযোগ হবে।'
              : 'Donor privacy is guaranteed. Donors can choose whether their phone number is public or routed through the helpline.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? '১০টি ইউনিয়নের নেটওয়ার্ক' : '10 Union Network'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'bn'
              ? 'ডিমলা সদর থেকে শুরু করে তিস্তার দুর্গম চরাঞ্চল পর্যন্ত প্রতিটি ইউনিয়নে আমাদের নিবেদিতপ্রাণ স্বেচ্ছাসেবী রক্তদাতারা সক্রিয় রয়েছেন।'
              : 'From Dimla Sadar to the remote Teesta riverside chars, dedicated donors are ready to serve 24/7.'}
          </p>
        </div>
      </div>

      {/* The 10 Unions Detail */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'ডিমলা উপজেলার অন্তর্ভুক্ত ১০টি ইউনিয়ন' : 'The 10 Unions of Dimla Upazila'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn' ? 'এই ওয়েবসাইটটি শুধুমাত্র নীলফামারী জেলার ডিমলা উপজেলার বাসিন্দাদের জন্য তৈরি।' : 'This system is exclusively scoped for residents of Dimla Upazila, Nilphamari.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIMLA_UNIONS.map((u, i) => (
            <div
              key={u.bn}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
                ০{i + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {u.bn} ({u.en})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {u.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-4">
        <button
          onClick={() => setCurrentTab('register')}
          className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 active:scale-95 transition-all"
        >
          {lang === 'bn' ? 'আজই রক্তদাতা হিসেবে যোগ দিন' : 'Register as a Donor Today'}
        </button>
      </div>

    </div>
  );
};
