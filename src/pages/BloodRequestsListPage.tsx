import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BloodGroup, BloodRequest } from '../types';
import {
  Heart,
  Phone,
  Share2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Filter,
  CheckCircle,
  Copy,
  Info,
} from 'lucide-react';

interface BloodRequestsListPageProps {
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

export const BloodRequestsListPage: React.FC<BloodRequestsListPageProps> = ({ openEmergencyModal }) => {
  const { lang, t } = useLanguage();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedUnion, setSelectedUnion] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('approved');

  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
    if (selectedGroup !== 'ALL') params.append('blood_group', selectedGroup);
    if (selectedUnion !== 'ALL') params.append('union_name', selectedUnion);

    fetch(`/api/requests?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          // Sort urgent first
          const sorted = [...d.data].sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0));
          setRequests(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedGroup, selectedUnion, selectedStatus]);

  const handleMarkCompleted = async (id: string) => {
    const confirm = window.confirm(
      lang === 'bn'
        ? 'আপনি কি নিশ্চিত যে এই রোগীর জন্য রক্ত পাওয়া গেছে এবং অনুরোধটি সম্পন্ন হয়েছে?'
        : 'Are you sure blood has been managed for this request?'
    );
    if (!confirm) return;

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
      }
    } catch {
      alert('স্ট্যাটাস আপডেট করা সম্ভব হয়নি।');
    }
  };

  const shareWhatsApp = (req: BloodRequest) => {
    const text = `🚨 *জরুরি রক্তের প্রয়োজন (ডিমলা)* 🚨\n\n` +
      `🩸 *রক্তের গ্রুপ:* ${req.blood_group}\n` +
      `📦 *পরিমাণ:* ${req.bags_needed} ব্যাগ\n` +
      `👤 *রোগী:* ${req.patient_name}\n` +
      `🏥 *হাসপাতাল:* ${req.hospital_name} (${req.union_name})\n` +
      `⏰ *সময়:* ${req.needed_date_time}\n` +
      `📞 *যোগাযোগ:* ${req.contact_phone} (${req.contact_name})\n` +
      `⚠️ *কারণ:* ${req.reason}\n\n` +
      `ডিমলা ব্লাড ডোনার সোসাইটি\nএক ব্যাগ রক্ত, বাঁচাতে পারে একটি প্রাণ।`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyDetails = (req: BloodRequest) => {
    const text = `জরুরি রক্তের প্রয়োজন (ডিমলা)\nরক্তের গ্রুপ: ${req.blood_group} (${req.bags_needed} ব্যাগ)\nরোগী: ${req.patient_name}\nহাসপাতাল: ${req.hospital_name}\nযোগাযোগ: ${req.contact_phone}`;
    navigator.clipboard.writeText(text);
    setCopySuccessId(req.id);
    setTimeout(() => setCopySuccessId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-md mb-2">
            <Heart className="w-3.5 h-3.5 fill-red-600" />
            <span>{lang === 'bn' ? 'জরুরি রক্তের চাহিদা বোর্ড' : 'Live Blood Requests'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'রক্তের জরুরি অনুরোধসমূহ' : 'Emergency Blood Requests'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            {lang === 'bn'
              ? 'ডিমলা উপজেলার বিভিন্ন স্বাস্থ্য কমপ্লেক্স ও ক্লিনিকে ভর্তি মুমূর্ষু রোগীদের জরুরি রক্তের তালিকা।'
              : 'Active emergency blood requirements for patients hospitalized in Dimla Upazila.'}
          </p>
        </div>

        <button
          onClick={openEmergencyModal}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition-all self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন রক্তের অনুরোধ করুন' : 'Post Blood Request'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'bn' ? 'অনুরোধের অবস্থা' : 'Request Status'}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="approved">{lang === 'bn' ? 'রক্ত প্রয়োজন (চলমান)' : 'Active / Needed'}</option>
            <option value="completed">{lang === 'bn' ? 'রক্ত পাওয়া গেছে (সম্পন্ন)' : 'Completed'}</option>
            <option value="ALL">{lang === 'bn' ? 'সকল অনুরোধ' : 'All Requests'}</option>
          </select>
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="ALL">{lang === 'bn' ? 'সকল গ্রুপ' : 'All Groups'}</option>
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
            {lang === 'bn' ? 'ডিমলার ইউনিয়ন' : 'Union'}
          </label>
          <select
            value={selectedUnion}
            onChange={(e) => setSelectedUnion(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="ALL">{lang === 'bn' ? 'সকল ইউনিয়ন (১০টি)' : 'All Unions (10)'}</option>
            {DIMLA_UNIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">{lang === 'bn' ? 'অনুরোধ লোড হচ্ছে...' : 'Loading requests...'}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'বর্তমানে কোনো জরুরি রক্তের অনুরোধ নেই' : 'No Open Blood Requests'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {lang === 'bn'
                ? 'এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় রক্তের অনুরোধ নেই। কোনো মুমূর্ষু রোগীর রক্তের প্রয়োজন হলে দ্রুত আবেদন জমা দিন।'
                : 'There are no open requests matching this filter. Click below to submit a new blood request.'}
            </p>
          </div>
          <button
            onClick={openEmergencyModal}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            {lang === 'bn' ? 'নতুন রক্তের অনুরোধ করুন' : 'Post Blood Request'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border shadow-sm flex flex-col justify-between transition-all min-w-0 ${
                req.status === 'completed'
                  ? 'border-emerald-200 dark:border-emerald-900/40 opacity-80'
                  : req.is_urgent
                  ? 'border-2 border-red-500 shadow-md'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-600 text-white font-extrabold text-lg sm:text-xl flex items-center justify-center shadow-md shadow-red-600/30 shrink-0">
                      {req.blood_group}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        {req.patient_name}
                      </h3>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 block truncate">
                        {req.bags_needed} {lang === 'bn' ? 'ব্যাগ রক্ত প্রয়োজন' : 'bags needed'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {req.status === 'completed' ? (
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md whitespace-nowrap">
                        {lang === 'bn' ? 'রক্ত পাওয়া গেছে' : 'Fulfilled'}
                      </span>
                    ) : req.is_urgent ? (
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/80 rounded-md uppercase whitespace-nowrap">
                        {lang === 'bn' ? 'অতি জরুরি' : 'Critical'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md whitespace-nowrap">
                        {lang === 'bn' ? 'চলমান' : 'Active'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl my-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-900 dark:text-white truncate">
                      {req.hospital_name} ({req.union_name})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lang === 'bn' ? 'প্রয়োজনের সময়:' : 'Needed:'} <strong>{req.needed_date_time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lang === 'bn' ? 'কারণ:' : 'Reason:'} {req.reason}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lang === 'bn' ? 'যোগাযোগ:' : 'Contact:'} {req.contact_name}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                <a
                  href={`tel:${req.contact_phone}`}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm truncate"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{req.contact_phone}</span>
                </a>

                <button
                  onClick={() => shareWhatsApp(req)}
                  className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition-colors shrink-0"
                  title="হোয়াটসঅ্যাপে শেয়ার করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => copyDetails(req)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
                  title="তথ্য কপি করুন"
                >
                  {copySuccessId === req.id ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                {req.status !== 'completed' && (
                  <button
                    onClick={() => handleMarkCompleted(req.id)}
                    className="py-2.5 px-2.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl transition-colors shrink-0"
                    title="রক্ত পাওয়া গেলে সম্পন্ন মার্ক করুন"
                  >
                    {lang === 'bn' ? 'রক্ত পাওয়া গেছে ✓' : 'Done ✓'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
