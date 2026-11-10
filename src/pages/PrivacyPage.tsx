import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'তথ্য সুরক্ষা ও নীতি' : 'Data Privacy Policy'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {lang === 'bn' ? 'গোপনীয়তা নীতিমালা (Privacy Policy)' : 'Privacy Policy'}
        </h1>
        <p className="text-xs text-slate-400">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ১. তথ্যের গোপনীয়তা ও সুরক্ষা
          </h2>
          <p>
            ডিমলা ব্লাড ডোনার সোসাইটি রক্তদাতাদের তথ্যের সর্বোচ্চ নিরাপত্তা প্রদানে অঙ্গীকারবদ্ধ। আমরা শুধুমাত্র জরুরি রক্তদানের প্রয়োজনে প্রয়োজনীয় তথ্য (নাম, রক্তের গ্রুপ, ইউনিয়ন, গ্রাম ও মোবাইল নম্বর) সংগ্রহ করি।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ২. মোবাইল নম্বরের দৃশ্যমানতা নিয়ন্ত্রণ (Public Visibility)
          </h2>
          <p>
            প্রত্যেক রক্তদাতা তার প্রোফাইল তৈরির সময় নির্ধারণ করতে পারেন যে তার মোবাইল নম্বর সাধারণ দর্শনার্থীদের কাছে দৃশ্যমান থাকবে কি না। যদি কোনো ডোনার তার নম্বর গোপন রাখতে চান, তবে তার নম্বর পাবলিক সার্চে প্রদর্শন করা হয় না। সে ক্ষেত্রে আগ্রহী ব্যক্তিরা সোসাইটির হটলাইনের মাধ্যমে যোগাযোগ করবেন।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ৩. তথ্যের বাণিজ্যিক ব্যবহার নিষেধ
          </h2>
          <p>
            ডিমলা ব্লাড ডোনার সোসাইটি কোনো রক্তদাতা বা সেবাগ্রহীতার তথ্য কোনো বাণিজ্যিক প্রতিষ্ঠান, বিপণন সংস্থা কিংবা তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করে না। এটি একটি ১০০% অলাভজনক স্বেচ্ছাসেবী সেবা।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ৪. তথ্য মুছে ফেলা ও নিষ্ক্রিয়করণ
          </h2>
          <p>
            যেকোনো রক্তদাতা যেকোনো সময় সাময়িকভাবে তার প্রোফাইল "বিশ্রামে আছেন (Inactive)" অবস্থায় রাখতে পারেন অথবা এডমিনের মাধ্যমে তার তথ্য স্থায়ীভাবে মুছে ফেলার অনুরোধ করতে পারেন।
          </p>
        </section>

      </div>
    </div>
  );
};
