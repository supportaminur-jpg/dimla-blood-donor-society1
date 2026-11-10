import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BloodGroup, Donor, BloodRequest, Notice, Stats } from '../types';
import {
  Heart,
  Droplet,
  Search,
  Users,
  Clock,
  Phone,
  Share2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  onSelectSearch?: (group: string, union: string) => void;
  openEmergencyModal: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DIMLA_UNIONS = [
  'ডিমলা সদর',
  'বালাপাড়া',
  'নাউতারা',
  'খগাখড়িবাড়ী',
  'গয়াবাড়ী',
  'পশ্চিম ছাতনাই',
  'পূর্ব ছাতনাই',
  'টেপাখড়িবাড়ী',
  'ঝুনাগাছ চাপানী',
  'খালিশা চাপানী',
];

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, onSelectSearch, openEmergencyModal }) => {
  const { lang, t } = useLanguage();

  const [stats, setStats] = useState<Stats>({
    total_donors: 0,
    pending_donors: 0,
    active_donors: 0,
    inactive_donors: 0,
    total_requests: 0,
    pending_requests: 0,
    active_requests: 0,
    completed_requests: 0,
    total_donations: 0,
    unions_count: 10,
  });

  const [recentDonors, setRecentDonors] = useState<Donor[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<BloodRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Search form state
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedUnion, setSelectedUnion] = useState<string>('ALL');

  useEffect(() => {
    // Fetch stats
    fetch('/api/stats')
      .then((res) => res.json())
      .then((d) => d.success && setStats(d.data))
      .catch(() => {});

    // Fetch approved donors
    fetch('/api/donors?status=approved')
      .then((res) => res.json())
      .then((d) => d.success && setRecentDonors(d.data.slice(0, 6)))
      .catch(() => {});

    // Fetch urgent blood requests
    fetch('/api/requests?status=approved')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          // Sort urgent first
          const sorted = [...d.data].sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0));
          setUrgentRequests(sorted.slice(0, 4));
        }
      })
      .catch(() => {});

    // Fetch notices
    fetch('/api/notices')
      .then((res) => res.json())
      .then((d) => d.success && setNotices(d.data.filter((n: Notice) => n.is_published)))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSelectSearch) {
      onSelectSearch(selectedGroup, selectedUnion);
    }
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGroupQuickFilter = (group: string) => {
    if (onSelectSearch) {
      onSelectSearch(group, 'ALL');
    }
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareRequest = (req: BloodRequest) => {
    const text = `🚨 *জরুরি রক্তের প্রয়োজন (ডিমলা)* 🚨\n\n` +
      `🩸 *গ্রুপ:* ${req.blood_group} (${req.bags_needed} ব্যাগ)\n` +
      `👤 *রোগী:* ${req.patient_name}\n` +
      `🏥 *হাসপাতাল:* ${req.hospital_name} (${req.union_name})\n` +
      `⏰ *সময়:* ${req.needed_date_time}\n` +
      `📞 *ফোন:* ${req.contact_phone} (${req.contact_name})\n` +
      `ডিমলা ব্লাড ডোনার সোসাইটি`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-6 pb-12 sm:pt-14 sm:pb-24 border-b border-slate-200/60 dark:border-slate-800 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/60 px-3 py-1.5 rounded-full max-w-full">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lang === 'bn' ? 'নীলফামারী জেলার ডিমলা উপজেলার ১০টি ইউনিয়নের জন্য' : 'Exclusive to 10 Unions of Dimla Upazila'}</span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight break-words">
                {lang === 'bn' ? (
                  <>
                    এক ব্যাগ রক্ত, <span className="text-red-600">বাঁচাতে পারে</span> একটি প্রাণ
                  </>
                ) : (
                  <>
                    One Bag of Blood <span className="text-red-600">Can Save</span> a Life
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {lang === 'bn'
                  ? 'ডিমলা ব্লাড ডোনার সোসাইটিতে আজই রক্তদাতা হিসেবে নিবন্ধন করুন। রক্তের প্রয়োজনে ডিমলা উপজেলার প্রতিটি গ্রামে বিনামূল্যে রক্তদাতা খুঁজে পেতে আমরা আছি আপনার পাশে।'
                  : 'Register as a voluntary donor today in Dimla Blood Donor Society. Standing by you 24/7 to connect compassionate blood donors across every village in Dimla.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentTab('register')}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/25 active:scale-95 transition-all text-center"
                >
                  <Heart className="w-4 h-4 fill-white shrink-0" />
                  <span>{lang === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন করুন' : 'Register as Blood Donor'}</span>
                </button>

                <button
                  onClick={openEmergencyModal}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border-2 border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all text-center"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lang === 'bn' ? 'জরুরি রক্তের আবেদন' : 'Post Emergency Request'}</span>
                </button>
              </div>

              {/* Quick Trust badges */}
              <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{lang === 'bn' ? '১০০% স্বেচ্ছাসেবী' : '100% Voluntary'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{lang === 'bn' ? 'যাচাইকৃত ডোনার' : 'Verified Donors'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{lang === 'bn' ? '২৪ ঘণ্টা সেবা' : '24/7 Service'}</span>
                </div>
              </div>
            </div>

            {/* Right Media Banner */}
            <div className="lg:col-span-5 relative w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 aspect-[16/11] bg-slate-100 dark:bg-slate-800 w-full">
                <img
                  src="/hero.jpg"
                  alt="ডিমলা স্বেচ্ছাসেবী রক্তদান"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-red-400">
                    {lang === 'bn' ? 'মানবতার সেবায় ডিমলা' : 'Dimla Humanitarian Blood Network'}
                  </span>
                  <p className="text-xs sm:text-sm font-bold mt-1 line-clamp-2">
                    {lang === 'bn'
                      ? 'ডিমলা সদর হাসপাতাল ও উপজেলার প্রতিটি ক্লিনিকে রক্তের প্রয়োজনে সরাসরি ডোনার নেটওয়ার্ক।'
                      : 'Connecting donors directly with Dimla Upazila Health Complex and local clinics.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BIG SEARCH SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 lg:-mt-14 relative z-20 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 w-full">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'জরুরি প্রয়োজনে রক্তদাতা খুঁজুন' : 'Search Blood Donors Instantly'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn' ? 'রক্তের গ্রুপ ও ডিমলা উপজেলার ইউনিয়ন নির্বাচন করে অবিলম্বে রক্তদাতা সন্ধান করুন' : 'Select blood group and union to find ready donors'}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল রক্তের গ্রুপ (All Groups)' : 'All Blood Groups'}</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Union of Dimla */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'ডিমলার ইউনিয়ন' : 'Dimla Union'}
              </label>
              <select
                value={selectedUnion}
                onChange={(e) => setSelectedUnion(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল ইউনিয়ন (১০টি ইউনিয়ন)' : 'All 10 Unions'}</option>
                {DIMLA_UNIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{lang === 'bn' ? 'রক্তদাতা সন্ধান করুন' : 'Search Donors'}</span>
              </button>
            </div>
          </form>

          {/* Quick Blood Group Buttons */}
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2.5 text-center sm:text-left">
              {lang === 'bn' ? 'গ্রুপ অনুযায়ী দ্রুত রক্তদাতা নির্বাচন:' : 'Quick Select by Blood Group:'}
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => handleGroupQuickFilter(bg)}
                  className="py-2 px-1 text-xs sm:text-sm font-bold rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all text-center truncate"
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE STATS COUNTER */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.total_donors}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
              {lang === 'bn' ? 'নিবন্ধিত রক্তদাতা' : 'Registered Donors'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-emerald-600 dark:fill-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.active_donors}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
              {lang === 'bn' ? 'রক্তদানে প্রস্তুত' : 'Available Donors'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.total_donations}+
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
              {lang === 'bn' ? 'মোট সফল রক্তদান' : 'Successful Donations'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.total_requests}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
              {lang === 'bn' ? 'রক্তের অনুরোধ সমাধান' : 'Requests Served'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY BLOOD REQUESTS */}
      {urgentRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {lang === 'bn' ? 'জরুরি রক্তের অনুরোধ' : 'Emergency Blood Requests'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn' ? 'ডিমলা উপজেলার বিভিন্ন হাসপাতালে মুমূর্ষু রোগীর জন্য তাৎক্ষণিক রক্তের আবেদন' : 'Patients currently waiting for blood in Dimla hospitals'}
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('requests')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 self-start sm:self-auto shrink-0"
            >
              <span>{lang === 'bn' ? 'সকল অনুরোধ দেখুন' : 'View All Requests'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {urgentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-500/30 p-4 sm:p-6 shadow-md hover:border-red-500 transition-all flex flex-col justify-between min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-600 text-white font-extrabold text-base sm:text-lg flex items-center justify-center shadow-md shadow-red-600/30 shrink-0">
                        {req.blood_group}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block truncate">
                          {req.patient_name}
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400 font-semibold block truncate">
                          {req.bags_needed} {lang === 'bn' ? 'ব্যাগ রক্ত প্রয়োজন' : 'bags needed'}
                        </span>
                      </div>
                    </div>

                    {req.is_urgent && (
                      <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/80 rounded-md uppercase shrink-0">
                        {lang === 'bn' ? 'অতি জরুরি' : 'Critical'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-600 dark:text-slate-300 my-3 sm:my-4 border-y border-slate-100 dark:border-slate-800 py-2.5 sm:py-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{req.hospital_name} ({req.union_name})</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.needed_date_time}</span>
                    </div>
                    {req.reason && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 min-w-0">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{req.reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 min-w-0">
                  <a
                    href={`tel:${req.contact_phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm min-w-0 truncate"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{req.contact_phone}</span>
                  </a>
                  <button
                    onClick={() => shareRequest(req)}
                    className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition-colors shrink-0"
                    title="হোয়াটসঅ্যাপে শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. RECENTLY JOINED DONORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সম্প্রতি নিবন্ধিত রক্তদাতা' : 'Recently Joined Donors'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn' ? 'ডিমলা উপজেলার নিবেদিতপ্রাণ স্বেচ্ছাসেবী রক্তদাতাদের তালিকা' : 'Verified voluntary blood donors from Dimla Upazila'}
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('search')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 self-start sm:self-auto"
          >
            <span>{lang === 'bn' ? 'সকল রক্তদাতা দেখুন' : 'Explore All Donors'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recentDonors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-extrabold text-sm sm:text-base flex items-center justify-center border border-red-200 dark:border-red-900/40 shrink-0">
                      {donor.blood_group}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {donor.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        {donor.union_name} · {donor.village}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-md shrink-0 whitespace-nowrap ${
                      donor.available
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {donor.available
                      ? lang === 'bn'
                        ? 'রক্তদানে প্রস্তুত'
                        : 'Available'
                      : lang === 'bn'
                      ? 'বিশ্রামে আছেন'
                      : 'Resting'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 my-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'bn' ? 'ওয়ার্ড নং:' : 'Ward:'}</span>
                    <span className="font-medium">{donor.ward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'bn' ? 'শেষ রক্তদান:' : 'Last Donation:'}</span>
                    <span className="font-medium truncate ml-2">
                      {donor.last_donation_date || (lang === 'bn' ? 'নতুন রক্তদাতা' : 'First-time')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {donor.is_phone_hidden ? (
                  <button
                    onClick={openEmergencyModal}
                    className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl text-center hover:bg-slate-200 transition-colors truncate"
                  >
                    {lang === 'bn' ? 'হেল্পলাইনে যোগাযোগ করুন' : 'Contact via Helpline'}
                  </button>
                ) : (
                  <a
                    href={`tel:${donor.phone}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm truncate"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{donor.phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION: BECOME A DONOR */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-3 sm:space-y-4">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-sm inline-block">
              {lang === 'bn' ? 'স্বেচ্ছায় রক্তদান একটি মহৎ কাজ' : 'Voluntary Blood Donation Saves Lives'}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold leading-tight break-words">
              {lang === 'bn' ? 'আপনি কি ডিমলা উপজেলার বাসিন্দা? আজই রক্তদাতা হোন!' : 'Are you a resident of Dimla? Join as a life-saver!'}
            </h2>
            <p className="text-xs sm:text-base text-red-100 leading-relaxed">
              {lang === 'bn'
                ? 'আপনার রক্তদানের মাধ্যমে ডিমলা সদর হাসপাতাল বা যেকোনো ক্লিনিকে মুমূর্ষু শিশু, প্রসূতি মা কিংবা থ্যালাসেমিয়া রোগীর জীবন বেঁচে যেতে পারে। ১৮ বছর বা তার বেশি বয়সীদের নিবন্ধনে স্বাগত।'
                : 'Your blood donation can save mothers in labor, emergency surgery patients, and thalassemia children in Dimla. Residents aged 18+ are warmly welcome.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('register')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-red-600 font-bold text-xs sm:text-sm rounded-xl hover:bg-red-50 shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>{lang === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন করুন' : 'Register Now'}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT THE SOCIETY & 10 UNIONS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ডিমলা ব্লাড ডোনার সোসাইটি কী এবং কেন?' : 'What is Dimla Blood Donor Society?'}
            </h2>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'ডিমলা ব্লাড ডোনার সোসাইটি নীলফামারী জেলার ডিমলা উপজেলার একঝাঁক তরুণ-যুবকের স্বেচ্ছাসেবী মানবিক উদ্যোগ। উত্তরবঙ্গের তিস্তা অববাহিকার এই উপজেলায় জরুরি মুহূর্তে রক্তের অভাবে যেন কোনো রোগীর চিকিৎসা বিঘ্নিত না হয়, সেজন্য এই ডিজিটাল ডিরেক্টরি তৈরি করা হয়েছে।'
                : 'Dimla Blood Donor Society is a non-profit humanitarian initiative dedicated to serving the 10 unions of Dimla Upazila in Nilphamari district, Bangladesh.'}
            </p>

            <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{lang === 'bn' ? 'শুধুমাত্র ডিমলা উপজেলার ১০টি ইউনিয়নের স্থানীয় ডোনার ডাটাবেজ।' : 'Local verified database strictly covering Dimla 10 unions.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{lang === 'bn' ? 'ডোনারের ব্যক্তিগত তথ্যের সুরক্ষা ও মোবাইল নম্বর হাইড করার অপশন।' : 'Donor privacy protection with optional public phone toggle.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{lang === 'bn' ? 'সম্পূর্ণ বিনামূল্যে সেবা—কোনো প্রকার আর্থিক লেনদেন অনুমোদিত নয়।' : '100% free humanitarian service with no monetary exchange.'}</span>
              </div>
            </div>
          </div>

          {/* Unions Grid Display */}
          <div className="bg-slate-100 dark:bg-slate-900/70 p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 w-full">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600 shrink-0" />
              <span>{lang === 'bn' ? 'আওতাভুক্ত ১০টি ইউনিয়ন' : '10 Covered Unions'}</span>
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              {DIMLA_UNIONS.map((u, i) => (
                <div
                  key={u}
                  className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between min-w-0"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{u}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">০{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. ELIGIBILITY GUIDELINES & FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'রক্তদানের প্রাথমিক নিয়মাবলী ও স্বাস্থ্য তথ্য' : 'Blood Donation Guidelines'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn' ? 'কারা রক্ত দিতে পারবেন এবং কারা পারবেন না' : 'Eligibility criteria and health advice'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-5 rounded-2xl">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-base mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{lang === 'bn' ? 'কারা রক্ত দিতে পারবেন?' : 'Who Can Donate?'}</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li>• বয়স ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে।</li>
                <li>• শারীরিক ওজন কমপক্ষে ৫০ কেজি বা তদূর্ধ্ব হতে হবে।</li>
                <li>• রক্তে হিমোগ্লোবিনের মাত্রা স্বাভাবিক (১২.৫ গ্রাম/ডিএল) থাকা আবশ্যক।</li>
                <li>• শেষ রক্তদানের পর পুরুষদের ক্ষেত্রে ৪ মাস এবং নারীদের ক্ষেত্রে ৫ মাস অতিবাহিত হতে হবে।</li>
                <li>• রক্তচাপ ও শারীরিক তাপমাত্রা স্বাভাবিক থাকতে হবে।</li>
              </ul>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-2xl">
              <h3 className="font-bold text-rose-800 dark:text-rose-300 text-base mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>{lang === 'bn' ? 'কারা রক্ত দিতে পারবেন না?' : 'Who Cannot Donate?'}</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li>• গর্ভবতী নারী অথবা দুগ্ধদানকারী মায়েরা রক্ত দিতে পারবেন না।</li>
                <li>• হেপাটাইটিস বি, সি, এইচআইভি বা সিফিলিস আক্রান্ত ব্যক্তি।</li>
                <li>• অ্যান্টিবায়োটিক বা ভারী ঔষুধ সেবনরত ব্যক্তি।</li>
                <li>• রক্তচাপ অতিরিক্ত অনিয়ন্ত্রিত থাকলে।</li>
                <li>• কোনো বড় অপারেশনের ৬ মাসের মধ্যে।</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NOTICES & ANNOUNCEMENTS */}
      {notices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-red-600" />
              <span>{lang === 'bn' ? 'জরুরি নোটিশ ও ঘোষণা' : 'Notices & Announcements'}</span>
            </h2>
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {n.is_pinned && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 text-[10px] font-bold rounded">
                        PINNED
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
