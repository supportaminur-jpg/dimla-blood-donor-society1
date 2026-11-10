import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BloodGroup, Donor, BloodRequest, Union, Village, Notice, WebsiteSettings, ActivityLog, Stats } from '../types';
import {
  Users,
  Heart,
  Droplet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Download,
  Settings,
  Shield,
  MapPin,
  Bell,
  Search,
  Filter,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  Lock,
  FileText,
  Key,
  Database,
  Cloud,
  Check,
} from 'lucide-react';

interface AdminDashboardPageProps {
  setCurrentTab: (tab: string) => void;
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

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setCurrentTab }) => {
  const { admin, token, logout } = useAuth();
  const { lang } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'donors' | 'requests' | 'unions' | 'notices' | 'settings' | 'admins' | 'cloudflare'>('overview');

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // Donors
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorFilterStatus, setDonorFilterStatus] = useState<string>('ALL');
  const [donorFilterGroup, setDonorFilterGroup] = useState<string>('ALL');
  const [donorFilterUnion, setDonorFilterUnion] = useState<string>('ALL');
  const [donorSearch, setDonorSearch] = useState<string>('');
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);

  // Requests
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null);

  // Unions & Villages
  const [unions, setUnions] = useState<Union[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [newVillageUnion, setNewVillageUnion] = useState<string>('u1');
  const [newVillageNameBn, setNewVillageNameBn] = useState<string>('');
  const [newVillageWard, setNewVillageWard] = useState<string>('১');

  // Notices
  const [notices, setNotices] = useState<Notice[]>([]);
  const [newNoticeTitle, setNewNoticeTitle] = useState<string>('');
  const [newNoticeContent, setNewNoticeContent] = useState<string>('');
  const [newNoticePinned, setNewNoticePinned] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string>('');

  // Admins & Security
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'moderator' | 'super_admin'>('moderator');
  const [newAdminMessage, setNewAdminMessage] = useState('');

  const [loading, setLoading] = useState(false);

  // Helper fetch with token
  const authFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  const loadAllData = () => {
    setLoading(true);

    // Stats
    fetch('/api/stats')
      .then((res) => res.json())
      .then((d) => d.success && setStats(d.data));

    // Donors (with admin token)
    authFetch('/api/donors')
      .then((res) => res.json())
      .then((d) => d.success && setDonors(d.data));

    // Requests (with admin token)
    authFetch('/api/requests?status=ALL')
      .then((res) => res.json())
      .then((d) => d.success && setRequests(d.data));

    // Unions & Villages
    fetch('/api/unions')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setUnions(d.data.unions);
          setVillages(d.data.villages);
        }
      });

    // Notices
    fetch('/api/notices')
      .then((res) => res.json())
      .then((d) => d.success && setNotices(d.data));

    // Settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((d) => d.success && setSettings(d.data));

    // Admins & Logs
    authFetch('/api/admin/admins')
      .then((res) => res.json())
      .then((d) => d.success && setAdminsList(d.data));

    authFetch('/api/admin/logs')
      .then((res) => res.json())
      .then((d) => d.success && setActivityLogs(d.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Donor Actions
  const handleApproveDonor = async (id: string) => {
    try {
      const res = await authFetch(`/api/donors/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch {
      alert('অনুমোদন করা সম্ভব হয়নি।');
    }
  };

  const handleRejectDonor = async (id: string) => {
    try {
      const res = await authFetch(`/api/donors/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch {
      alert('বাতিল করা সম্ভব হয়নি।');
    }
  };

  const handleDeleteDonor = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই রক্তদাতার তথ্য মুছে ফেলতে চান?')) return;
    try {
      const res = await authFetch(`/api/donors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch {
      alert('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  const handleToggleDonorStatus = async (donor: Donor) => {
    const newStatus = donor.status === 'approved' ? 'inactive' : 'approved';
    try {
      const res = await authFetch(`/api/donors/${donor.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch {
      alert('স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।');
    }
  };

  const handleSaveDonorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonor) return;
    try {
      const res = await authFetch(`/api/donors/${editingDonor.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingDonor),
      });
      const data = await res.json();
      if (data.success) {
        setEditingDonor(null);
        loadAllData();
      }
    } catch {
      alert('সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  // Request Actions
  const handleApproveRequest = async (id: string) => {
    try {
      const res = await authFetch(`/api/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch {
      alert('অনুমোদন ব্যর্থ হয়েছে।');
    }
  };

  const handleToggleUrgentRequest = async (reqItem: BloodRequest) => {
    try {
      const res = await authFetch(`/api/requests/${reqItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_urgent: !reqItem.is_urgent }),
      });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch {
      alert('হালনাগাদ করা সম্ভব হয়নি।');
    }
  };

  const handleCompleteRequest = async (id: string) => {
    try {
      const res = await authFetch(`/api/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch {
      alert('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('অনুরোধটি মুছে ফেলতে চান?')) return;
    try {
      const res = await authFetch(`/api/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch {
      alert('মুছে ফেলা যায়নি।');
    }
  };

  // Village Actions
  const handleAddVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageNameBn.trim()) return;
    try {
      const res = await authFetch(`/api/unions/${newVillageUnion}/villages`, {
        method: 'POST',
        body: JSON.stringify({
          name_bn: newVillageNameBn.trim(),
          name_en: newVillageNameBn.trim(),
          ward: newVillageWard,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewVillageNameBn('');
        loadAllData();
      }
    } catch {
      alert('গ্রাম যোগ করা যায়নি।');
    }
  };

  const handleDeleteVillage = async (id: string) => {
    if (!window.confirm('এই গ্রামটি মুছে ফেলতে চান?')) return;
    try {
      const res = await authFetch(`/api/villages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch {
      alert('মুছে ফেলা ব্যর্থ হয়েছে।');
    }
  };

  // Notice Actions
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    try {
      const res = await authFetch('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: newNoticeTitle.trim(),
          content: newNoticeContent.trim(),
          is_pinned: newNoticePinned,
          is_published: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewNoticeTitle('');
        setNewNoticeContent('');
        setNewNoticePinned(false);
        loadAllData();
      }
    } catch {
      alert('নোটিশ প্রকাশ ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('নোটিশটি মুছে ফেলতে চান?')) return;
    try {
      const res = await authFetch(`/api/notices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch {
      alert('মুছে ফেলা যায়নি।');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
        setTimeout(() => setSettingsMessage(''), 3000);
      }
    } catch {
      alert('সেটিংস সংরক্ষণ করা সম্ভব হয়নি।');
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessage('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordMessage(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch {
      setPasswordMessage('সার্ভারে যোগাযোগ করা যায়নি।');
    }
  };

  // Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminMessage('');
    try {
      const res = await authFetch('/api/admin/admins', {
        method: 'POST',
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          name: newAdminName,
          role: newAdminRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewAdminMessage('নতুন অ্যাডমিন/মডারেটর সফলভাবে তৈরি হয়েছে!');
        setNewAdminUsername('');
        setNewAdminPassword('');
        setNewAdminName('');
        loadAllData();
      } else {
        setNewAdminMessage(data.error || 'অ্যাডমিন তৈরি ব্যর্থ হয়েছে।');
      }
    } catch {
      setNewAdminMessage('ত্রুটি দেখা দিয়েছে।');
    }
  };

  // Filtered Donors List
  const filteredDonors = donors.filter((d) => {
    if (donorFilterStatus !== 'ALL' && d.status !== donorFilterStatus) return false;
    if (donorFilterGroup !== 'ALL' && d.blood_group !== donorFilterGroup) return false;
    if (donorFilterUnion !== 'ALL' && d.union_name !== donorFilterUnion) return false;
    if (donorSearch.trim()) {
      const q = donorSearch.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.village.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingDonors = donors.filter((d) => d.status === 'pending');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0 w-full overflow-hidden">
      
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0 border border-red-500/40">
            <img
              src="/logo.jpg"
              alt="ডিমলা ব্লাড ডোনার সোসাইটি লোগো"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                {lang === 'bn' ? 'অ্যাডমিন সেন্ট্রাল ড্যাশবোর্ড' : 'Admin Central Dashboard'}
              </h1>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase shrink-0">
                {admin?.role === 'super_admin' ? 'Super Admin' : 'Moderator'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 break-words">
              লগইন আছেন: <strong className="text-white">{admin?.name}</strong> (@{admin?.username}) · ডিমলা ব্লাড ডোনার সোসাইটি
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          <a
            href="/api/export/donors.csv"
            download="dimla-donors.csv"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            title="সকল ডোনারের তালিকা CSV এক্সপোর্ট করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </a>

          <button
            onClick={() => {
              logout();
              setCurrentTab('home');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="w-full max-w-full flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', count: pendingDonors.length + pendingRequests.length },
          { id: 'donors', label: 'ডোনার ম্যানেজমেন্ট', count: pendingDonors.length },
          { id: 'requests', label: 'ব্লাড রিকোয়েস্ট', count: pendingRequests.length },
          { id: 'unions', label: 'ইউনিয়ন ও গ্রাম', count: villages.length },
          { id: 'notices', label: 'নোটিশ বোর্ড', count: notices.length },
          { id: 'settings', label: 'সাইট সেটিংস' },
          { id: 'admins', label: 'অ্যাডমিন ও নিরাপত্তা' },
          { id: 'cloudflare', label: 'Cloudflare ডেপ্লয় ও ZIP' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  activeSubTab === tab.id
                    ? 'bg-white text-red-600'
                    : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---------------- 1. TAB: OVERVIEW ---------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">মোট অনুমোদিত ডোনার</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {stats?.total_donors || 0}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                সক্রিয়: {stats?.active_donors || 0} জন
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mb-1">
                পেন্ডিং ডোনার অনুমোদন
              </span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                {pendingDonors.length}
              </div>
              <button
                onClick={() => setActiveSubTab('donors')}
                className="text-[11px] text-red-600 hover:underline font-semibold mt-1 block"
              >
                এখনই যাচাই করুন →
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">মোট রক্তের অনুরোধ</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {stats?.total_requests || 0}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                সম্পন্ন: {stats?.completed_requests || 0} টি
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm">
              <span className="text-xs text-red-600 dark:text-red-400 font-semibold block mb-1">
                পেন্ডিং রক্তের আবেদন
              </span>
              <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 tabular-nums">
                {pendingRequests.length}
              </div>
              <button
                onClick={() => setActiveSubTab('requests')}
                className="text-[11px] text-red-600 hover:underline font-semibold mt-1 block"
              >
                অনুরোধ দেখুন →
              </button>
            </div>
          </div>

          {/* Pending Donors Queue */}
          {pendingDonors.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-400/50 dark:border-amber-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                  <AlertCircle className="w-5 h-5" />
                  <span>নতুন ডোনার অনুমোদনের অপেক্ষায় ({pendingDonors.length} জন)</span>
                </div>
                <button
                  onClick={() => setActiveSubTab('donors')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  সকল ডোনার দেখুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDonors.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold text-base flex items-center justify-center shrink-0">
                        {d.blood_group}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{d.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {d.phone} · {d.union_name} ({d.village})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveDonor(d.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                        title="অনুমোদন করুন"
                      >
                        অনুমোদন
                      </button>
                      <button
                        onClick={() => handleRejectDonor(d.id)}
                        className="px-2.5 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-semibold rounded-lg"
                        title="বাতিল করুন"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick System Status & Cloudflare Shortcut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-red-600" />
                <span>সিস্টেম ও ডাটাবেজ স্থিতি</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>ডাটাবেজ ইঞ্জিন:</span>
                  <span className="font-mono font-semibold text-emerald-600">Active (SQLite / Cloudflare D1 Ready)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>আওতাভুক্ত ইউনিয়ন:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">১০টি ইউনিয়ন (ডিমলা উপজেলা)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>নিবন্ধিত গ্রাম সংখ্যা:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{villages.length} টি গ্রাম</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>রক্ষণাবেক্ষণ মোড:</span>
                  <span className={`font-semibold ${settings?.maintenance_mode ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {settings?.maintenance_mode ? 'চালু (Maintenance Active)' : 'স্বাভাবিক (Normal)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase">
                  Cloudflare Deployment
                </span>
                <h3 className="text-lg font-bold mt-2">সম্পূর্ণ প্রজেক্ট ZIP ডাউনলোড</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Cloudflare Pages ও Workers-এ সরাসরি এক ক্লিকে ডিপ্লয় করার জন্য প্রস্তুত D1 Database Schema, Worker স্ক্রিপ্ট ও সোর্স কোডসহ পূর্ণাঙ্গ ZIP প্যাকেজ।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/download-zip"
                  download="dimla-blood-donor-society.zip"
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>dimla-blood-donor-society.zip ডাউনলোড</span>
                </a>
                <button
                  onClick={() => setActiveSubTab('cloudflare')}
                  className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-xl text-slate-200"
                >
                  গাইড দেখুন
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ---------------- 2. TAB: DONOR MANAGEMENT ---------------- */}
      {activeSubTab === 'donors' && (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">স্ট্যাটাস</label>
                <select
                  value={donorFilterStatus}
                  onChange={(e) => setDonorFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="pending">পেন্ডিং (অনুমোদন প্রয়োজন)</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                  <option value="rejected">বাতিলকৃত (Rejected)</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">রক্তের গ্রুপ</label>
                <select
                  value={donorFilterGroup}
                  onChange={(e) => setDonorFilterGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="ALL">সকল রক্তের গ্রুপ</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Union */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">ডিমলার ইউনিয়ন</label>
                <select
                  value={donorFilterUnion}
                  onChange={(e) => setDonorFilterUnion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="ALL">সকল ইউনিয়ন (১০টি)</option>
                  {DIMLA_UNIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">নাম/ফোন সার্চ</label>
                <input
                  type="text"
                  placeholder="নাম বা মোবাইল নম্বর..."
                  value={donorSearch}
                  onChange={(e) => setDonorSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>মোট ফিল্টারকৃত ডোনার: <strong>{filteredDonors.length} জন</strong></span>
              <a
                href="/api/export/donors.csv"
                download="dimla-donors-list.csv"
                className="text-red-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>তালিকাসহ CSV ফাইল ডাউনলোড</span>
              </a>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">গ্রুপ</th>
                    <th className="px-4 py-3">ডোনারের নাম</th>
                    <th className="px-4 py-3">মোবাইল নম্বর</th>
                    <th className="px-4 py-3">ইউনিয়ন ও এলাকা</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3">প্রাপ্যতা</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDonors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-red-600 text-sm">
                        {donor.blood_group}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {donor.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          দান সংখ্যা: {donor.total_donations}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">
                        {donor.phone}
                        {!donor.public_phone && (
                          <span className="block text-[10px] text-amber-600 font-sans">
                            (পাবলিকে গোপন)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {donor.union_name}
                        <span className="block text-[10px] text-slate-400">
                          ওয়ার্ড {donor.ward}, {donor.village}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            donor.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : donor.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : donor.status === 'inactive'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {donor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={donor.available ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                          {donor.available ? 'প্রস্তুত' : 'বিশ্রামে'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        {donor.status === 'pending' && (
                          <button
                            onClick={() => handleApproveDonor(donor.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                          >
                            অনুমোদন
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleDonorStatus(donor)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                          title="সক্রিয়/নিষ্ক্রিয় টগল"
                        >
                          {donor.status === 'approved' ? 'Inactive' : 'Active'}
                        </button>
                        <button
                          onClick={() => setEditingDonor(donor)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDonor(donor.id)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 rounded"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Donor Modal */}
          {editingDonor && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">রক্তদাতার তথ্য সম্পাদনা</h3>
                  <button onClick={() => setEditingDonor(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleSaveDonorEdit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">নাম</label>
                    <input
                      type="text"
                      value={editingDonor.name}
                      onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">মোবাইল</label>
                      <input
                        type="text"
                        value={editingDonor.phone}
                        onChange={(e) => setEditingDonor({ ...editingDonor, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">রক্তের গ্রুপ</label>
                      <select
                        value={editingDonor.blood_group}
                        onChange={(e) => setEditingDonor({ ...editingDonor, blood_group: e.target.value as BloodGroup })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">ইউনিয়ন</label>
                      <select
                        value={editingDonor.union_name}
                        onChange={(e) => setEditingDonor({ ...editingDonor, union_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      >
                        {DIMLA_UNIONS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">গ্রাম</label>
                      <input
                        type="text"
                        value={editingDonor.village}
                        onChange={(e) => setEditingDonor({ ...editingDonor, village: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingDonor.available}
                        onChange={(e) => setEditingDonor({ ...editingDonor, available: e.target.checked })}
                      />
                      <span>রক্তদানে প্রস্তুত</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingDonor.public_phone}
                        onChange={(e) => setEditingDonor({ ...editingDonor, public_phone: e.target.checked })}
                      />
                      <span>ফোন নম্বর উন্মুক্ত</span>
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingDonor(null)}
                      className="px-4 py-2 bg-slate-100 rounded-xl"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---------------- 3. TAB: BLOOD REQUESTS ---------------- */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                রক্তের সকল আবেদন তালিকা ({requests.length} টি)
              </h3>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">গ্রুপ/ব্যাগ</th>
                    <th className="px-4 py-3">রোগীর নাম</th>
                    <th className="px-4 py-3">হাসপাতাল ও ইউনিয়ন</th>
                    <th className="px-4 py-3">যোগাযোগকারী ও ফোন</th>
                    <th className="px-4 py-3">প্রয়োজনের সময়</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-red-600 text-sm">
                        {req.blood_group}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {req.bags_needed} ব্যাগ
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {req.patient_name}
                        {req.is_urgent && (
                          <span className="block text-[10px] text-red-600 font-bold uppercase">
                            ★ অতি জরুরি
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {req.hospital_name}
                        <span className="block text-[10px] text-slate-400">
                          {req.union_name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{req.contact_phone}</span>
                        <span className="block text-[10px] text-slate-500">{req.contact_name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {req.needed_date_time}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        {req.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteRequest(req.id)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            সম্পন্ন
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUrgentRequest(req)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            req.is_urgent ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {req.is_urgent ? 'Unpin' : 'Pin Urgent'}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 4. TAB: UNIONS & VILLAGES ---------------- */}
      {activeSubTab === 'unions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-600" />
              <span>নতুন গ্রাম বা এলাকা যোগ করুন</span>
            </h3>
            <form onSubmit={handleAddVillage} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
              <div>
                <label className="font-semibold block mb-1">ইউনিয়ন নির্বাচন</label>
                <select
                  value={newVillageUnion}
                  onChange={(e) => setNewVillageUnion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {unions.map((u) => (
                    <option key={u.id} value={u.id}>{u.name_bn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">গ্রামের নাম (বাংলা)</label>
                <input
                  type="text"
                  placeholder="যেমন: ডাঙ্গাপাড়া"
                  value={newVillageNameBn}
                  onChange={(e) => setNewVillageNameBn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ওয়ার্ড নম্বর</label>
                <select
                  value={newVillageWard}
                  onChange={(e) => setNewVillageWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'].map((w) => (
                    <option key={w} value={w}>ওয়ার্ড {w}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                >
                  গ্রাম যোগ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Villages List by Union */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unions.map((u) => {
              const vList = villages.filter((v) => v.union_id === u.id);
              return (
                <div
                  key={u.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span>{u.name_bn} ({u.name_en})</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">{vList.length} গ্রাম</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {vList.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                      >
                        <span>{v.name_bn} (ও:{v.ward})</span>
                        <button
                          onClick={() => handleDeleteVillage(v.id)}
                          className="text-slate-400 hover:text-red-600"
                          title="মুছে ফেলুন"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- 5. TAB: NOTICES ---------------- */}
      {activeSubTab === 'notices' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-600" />
              <span>নতুন নোটিশ বা জরুরি ঘোষণা প্রকাশ</span>
            </h3>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: জরুরি রক্তদান ক্যাম্পেইন"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">বিস্তারিত বিবরণ *</label>
                <textarea
                  rows={3}
                  placeholder="নোটিশের বিস্তারিত বার্তা লিখুন..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notice_pin"
                  checked={newNoticePinned}
                  onChange={(e) => setNewNoticePinned(e.target.checked)}
                />
                <label htmlFor="notice_pin" className="cursor-pointer font-semibold">
                  টপে পিন করে রাখুন (Pinned)
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm"
              >
                নোটিশ প্রকাশ করুন
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {n.is_pinned && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 text-[10px] font-bold rounded">
                        PINNED
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteNotice(n.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 6. TAB: WEBSITE SETTINGS ---------------- */}
      {activeSubTab === 'settings' && settings && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-red-600" />
              <span>ওয়েবসাইট কনটেন্ট ও সেটিংস নিয়ন্ত্রণ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              কোড পরিবর্তন ছাড়াই ওয়েবসাইটের নাম, স্লোগান, ব্যানার এবং জরুরি সেটিংস পরিবর্তন করুন।
            </p>
          </div>

          {settingsMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>{settingsMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">ওয়েবসাইটের নাম</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">স্লোগান</label>
                <input
                  type="text"
                  value={settings.site_slogan}
                  onChange={(e) => setSettings({ ...settings, site_slogan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">হোমপেজ ব্যানার শিরোনাম</label>
                <input
                  type="text"
                  value={settings.banner_heading}
                  onChange={(e) => setSettings({ ...settings, banner_heading: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">জরুরি হেল্পলাইন নম্বর</label>
                <input
                  type="text"
                  value={settings.emergency_hotline}
                  onChange={(e) => setSettings({ ...settings, emergency_hotline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">আমাদের সম্পর্কে (About Us)</label>
              <textarea
                rows={4}
                value={settings.about_us}
                onChange={(e) => setSettings({ ...settings, about_us: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">ফেসবুক পেজ লিংক</label>
                <input
                  type="url"
                  value={settings.facebook_page}
                  onChange={(e) => setSettings({ ...settings, facebook_page: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            {/* Critical Switches */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_registrations}
                  onChange={(e) => setSettings({ ...settings, allow_registrations: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">নতুন ডোনার রেজিস্ট্রেশন উন্মুক্ত রাখুন</span>
                  <span className="text-[11px] text-slate-500">জরুরি প্রয়োজনে বন্ধ করতে টিক চিহ্ন তুলে দিন।</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">ওয়েবসাইট রক্ষণাবেক্ষণ মোড (Maintenance Mode)</span>
                  <span className="text-[11px] text-slate-500">অন করলে সাধারণ দর্শনার্থীদের মেইনটেন্যান্স নোটিশ দেখাবে।</span>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- 7. TAB: ADMINS & SECURITY ---------------- */}
      {activeSubTab === 'admins' && (
        <div className="space-y-8">
          
          {/* Password Change Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              <span>অ্যাডমিন পাসওয়ার্ড পরিবর্তন</span>
            </h3>

            {passwordMessage && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl">
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
              <div>
                <label className="font-semibold block mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </div>
            </form>
          </div>

          {/* Create New Admin */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              <span>নতুন অ্যাডমিন বা মডারেটর তৈরি</span>
            </h3>

            {newAdminMessage && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl">
                {newAdminMessage}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
              <div>
                <label className="font-semibold block mb-1">পূর্ণ নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: সোহেল রানা"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ইউজারনেম</label>
                <input
                  type="text"
                  placeholder="moderator1"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>

          {/* Activity Audit Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>সাম্প্রতিক অডিট লগ (Audit Activity Log)</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 break-words">
                    <span className="font-bold text-red-600">[{log.action}]</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200">{log.details}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] sm:whitespace-nowrap shrink-0">
                    {new Date(log.created_at).toLocaleString('bn-BD')} · by {log.admin_username}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ---------------- 8. TAB: CLOUDFLARE DEPLOYMENT & ZIP ---------------- */}
      {activeSubTab === 'cloudflare' && (
        <div className="space-y-8">
          
          {/* Main Download Card */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                Cloudflare Deployment Ready Package
              </span>
              <h3 className="text-2xl font-bold">dimla-blood-donor-society.zip</h3>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                এই ZIP ফাইলটিতে রয়েছে সম্পূর্ণ Frontend, Backend, Cloudflare D1 Database Migration SQL, Wrangler কনফিগারেশন এবং বাংলায় বিস্তারিত ইনস্টলেশন গাইড।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="/api/download-pages-zip"
                download="dimla-pages-dist.zip"
                className="px-5 py-3.5 bg-white text-red-600 hover:bg-red-50 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Pages Upload ZIP (শুধু dist)</span>
              </a>
              <a
                href="/api/download-zip"
                download="dimla-blood-donor-society.zip"
                className="px-5 py-3.5 bg-red-800/70 text-white hover:bg-red-800 font-bold text-xs sm:text-sm rounded-2xl border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>সম্পূর্ণ সোর্স (.zip)</span>
              </a>
            </div>
          </div>

          {/* Bengali Step by Step Guide */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-red-600" />
              <span>Cloudflare Pages ও Workers-এ Deploy করার নিয়মাবলী (বাংলা গাইড)</span>
            </h3>

            <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  ধাপ ১: Cloudflare Wrangler ইনস্টল ও লগইন
                </h4>
                <p>আপনার কম্পিউটারের টার্মিনালে নিচের কমান্ড দিন:</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  npm install -g wrangler{'\n'}wrangler login
                </pre>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  ধাপ ২: Cloudflare D1 ডাটাবেজ তৈরি করুন
                </h4>
                <p>Cloudflare-এ একটি নতুন D1 ডাটাবেজ তৈরি করতে রান করুন:</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  npx wrangler d1 create dimla_blood_db
                </pre>
                <p className="text-[11px] text-slate-500">
                  * টার্মিনালে পাওয়া <code>database_id</code> টি কপি করে প্রজেক্টের <code>wrangler.jsonc</code> ফাইলে বসিয়ে দিন।
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  ধাপ ৩: ডাটাবেজ মাইগ্রেশন চালান
                </h4>
                <p>D1 ডাটাবেজে ডিমলার ১০টি ইউনিয়ন ও সকল প্রয়োজনীয় টেবিল তৈরি করতে:</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  npx wrangler d1 execute dimla_blood_db --file=./migrations/0001_initial_schema.sql
                </pre>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  ধাপ ৪: বিল্ড ও ডেপ্লয়
                </h4>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  npm install{'\n'}npm run build{'\n'}npx wrangler deploy
                </pre>
                <p className="text-[11px] text-slate-500">
                  ডেপ্লয় সম্পন্ন হওয়ার সাথে সাথে আপনি আপনার কাস্টম Cloudflare ডোমেইনে ডিমলা ব্লাড ডোনার সোসাইটি ব্যবহার করতে পারবেন।
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
