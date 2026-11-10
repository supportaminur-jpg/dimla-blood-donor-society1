import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Heart, AlertTriangle, Send, Share2, CheckCircle, Phone } from 'lucide-react';
import { BloodGroup } from '../types';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    patient_name: '',
    blood_group: 'O+' as BloodGroup,
    bags_needed: 1,
    hospital_name: 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স',
    hospital_address: 'ডিমলা, নীলফামারী',
    union_name: 'ডিমলা সদর',
    contact_name: '',
    contact_phone: '',
    needed_date_time: 'আজকের মধ্যে অতি জরুরি',
    reason: 'জরুরি রক্তের প্রয়োজন',
    is_urgent: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.patient_name.trim()) {
      setErrorMessage(lang === 'bn' ? 'রোগীর নাম প্রদান করুন।' : 'Please enter patient name.');
      return;
    }
    const cleanPhone = formData.contact_phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage(lang === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।' : 'Enter a valid 11-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedData(data.data);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(data.error || 'অনুরোধ জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch {
      setErrorMessage('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = (req: any) => {
    const text = `🚨 *জরুরি রক্তের প্রয়োজন (ডিমলা)* 🚨\n\n` +
      `🩸 *রক্তের গ্রুপ:* ${req.blood_group}\n` +
      `📦 *পরিমাণ:* ${req.bags_needed} ব্যাগ\n` +
      `👤 *রোগী:* ${req.patient_name}\n` +
      `🏥 *হাসপাতাল:* ${req.hospital_name} (${req.union_name})\n` +
      `⏰ *প্রয়োজনের সময়:* ${req.needed_date_time}\n` +
      `📞 *যোগাযোগ:* ${req.contact_phone} (${req.contact_name})\n` +
      `⚠️ *কারণ:* ${req.reason}\n\n` +
      `ডিমলা ব্লাড ডোনার সোসাইটি\nএক ব্যাগ রক্ত, বাঁচাতে পারে একটি প্রাণ।`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold truncate">
                {lang === 'bn' ? 'জরুরি রক্তের অনুরোধ ফর্ম' : 'Emergency Blood Request Form'}
              </h3>
              <p className="text-[11px] sm:text-xs text-red-100 truncate">
                {lang === 'bn' ? 'ডিমলা উপজেলার রক্তদাতাদের কাছে দ্রুত পৌঁছাতে ফর্মটি পূরণ করুন' : 'Fill out this form to notify Dimla donors quickly'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          {submittedData ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'রক্তের অনুরোধ সফলভাবে প্রকাশিত হয়েছে!' : 'Blood Request Published Successfully!'}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  {lang === 'bn'
                    ? 'আপনার অনুরোধটি ডিমলা ব্লাড ডোনার সোসাইটির তালিকায় যোগ করা হয়েছে। দ্রুত রক্ত পেতে নিচের বাটনে ক্লিক করে হোয়াটসঅ্যাপ ও ফেসবুকে শেয়ার করুন।'
                    : 'Your request is now live in Dimla Blood Donor Society. Share it immediately on WhatsApp and Facebook to find donors faster.'}
                </p>
              </div>

              {/* Share CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <a
                  href={getWhatsAppShareUrl(submittedData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে শেয়ার করুন' : 'Share on WhatsApp'}</span>
                </a>
                <button
                  onClick={() => {
                    setSubmittedData(null);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Blood Group & Bags Needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'প্রয়োজনীয় রক্তের গ্রুপ *' : 'Blood Group *'}
                  </label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value as BloodGroup })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'রক্তের পরিমাণ (ব্যাগ) *' : 'Bags Needed *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.bags_needed}
                    onChange={(e) => setFormData({ ...formData, bags_needed: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'রোগীর পূর্ণ নাম *' : 'Patient Name *'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: মোছা: আয়েশা খাতুন' : 'e.g. Ayesha Khatun'}
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              {/* Hospital / Clinic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'হাসপাতাল / ক্লিনিকের নাম *' : 'Hospital Name *'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স"
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ডিমলার ইউনিয়ন নির্বাচন করুন *' : 'Dimla Union *'}
                  </label>
                  <select
                    value={formData.union_name}
                    onChange={(e) => setFormData({ ...formData, union_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {DIMLA_UNIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Person & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'যোগাযোগকারীর নাম ও সম্পর্ক *' : 'Contact Person *'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মো: রফিকুল (রোগীর ভাই)"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Number (11 digit) *'}
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Needed Time & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'কখন রক্ত প্রয়োজন? *' : 'Needed Date & Time *'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: আজ দুপুর ২:০০ টা / জরুরি"
                    value={formData.needed_date_time}
                    onChange={(e) => setFormData({ ...formData, needed_date_time: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'রক্তের প্রয়োজন বা কারণ' : 'Medical Reason'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সিজারিয়ান অপারেশন / দুর্ঘটনা"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgent_check"
                  checked={formData.is_urgent}
                  onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <label htmlFor="urgent_check" className="text-xs text-red-600 dark:text-red-400 font-semibold cursor-pointer">
                  {lang === 'bn' ? 'এটি অতি জরুরি রক্তের অনুরোধ (টপ সেকশনে পিন হবে)' : 'Mark as Critical / Urgent request'}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (lang === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (lang === 'bn' ? 'অনুরোধ প্রকাশ করুন' : 'Submit Request')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
