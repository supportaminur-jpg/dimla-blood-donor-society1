import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: 'super_admin' | 'moderator';
  phone?: string;
  email?: string;
  created_at: string;
  last_login?: string;
}

export interface Donor {
  id: string;
  name: string;
  phone: string;
  alt_phone?: string;
  blood_group: string; // A+, A-, B+, B-, AB+, AB-, O+, O-
  dob: string;
  union_name: string; // One of Dimla's 10 unions
  ward: string;
  village: string;
  last_donation_date?: string;
  available: boolean;
  photo_url?: string;
  bio?: string;
  public_phone: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  total_donations: number;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  bags_needed: number;
  hospital_name: string;
  hospital_address: string;
  union_name: string;
  contact_name: string;
  contact_phone: string;
  needed_date_time: string;
  reason: string;
  is_urgent: boolean;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Union {
  id: string;
  name_bn: string;
  name_en: string;
  code: string;
}

export interface Village {
  id: string;
  union_id: string;
  name_bn: string;
  name_en: string;
  ward: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
}

export interface WebsiteSettings {
  site_name: string;
  site_slogan: string;
  banner_heading: string;
  banner_subheading: string;
  emergency_hotline: string;
  contact_email: string;
  contact_address: string;
  about_us: string;
  facebook_page: string;
  maintenance_mode: boolean;
  allow_registrations: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  subject?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface ActivityLog {
  id: string;
  admin_username: string;
  action: string;
  details: string;
  ip?: string;
  created_at: string;
}

export interface DatabaseSchema {
  admins: Admin[];
  donors: Donor[];
  blood_requests: BloodRequest[];
  unions: Union[];
  villages: Village[];
  notices: Notice[];
  settings: WebsiteSettings;
  contact_messages: ContactMessage[];
  activity_logs: ActivityLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// 10 Official Unions of Dimla Upazila, Nilphamari
export const INITIAL_UNIONS: Union[] = [
  { id: 'u1', name_bn: 'ডিমলা সদর', name_en: 'Dimla Sadar', code: 'DIMLA_SADAR' },
  { id: 'u2', name_bn: 'বালাপাড়া', name_en: 'Balapara', code: 'BALAPARA' },
  { id: 'u3', name_bn: 'নাউতারা', name_en: 'Nautara', code: 'NAUTARA' },
  { id: 'u4', name_bn: 'খগাখড়িবাড়ী', name_en: 'Khagakharibari', code: 'KHAGAKHARIBARI' },
  { id: 'u5', name_bn: 'গয়াবাড়ী', name_en: 'Gayabari', code: 'GAYABARI' },
  { id: 'u6', name_bn: 'পশ্চিম ছাতনাই', name_en: 'Paschim Chhatnai', code: 'PASCHIM_CHHATNAI' },
  { id: 'u7', name_bn: 'পূর্ব ছাতনাই', name_en: 'Purbo Chhatnai', code: 'PURBO_CHHATNAI' },
  { id: 'u8', name_bn: 'টেপাখড়িবাড়ী', name_en: 'Tepakharibari', code: 'TEPAKHARIBARI' },
  { id: 'u9', name_bn: 'ঝুনাগাছ চাপানী', name_en: 'Jhunagachh Chapani', code: 'JHUNAGACHH_CHAPANI' },
  { id: 'u10', name_bn: 'খালিশা চাপানী', name_en: 'Khalisha Chapani', code: 'KHALISHA_CHAPANI' },
];

export const INITIAL_VILLAGES: Village[] = [
  // ডিমলা সদর
  { id: 'v1', union_id: 'u1', name_bn: 'ডিমলা বাজার', name_en: 'Dimla Bazar', ward: '১' },
  { id: 'v2', union_id: 'u1', name_bn: 'বাবুরহাট', name_en: 'Baburhat', ward: '২' },
  { id: 'v3', union_id: 'u1', name_bn: 'রামডাঙ্গা', name_en: 'Ramdanga', ward: '৩' },
  { id: 'v4', union_id: 'u1', name_bn: 'পোদ্দারপাড়া', name_en: 'Poddarpara', ward: '৪' },
  { id: 'v5', union_id: 'u1', name_bn: 'কুঠিরডাঙ্গা', name_en: 'Kuthirdanga', ward: '৫' },
  // বালাপাড়া
  { id: 'v6', union_id: 'u2', name_bn: 'বালাপাড়া মধ্যপাড়া', name_en: 'Balapara Madhyapara', ward: '১' },
  { id: 'v7', union_id: 'u2', name_bn: 'সুন্দরখাতা', name_en: 'Sundarkhata', ward: '৩' },
  { id: 'v8', union_id: 'u2', name_bn: 'রূপহারা', name_en: 'Ruphara', ward: '৪' },
  // নাউতারা
  { id: 'v9', union_id: 'u3', name_bn: 'নাউতারা বাজার', name_en: 'Nautara Bazar', ward: '১' },
  { id: 'v10', union_id: 'u3', name_bn: 'আকাশকুড়ি', name_en: 'Akashkuri', ward: '২' },
  { id: 'v11', union_id: 'u3', name_bn: 'বাঘেরহাট', name_en: 'Bagherhat', ward: '৩' },
  // খগাখড়িবাড়ী
  { id: 'v12', union_id: 'u4', name_bn: 'খগাখড়িবাড়ী বাজার', name_en: 'Khagakharibari Bazar', ward: '১' },
  { id: 'v13', union_id: 'u4', name_bn: 'দোহলপাড়া', name_en: 'Dohalpara', ward: '২' },
  // গয়াবাড়ী
  { id: 'v14', union_id: 'u5', name_bn: 'শুটিবাড়ী বাজার', name_en: 'Shutibari Bazar', ward: '১' },
  { id: 'v15', union_id: 'u5', name_bn: 'গয়াবাড়ী', name_en: 'Gayabari', ward: '২' },
  // পশ্চিম ছাতনাই
  { id: 'v16', union_id: 'u6', name_bn: 'কালীগঞ্জ বাজার', name_en: 'Kaliganj Bazar', ward: '১' },
  { id: 'v17', union_id: 'u6', name_bn: 'ডালিয়া ব্যারেজ এলাকা', name_en: 'Dalia Barrage Area', ward: '৪' },
  // পূর্ব ছাতনাই
  { id: 'v18', union_id: 'u7', name_bn: 'পূর্ব ছাতনাই ডাঙ্গাপাড়া', name_en: 'Purbo Chhatnai Dangapara', ward: '১' },
  { id: 'v19', union_id: 'u7', name_bn: 'ঝাড়সিংহেরশ্বর', name_en: 'Jharshingheshwar', ward: '২' },
  // টেপাখড়িবাড়ী
  { id: 'v20', union_id: 'u8', name_bn: 'টেপাখড়িবাড়ী', name_en: 'Tepakharibari', ward: '১' },
  { id: 'v21', union_id: 'u8', name_bn: 'চরখড়িবাড়ী', name_en: 'Charkharibari', ward: '৩' },
  // ঝুনাগাছ চাপানী
  { id: 'v22', union_id: 'u9', name_bn: 'চাপানী বাজার', name_en: 'Chapani Bazar', ward: '১' },
  { id: 'v23', union_id: 'u9', name_bn: 'ভেন্ডাবাড়ী', name_en: 'Bhendabari', ward: '২' },
  // খালিশা চাপানী
  { id: 'v24', union_id: 'u10', name_bn: 'ছোটখাতা', name_en: 'Chhotakhata', ward: '১' },
  { id: 'v25', union_id: 'u10', name_bn: 'খালিশা চাপানী', name_en: 'Khalisha Chapani', ward: '২' },
];

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'dimla_blood_salt_2026').digest('hex');
}

export function generateToken(adminId: string, username: string): string {
  const payload = `${adminId}:${username}:${Date.now()}`;
  return crypto.createHmac('sha256', 'dimla_jwt_secret_key_2026').update(payload).digest('hex') + '.' + Buffer.from(payload).toString('base64');
}

export function verifyToken(token: string): { valid: boolean; username?: string; adminId?: string } {
  try {
    const [signature, base64Payload] = token.split('.');
    if (!signature || !base64Payload) return { valid: false };
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', 'dimla_jwt_secret_key_2026').update(payload).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    const [adminId, username] = payload.split(':');
    return { valid: true, adminId, username };
  } catch {
    return { valid: false };
  }
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading db.json, creating initial', e);
        this.data = this.createInitialData();
        this.save();
      }
    } else {
      this.data = this.createInitialData();
      this.save();
    }
  }

  private createInitialData(): DatabaseSchema {
    const adminPasswordHash = hashPassword('dimla12345');
    return {
      admins: [
        {
          id: 'admin_1',
          username: 'admin',
          password_hash: adminPasswordHash,
          name: 'প্রধান অ্যাডমিন (ডিমলা)',
          role: 'super_admin',
          phone: '01712345678',
          email: 'admin@dimlablood.org',
          created_at: new Date().toISOString(),
        },
      ],
      donors: [
        {
          id: 'donor_1',
          name: 'মো: রফিকুল ইসলাম',
          phone: '01711223344',
          blood_group: 'O+',
          dob: '1998-05-14',
          union_name: 'ডিমলা সদর',
          ward: '১',
          village: 'ডিমলা বাজার',
          last_donation_date: '2024-08-10',
          available: true,
          bio: 'স্বেচ্ছায় রক্তদান করি, বিপদে ডিমলাবাসীর পাশে থাকি।',
          public_phone: true,
          status: 'approved',
          total_donations: 4,
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'donor_2',
          name: 'আরিফুল হক',
          phone: '01722334455',
          blood_group: 'A+',
          dob: '2000-02-18',
          union_name: 'বালাপাড়া',
          ward: '৩',
          village: 'সুন্দরখাতা',
          last_donation_date: '2024-06-20',
          available: true,
          bio: 'যেকোনো জরুরি প্রয়োজনে ফোন করুন।',
          public_phone: true,
          status: 'approved',
          total_donations: 3,
          created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'donor_3',
          name: 'তানভীর আহমেদ',
          phone: '01733445566',
          blood_group: 'B+',
          dob: '1996-11-04',
          union_name: 'নাউতারা',
          ward: '১',
          village: 'নাউতারা বাজার',
          last_donation_date: '2024-09-01',
          available: true,
          bio: 'নিয়মিত রক্তদাতা ও সমাজকর্মী।',
          public_phone: true,
          status: 'approved',
          total_donations: 6,
          created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'donor_4',
          name: 'মাহমুদুল হাসান',
          phone: '01844556677',
          blood_group: 'AB+',
          dob: '2001-07-22',
          union_name: 'গয়াবাড়ী',
          ward: '১',
          village: 'শুটিবাড়ী বাজার',
          last_donation_date: '2024-07-15',
          available: true,
          bio: 'রক্তদানে ভয় নেই, আছে মানবতার আনন্দ।',
          public_phone: false,
          status: 'approved',
          total_donations: 2,
          created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'donor_5',
          name: 'শাহ আলম',
          phone: '01955667788',
          blood_group: 'O-',
          dob: '1995-09-12',
          union_name: 'পশ্চিম ছাতনাই',
          ward: '১',
          village: 'কালীগঞ্জ বাজার',
          last_donation_date: '2024-05-10',
          available: true,
          bio: 'নেগেটিভ গ্রুপের যেকোনো জরুরি প্রয়োজনে পাশে আছি।',
          public_phone: true,
          status: 'approved',
          total_donations: 5,
          created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      blood_requests: [
        {
          id: 'req_1',
          patient_name: 'মোছা: মরিয়ম বেগম',
          blood_group: 'O+',
          bags_needed: 2,
          hospital_name: 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স',
          hospital_address: 'ডিমলা সদর, নীলফামারী',
          union_name: 'ডিমলা সদর',
          contact_name: 'মো: জাহিদুল ইসলাম (রোগীর ভাই)',
          contact_phone: '01719876543',
          needed_date_time: 'আজ সন্ধ্যা ৬:০০ টা',
          reason: 'সিজারিয়ান অপারেশন ডেলিভারি',
          is_urgent: true,
          status: 'approved',
          created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'req_2',
          patient_name: 'আব্দুল করিম',
          blood_group: 'A+',
          bags_needed: 1,
          hospital_name: 'রংপুর মেডিকেল কলেজ হাসপাতাল (ডিমলা রোগী)',
          hospital_address: 'রংপুর',
          union_name: 'বালাপাড়া',
          contact_name: 'সোহেল রানা',
          contact_phone: '01725556677',
          needed_date_time: 'আগামীকাল সকাল ১০:০০ টা',
          reason: 'থ্যালাসেমিয়া নিয়মিত রক্ত গ্রহণ',
          is_urgent: false,
          status: 'approved',
          created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      unions: INITIAL_UNIONS,
      villages: INITIAL_VILLAGES,
      notices: [
        {
          id: 'not_1',
          title: 'ডিমলা ব্লাড ডোনার সোসাইটির নতুন ডিজিটাল প্ল্যাটফর্ম উদ্বোধন',
          content: 'নীলফামারী জেলার ডিমলা উপজেলার সকল মানবিক রক্তদাতাদের এক ছাতার নিচে আনতে এই ডিজিটাল প্ল্যাটফর্ম আনুষ্ঠানিকভাবে চালু হলো। রক্তের প্রয়োজনে বিনামূল্যে রক্তদাতা খুঁজতে আমাদের সাথেই থাকুন।',
          is_pinned: true,
          is_published: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 'not_2',
          title: 'রক্তদানের পূর্বে সাধারণ নির্দেশনাবলী ও স্বাস্থ্য সতর্কতা',
          content: 'রক্তদানের জন্য আপনার বয়স কমপক্ষে ১৮ বছর ও ওজন কমপক্ষে ৫০ কেজি হতে হবে। শেষ রক্তদানের পর পুরুষদের ক্ষেত্রে ৩ মাস এবং নারীদের ক্ষেত্রে ৪ মাস অতিবাহিত হওয়া আবশ্যক।',
          is_pinned: false,
          is_published: true,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ],
      settings: {
        site_name: 'ডিমলা ব্লাড ডোনার সোসাইটি',
        site_slogan: 'রক্তের প্রয়োজনে, পাশে আছি আমরা।',
        banner_heading: 'এক ব্যাগ রক্ত, বাঁচাতে পারে একটি প্রাণ।',
        banner_subheading: 'আজই রক্তদাতা হিসেবে নিবন্ধন করুন এবং ডিমলা উপজেলার মানুষের জীবন রক্ষায় অংশ নিন।',
        emergency_hotline: '01712345678',
        contact_email: 'info@dimlablood.org',
        contact_address: 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স রোড, ডিমলা, নীলফামারী',
        about_us: 'ডিমলা ব্লাড ডোনার সোসাইটি নীলফামারী জেলার ডিমলা উপজেলার একটি সম্পূর্ণ অরাজনৈতিক ও স্বেচ্ছাসেবী মানবিক উদ্যোগ। আমাদের একমাত্র লক্ষ্য রক্তের অভাবে যেন ডিমলা উপজেলার কোনো মুমূর্ষু রোগীকে কষ্ট পেতে না হয়। আমরা উপজেলার ১০টি ইউনিয়নের তরুণ-যুবকদের রক্তদানে উদ্বুদ্ধ করছি এবং জরুরি মুহূর্তে বিনামূল্যে রক্তদাতা খুঁজে দিতে কাজ করছি।',
        facebook_page: 'https://facebook.com/dimlablood',
        maintenance_mode: false,
        allow_registrations: true,
      },
      contact_messages: [],
      activity_logs: [
        {
          id: 'log_1',
          admin_username: 'system',
          action: 'SYSTEM_INIT',
          details: 'ডিমলা ব্লাড ডোনার সোসাইটি সিস্টেম সফলভাবে ইনিশিয়ালাইজ হয়েছে।',
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write db.json', e);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // Activity Log
  public addLog(adminUsername: string, action: string, details: string, ip?: string) {
    const log: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      admin_username: adminUsername,
      action,
      details,
      ip,
      created_at: new Date().toISOString(),
    };
    this.data.activity_logs.unshift(log);
    if (this.data.activity_logs.length > 200) {
      this.data.activity_logs.pop();
    }
    this.save();
  }

  // Admins
  public getAdmins() {
    return this.data.admins.map(({ password_hash, ...rest }) => rest);
  }

  public findAdminByUsername(username: string): Admin | undefined {
    return this.data.admins.find(a => a.username.toLowerCase() === username.toLowerCase());
  }

  public updateAdminPassword(adminId: string, newHash: string) {
    const admin = this.data.admins.find(a => a.id === adminId);
    if (admin) {
      admin.password_hash = newHash;
      this.save();
      return true;
    }
    return false;
  }

  public addAdmin(admin: Admin) {
    this.data.admins.push(admin);
    this.save();
  }

  // Donors
  public getDonors(filter?: {
    blood_group?: string;
    union_name?: string;
    ward?: string;
    village?: string;
    available?: boolean;
    status?: string;
    search?: string;
  }) {
    let list = this.data.donors;

    if (filter) {
      if (filter.status) {
        list = list.filter(d => d.status === filter.status);
      }
      if (filter.blood_group && filter.blood_group !== 'ALL') {
        list = list.filter(d => d.blood_group.toUpperCase() === filter.blood_group!.toUpperCase());
      }
      if (filter.union_name && filter.union_name !== 'ALL') {
        list = list.filter(d => d.union_name === filter.union_name);
      }
      if (filter.ward && filter.ward !== 'ALL') {
        list = list.filter(d => d.ward === filter.ward);
      }
      if (filter.village && filter.village.trim() !== '') {
        const v = filter.village.toLowerCase();
        list = list.filter(d => d.village.toLowerCase().includes(v));
      }
      if (typeof filter.available === 'boolean') {
        list = list.filter(d => d.available === filter.available);
      }
      if (filter.search && filter.search.trim() !== '') {
        const q = filter.search.toLowerCase();
        list = list.filter(d => 
          d.name.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.village.toLowerCase().includes(q) ||
          d.union_name.toLowerCase().includes(q)
        );
      }
    }

    return list;
  }

  public getDonorById(id: string): Donor | undefined {
    return this.data.donors.find(d => d.id === id);
  }

  public findDonorByPhone(phone: string): Donor | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.data.donors.find(d => d.phone.replace(/[^0-9]/g, '') === clean);
  }

  public addDonor(donorData: Omit<Donor, 'id' | 'created_at' | 'updated_at'>): Donor {
    const donor: Donor = {
      ...donorData,
      id: 'd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.donors.unshift(donor);
    this.save();
    return donor;
  }

  public updateDonor(id: string, updates: Partial<Donor>): Donor | null {
    const idx = this.data.donors.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.donors[idx] = {
      ...this.data.donors[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.donors[idx];
  }

  public deleteDonor(id: string): boolean {
    const lenBefore = this.data.donors.length;
    this.data.donors = this.data.donors.filter(d => d.id !== id);
    const changed = this.data.donors.length !== lenBefore;
    if (changed) this.save();
    return changed;
  }

  // Blood Requests
  public getBloodRequests(filter?: {
    status?: string;
    blood_group?: string;
    union_name?: string;
    is_urgent?: boolean;
  }) {
    let list = this.data.blood_requests;

    if (filter) {
      if (filter.status && filter.status !== 'ALL') {
        list = list.filter(r => r.status === filter.status);
      }
      if (filter.blood_group && filter.blood_group !== 'ALL') {
        list = list.filter(r => r.blood_group.toUpperCase() === filter.blood_group!.toUpperCase());
      }
      if (filter.union_name && filter.union_name !== 'ALL') {
        list = list.filter(r => r.union_name === filter.union_name);
      }
      if (typeof filter.is_urgent === 'boolean') {
        list = list.filter(r => r.is_urgent === filter.is_urgent);
      }
    }

    return list;
  }

  public getBloodRequestById(id: string): BloodRequest | undefined {
    return this.data.blood_requests.find(r => r.id === id);
  }

  public addBloodRequest(requestData: Omit<BloodRequest, 'id' | 'created_at' | 'updated_at'>): BloodRequest {
    const req: BloodRequest = {
      ...requestData,
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.blood_requests.unshift(req);
    this.save();
    return req;
  }

  public updateBloodRequest(id: string, updates: Partial<BloodRequest>): BloodRequest | null {
    const idx = this.data.blood_requests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.blood_requests[idx] = {
      ...this.data.blood_requests[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.blood_requests[idx];
  }

  public deleteBloodRequest(id: string): boolean {
    const lenBefore = this.data.blood_requests.length;
    this.data.blood_requests = this.data.blood_requests.filter(r => r.id !== id);
    const changed = this.data.blood_requests.length !== lenBefore;
    if (changed) this.save();
    return changed;
  }

  // Unions & Villages
  public getUnions() {
    return this.data.unions;
  }

  public getVillages(unionId?: string) {
    if (unionId) {
      return this.data.villages.filter(v => v.union_id === unionId);
    }
    return this.data.villages;
  }

  public addVillage(unionId: string, nameBn: string, nameEn: string, ward: string): Village {
    const village: Village = {
      id: 'v_' + Date.now(),
      union_id: unionId,
      name_bn: nameBn,
      name_en: nameEn || nameBn,
      ward: ward || '১',
    };
    this.data.villages.push(village);
    this.save();
    return village;
  }

  public deleteVillage(id: string): boolean {
    const lenBefore = this.data.villages.length;
    this.data.villages = this.data.villages.filter(v => v.id !== id);
    if (this.data.villages.length !== lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Notices
  public getNotices() {
    return this.data.notices;
  }

  public addNotice(notice: Omit<Notice, 'id' | 'created_at'>): Notice {
    const newNotice: Notice = {
      ...notice,
      id: 'not_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.data.notices.unshift(newNotice);
    this.save();
    return newNotice;
  }

  public updateNotice(id: string, updates: Partial<Notice>): Notice | null {
    const idx = this.data.notices.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.data.notices[idx] = { ...this.data.notices[idx], ...updates };
    this.save();
    return this.data.notices[idx];
  }

  public deleteNotice(id: string): boolean {
    const len = this.data.notices.length;
    this.data.notices = this.data.notices.filter(n => n.id !== id);
    if (this.data.notices.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // Settings
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  // Contact Messages
  public addContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      created_at: new Date().toISOString(),
      is_read: false,
    };
    this.data.contact_messages.unshift(newMsg);
    this.save();
    return newMsg;
  }

  public getContactMessages() {
    return this.data.contact_messages;
  }

  public markMessageRead(id: string) {
    const msg = this.data.contact_messages.find(m => m.id === id);
    if (msg) {
      msg.is_read = true;
      this.save();
    }
  }

  // Stats
  public getStats() {
    const allDonors = this.data.donors;
    const approvedDonors = allDonors.filter(d => d.status === 'approved');
    const pendingDonors = allDonors.filter(d => d.status === 'pending');
    const activeDonors = approvedDonors.filter(d => d.available);
    const inactiveDonors = approvedDonors.filter(d => !d.available);

    const allReqs = this.data.blood_requests;
    const pendingReqs = allReqs.filter(r => r.status === 'pending');
    const approvedReqs = allReqs.filter(r => r.status === 'approved');
    const completedReqs = allReqs.filter(r => r.status === 'completed');

    const totalDonations = approvedDonors.reduce((sum, d) => sum + (d.total_donations || 1), 0) + completedReqs.length * 2;

    return {
      total_donors: approvedDonors.length,
      pending_donors: pendingDonors.length,
      active_donors: activeDonors.length,
      inactive_donors: inactiveDonors.length,
      total_requests: allReqs.length,
      pending_requests: pendingReqs.length,
      active_requests: approvedReqs.length,
      completed_requests: completedReqs.length,
      total_donations: totalDonations,
      unions_count: this.data.unions.length,
    };
  }
}

export const db = new DatabaseService();
