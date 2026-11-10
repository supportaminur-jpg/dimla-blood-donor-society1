import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    site_title: 'ডিমলা ব্লাড ডোনার সোসাইটি',
    site_subtitle: 'রক্তের প্রয়োজনে, পাশে আছি আমরা।',
    home: 'হোম',
    find_donors: 'রক্তদাতা খুঁজুন',
    donor_registration: 'রক্তদাতা নিবন্ধন',
    blood_requests: 'জরুরি অনুরোধসমূহ',
    request_blood: 'রক্তের জরুরি অনুরোধ',
    about_us: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    admin_panel: 'অ্যাডমিন প্যানেল',
    admin_login: 'অ্যাডমিন লগইন',
    total_donors: 'মোট রক্তদাতা',
    active_donors: 'রক্তদানে প্রস্তুত',
    total_donations: 'মোট রক্তদান',
    emergency_requests: 'রক্তের অনুরোধ',
    search_donors_now: 'ডিমলা উপজেলায় রক্তদাতা খুঁজুন',
    select_blood_group: 'রক্তের গ্রুপ নির্বাচন করুন',
    select_union: 'ডিমলার ইউনিয়ন নির্বাচন করুন',
    all_unions: 'সকল ইউনিয়ন (১০টি)',
    all_groups: 'সকল রক্তের গ্রুপ',
    search_button: 'রক্তদাতা সন্ধান করুন',
    emergency_call: 'জরুরি হটলাইন',
    become_donor_title: 'এক ব্যাগ রক্ত, বাঁচাতে পারে একটি প্রাণ',
    become_donor_desc: 'আজই ডিমলা ব্লাড ডোনার সোসাইটিতে রক্তদাতা হিসেবে নিবন্ধন করুন এবং আপনার উপজেলার যেকোনো মানুষের জীবন বাঁচাতে এগিয়ে আসুন।',
    register_btn: 'রক্তদাতা হোন',
    request_btn: 'রক্তের জরুরি প্রয়োজন?',
    blood_needed_badge: 'জরুরি রক্ত প্রয়োজন',
    patient_name: 'রোগীর নাম',
    hospital: 'হাসপাতাল / ক্লিনিক',
    needed_bags: 'প্রয়োজনীয় ব্যাগ',
    needed_time: 'প্রয়োজনের সময়',
    call_now: 'সরাসরি কল করুন',
    whatsapp_share: 'হোয়াটসঅ্যাপে শেয়ার',
    available_now: 'রক্তদানে প্রস্তুত',
    resting: 'বিশ্রামে আছেন',
    last_donation: 'সর্বশেষ রক্তদান',
    village_area: 'গ্রাম / এলাকা',
    ward_no: 'ওয়ার্ড নং',
    privacy_notice: 'ব্যক্তিগত তথ্যের গোপনীয়তা ও সুরক্ষা নিশ্চিত করা হয়।',
    notice_board: 'জরুরি নোটিশ বোর্ড',
    faq_title: 'রক্তদান সম্পর্কিত সাধারণ জিজ্ঞাসা',
  },
  en: {
    site_title: 'Dimla Blood Donor Society',
    site_subtitle: 'Standing by you in times of blood emergency.',
    home: 'Home',
    find_donors: 'Find Donors',
    donor_registration: 'Donor Register',
    blood_requests: 'Blood Requests',
    request_blood: 'Emergency Request',
    about_us: 'About Us',
    contact: 'Contact',
    admin_panel: 'Admin Panel',
    admin_login: 'Admin Login',
    total_donors: 'Total Donors',
    active_donors: 'Available Donors',
    total_donations: 'Total Donations',
    emergency_requests: 'Blood Requests',
    search_donors_now: 'Search Blood Donors in Dimla',
    select_blood_group: 'Select Blood Group',
    select_union: 'Select Dimla Union',
    all_unions: 'All Unions (10)',
    all_groups: 'All Blood Groups',
    search_button: 'Search Donors',
    emergency_call: 'Emergency Hotline',
    become_donor_title: 'One Bag of Blood Can Save a Life',
    become_donor_desc: 'Register as a voluntary blood donor in Dimla Upazila today and help save lives in our community.',
    register_btn: 'Become a Donor',
    request_btn: 'Need Blood Urgently?',
    blood_needed_badge: 'Emergency Blood Needed',
    patient_name: 'Patient Name',
    hospital: 'Hospital / Clinic',
    needed_bags: 'Bags Needed',
    needed_time: 'Required Time',
    call_now: 'Call Now',
    whatsapp_share: 'Share on WhatsApp',
    available_now: 'Available to Donate',
    resting: 'Resting / Inactive',
    last_donation: 'Last Donation',
    village_area: 'Village / Area',
    ward_no: 'Ward No',
    privacy_notice: 'Privacy and data protection guaranteed.',
    notice_board: 'Notice Board',
    faq_title: 'Frequently Asked Questions',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('dimla_blood_lang') as Language) || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('dimla_blood_lang', lang);
  }, [lang]);

  const t = (key: string) => {
    return translations[lang]?.[key] || translations.bn[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
