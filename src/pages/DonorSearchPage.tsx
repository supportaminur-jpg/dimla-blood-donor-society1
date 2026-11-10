import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BloodGroup, Donor } from '../types';
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  Share2,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  User,
  Heart,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface DonorSearchPageProps {
  initialGroup?: string;
  initialUnion?: string;
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

export const DonorSearchPage: React.FC<DonorSearchPageProps> = ({
  initialGroup = 'ALL',
  initialUnion = 'ALL',
  openEmergencyModal,
}) => {
  const { lang, t } = useLanguage();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [bloodGroup, setBloodGroup] = useState<string>(initialGroup);
  const [unionName, setUnionName] = useState<string>(initialUnion);
  const [ward, setWard] = useState<string>('ALL');
  const [villageSearch, setVillageSearch] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected donor for modal view
  const [activeDonor, setActiveDonor] = useState<Donor | null>(null);

  const fetchDonors = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (bloodGroup !== 'ALL') params.append('blood_group', bloodGroup);
    if (unionName !== 'ALL') params.append('union_name', unionName);
    if (ward !== 'ALL') params.append('ward', ward);
    if (villageSearch.trim()) params.append('village', villageSearch.trim());
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (onlyAvailable) params.append('available', 'true');

    fetch(`/api/donors?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setDonors(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, unionName, ward, onlyAvailable]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleResetFilters = () => {
    setBloodGroup('ALL');
    setUnionName('ALL');
    setWard('ALL');
    setVillageSearch('');
    setOnlyAvailable(false);
    setSearchQuery('');
    setTimeout(() => {
      fetch('/api/donors')
        .then((res) => res.json())
        .then((d) => d.success && setDonors(d.data));
    }, 50);
  };

  const shareDonor = (donor: Donor) => {
    const text = `🩸 *রক্তদাতার সন্ধান (ডিমলা)* 🩸\n\n` +
      `নাম: ${donor.name}\n` +
      `রক্তের গ্রুপ: ${donor.blood_group}\n` +
      `ইউনিয়ন: ${donor.union_name}\n` +
      `গ্রাম: ${donor.village}\n` +
      `অবস্থা: ${donor.available ? 'রক্তদানে প্রস্তুত' : 'বিশ্রামে আছেন'}\n` +
      (donor.is_phone_hidden ? `যোগাযোগ: ডিমলা হেল্পলাইন` : `ফোন: ${donor.phone}\n\n`) +
      `ডিমলা ব্লাড ডোনার সোসাইটি`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-md mb-2">
            <Heart className="w-3.5 h-3.5 fill-red-600" />
            <span>{lang === 'bn' ? 'ডিমলা উপজেলার রক্তদাতা ডিরেক্টরি' : 'Dimla Blood Donor Directory'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Search Blood Donors'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'ডিমলা উপজেলার ১০টি ইউনিয়নের নিবন্ধিত ও যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের তালিকা থেকে সহজে রক্তের সন্ধান করুন।'
              : 'Find ready-to-donate voluntary donors across the 10 unions of Dimla Upazila.'}
          </p>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল গ্রুপ' : 'All Blood Groups'}</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Union */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ইউনিয়ন' : 'Union'}
              </label>
              <select
                value={unionName}
                onChange={(e) => setUnionName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল ইউনিয়ন (১০টি)' : 'All Unions (10)'}</option>
                {DIMLA_UNIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ওয়ার্ড নং' : 'Ward No'}
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল ওয়ার্ড' : 'All Wards'}</option>
                {['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'].map((w) => (
                  <option key={w} value={w}>
                    ওয়ার্ড {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Village / Area Keyword */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'গ্রাম বা এলাকা' : 'Village / Area'}
              </label>
              <input
                type="text"
                placeholder={lang === 'bn' ? 'যেমন: সুন্দরখাতা, বাবুরহাট' : 'e.g. Baburhat'}
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Availability Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span>{lang === 'bn' ? 'শুধুমাত্র বর্তমানে রক্তদানে প্রস্তুত ডোনার' : 'Only available donors'}</span>
            </label>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {lang === 'bn' ? 'ফিল্টার রিসেট' : 'Reset'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {lang === 'bn' ? `মোট ${donors.length} জন রক্তদাতা পাওয়া গেছে` : `Found ${donors.length} donors`}
        </div>
        <button
          onClick={openEmergencyModal}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
        >
          <span>{lang === 'bn' ? 'কাঙ্ক্ষিত রক্তদাতা না পেলে জরুরি অনুরোধ করুন' : 'Cant find donor? Post request'}</span>
        </button>
      </div>

      {/* Donors Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">{lang === 'bn' ? 'রক্তদাতার তথ্য লোড হচ্ছে...' : 'Loading donors...'}</p>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'কোনো রক্তদাতা পাওয়া যায়নি' : 'No Donors Found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {lang === 'bn'
                ? 'আপনার দেওয়া রক্তের গ্রুপ বা ইউনিয়নের ফিল্টারে বর্তমানে কোনো রক্তদাতা পাওয়া যায়নি। দয়া করে ফিল্টার পরিবর্তন করুন বা একটি জরুরি রক্তের অনুরোধ জমা দিন।'
                : 'No donor matches your current criteria. Please modify your search filters or post an emergency request.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
            >
              {lang === 'bn' ? 'ফিল্টার ক্লিয়ার করুন' : 'Clear Filters'}
            </button>
            <button
              onClick={openEmergencyModal}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors"
            >
              {lang === 'bn' ? 'জরুরি রক্তের অনুরোধ করুন' : 'Post Blood Request'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-600 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                      {donor.blood_group}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {donor.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 min-w-0">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{donor.union_name} · ও:{donor.ward}</span>
                      </div>
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

                {/* Details Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5 my-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 shrink-0">{lang === 'bn' ? 'গ্রাম / এলাকা:' : 'Village:'}</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate ml-2">{donor.village}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 shrink-0">{lang === 'bn' ? 'সর্বশেষ রক্তদান:' : 'Last Donation:'}</span>
                    <span className="font-medium truncate ml-2">
                      {donor.last_donation_date || (lang === 'bn' ? 'নতুন রক্তদাতা' : 'New Donor')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 shrink-0">{lang === 'bn' ? 'মোট রক্তদান:' : 'Total Donations:'}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {donor.total_donations} {lang === 'bn' ? 'বার' : 'times'}
                    </span>
                  </div>
                </div>

                {donor.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic mb-3">
                    "{donor.bio}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 sm:gap-2 min-w-0">
                {donor.is_phone_hidden ? (
                  <button
                    onClick={() => setActiveDonor(donor)}
                    className="flex-1 py-2 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors text-center truncate min-w-0"
                  >
                    {lang === 'bn' ? 'প্রোফাইল দেখুন' : 'View Profile'}
                  </button>
                ) : (
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm min-w-0 truncate"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{donor.phone}</span>
                  </a>
                )}

                <button
                  onClick={() => setActiveDonor(donor)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
                  title="বিস্তারিত প্রোফাইল"
                >
                  <User className="w-4 h-4" />
                </button>

                <button
                  onClick={() => shareDonor(donor)}
                  className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition-colors shrink-0"
                  title="শেয়ার করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donor Profile Detail Modal */}
      {activeDonor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 relative">
              <button
                onClick={() => setActiveDonor(null)}
                className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-red-600 font-extrabold text-2xl flex items-center justify-center shadow-lg">
                  {activeDonor.blood_group}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{activeDonor.name}</h3>
                  <p className="text-xs text-red-100 mt-0.5">
                    {activeDonor.union_name} · {activeDonor.village}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">ইউনিয়ন</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDonor.union_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">ওয়ার্ড নং</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDonor.ward}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">গ্রাম / এলাকা</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDonor.village}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">সর্বশেষ রক্তদান</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeDonor.last_donation_date || 'নতুন রক্তদাতা'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">বর্তমান প্রাপ্যতা</span>
                  <span
                    className={`font-semibold ${
                      activeDonor.available ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {activeDonor.available ? 'রক্তদানে প্রস্তুত' : 'বিশ্রামে আছেন'}
                  </span>
                </div>
              </div>

              {activeDonor.bio && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold block mb-1">রক্তদাতার বার্তা:</span>
                  <p>"{activeDonor.bio}"</p>
                </div>
              )}

              {/* Phone Information */}
              <div className="pt-2">
                {activeDonor.is_phone_hidden ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <p className="font-semibold">ব্যক্তিগত গোপনীয়তা সুরক্ষা:</p>
                    <p>
                      এই রক্তদাতা নিজের মোবাইল নম্বর উন্মুক্ত রাখেননি। জরুরি প্রয়োজনে আমাদের হটলাইনে কল করুন: <strong>01712-345678</strong>
                    </p>
                  </div>
                ) : (
                  <a
                    href={`tel:${activeDonor.phone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-red-600/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>কল করুন: {activeDonor.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
