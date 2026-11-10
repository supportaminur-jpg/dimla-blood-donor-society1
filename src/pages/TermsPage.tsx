import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, AlertTriangle, Heart } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'ব্যবহারের নির্দেশিকা' : 'Terms & Conditions'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {lang === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
        </h1>
        <p className="text-xs text-slate-400">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ১. ভৌগোলিক সীমাবদ্ধতা (ডিমলা উপজেলা)
          </h2>
          <p>
            ডিমলা ব্লাড ডোনার সোসাইটি শুধুমাত্র নীলফামারী জেলার ডিমলা উপজেলার ১০টি ইউনিয়নের বাসিন্দাদের রক্তদাতা হিসেবে নিবন্ধন ও স্থানীয় রোগীদের জরুরি সেবা প্রদানের জন্য তৈরি। অন্য কোনো উপজেলার রক্তদাতাদের তথ্য এখানে অনুমোদন করা হবে না।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ২. রক্তদানে আর্থিক লেনদেন সম্পূর্ণ নিষিদ্ধ
          </h2>
          <p>
            রক্তদান একটি সম্পূর্ণ স্বেচ্ছাসেবী ও মানবিক সেবা। রক্তদানের বিনিময়ে কোনো প্রকার অর্থ গ্রহণ বা দাবি করা সম্পূর্ণ নিষিদ্ধ এবং আইনত দণ্ডনীয়। ডিমলা ব্লাড ডোনার সোসাইটি কোনো প্রকার আর্থিক লেনদেনের সাথে জড়িত নয়।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ৩. চিকিৎসার উপযোগিতা ও স্বাস্থ্য সতর্কতা
          </h2>
          <p>
            রক্তদাতা রক্তদানের উপযুক্ত কি না তা নির্ধারণের দায়িত্ব সংশ্লিষ্ট চিকিৎসক ও রক্ত ব্যাংকের পেশাদার কর্মীদের। ডিমলা ব্লাড ডোনার সোসাইটি কেবলমাত্র রক্তদাতা এবং গ্রহীতার মধ্যে যোগাযোগের একটি উন্মুক্ত ডিজিটাল মাধ্যম হিসেবে কাজ করে।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ৪. বয়স ও শারীরিক যোগ্যতা
          </h2>
          <p>
            রক্তদাতা হিসেবে নিবন্ধনের জন্য রক্তদাতার বয়স কমপক্ষে ১৮ বছর ও শারীরিক ওজন কমপক্ষে ৫০ কেজি হওয়া বাধ্যতামূলক।
          </p>
        </section>

      </div>
    </div>
  );
};
