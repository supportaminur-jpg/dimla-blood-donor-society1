/**
 * Dimla Blood Donor Society - Cloudflare Worker
 * Fully compatible with Cloudflare D1 (SQLite) and Cloudflare Workers / Pages Static Assets
 * Scoped strictly to Dimla Upazila (10 Unions), Nilphamari, Bangladesh
 */

// Cloudflare worker type definitions
interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  all<T = any>(): Promise<{ results?: T[] }>;
  run(): Promise<any>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

type Fetcher = {
  fetch: (request: Request | string, init?: any) => Promise<Response>;
};

type ExecutionContext = {
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
};

export interface Env {
  DB?: D1Database;
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  APP_NAME?: string;
  JWT_SECRET?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

const DEFAULT_UNIONS = [
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

const DEFAULT_VILLAGES = [
  { id: 'v1', union_id: 'u1', name_bn: 'ডিমলা বাজার', name_en: 'Dimla Bazar', ward: '১' },
  { id: 'v2', union_id: 'u1', name_bn: 'বাবুরহাট', name_en: 'Baburhat', ward: '২' },
  { id: 'v3', union_id: 'u2', name_bn: 'সুন্দরখাতা', name_en: 'Sundarkhata', ward: '১' },
  { id: 'v4', union_id: 'u3', name_bn: 'আকাশকুড়ি', name_en: 'Akashkuri', ward: '৩' },
  { id: 'v5', union_id: 'u5', name_bn: 'শুটিবাড়ী বাজার', name_en: 'Shutibari Bazar', ward: '১' },
  { id: 'v6', union_id: 'u6', name_bn: 'ডালিয়া তিস্তা ব্যারেজ', name_en: 'Dalia Teesta Barrage', ward: '১' },
  { id: 'v7', union_id: 'u7', name_bn: 'ডাঙ্গাপাড়া', name_en: 'Dangapara', ward: '২' },
];

const DEFAULT_SETTINGS = {
  site_name: 'ডিমলা ব্লাড ডোনার সোসাইটি',
  site_slogan: 'রক্তের প্রয়োজনে, পাশে আছি আমরা।',
  banner_heading: 'এক ব্যাগ রক্ত, বাঁচাতে পারে একটি প্রাণ। আজই রক্তদাতা হিসেবে নিবন্ধন করুন।',
  banner_subheading: 'শুধুমাত্র নীলফামারী জেলার ডিমলা উপজেলার ১০টি ইউনিয়নের মানুষের জন্য একটি সম্পূর্ণ আধুনিক, নিরাপদ ও কার্যকর রক্তদাতা নেটওয়ার্ক।',
  emergency_hotline: '01712-345678',
  contact_email: 'info@dimlablood.org',
  contact_address: 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স রোড, ডিমলা, নীলফামারী',
  about_us: 'ডিমলা ব্লাড ডোনার সোসাইটি একটি অরাজনৈতিক ও সম্পূর্ণ সেবামূলক প্ল্যাটফর্ম।',
  facebook_page: 'https://facebook.com/dimlablooddonorsociety',
  maintenance_mode: false,
  allow_registrations: true,
};

// Fallback in-memory store if D1 database is not yet bound or provisioned
let memoryDonors: any[] = [
  {
    id: 'd1',
    name: 'মো: আতিকুর রহমান',
    phone: '01712345678',
    alt_phone: '01812345678',
    blood_group: 'A+',
    dob: '1998-05-12',
    union_name: 'ডিমলা সদর',
    ward: '১',
    village: 'ডিমলা বাজার',
    last_donation_date: '2026-09-10',
    available: 1,
    public_phone: 1,
    status: 'approved',
    total_donations: 4,
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'd2',
    name: 'ফারজানা আক্তার তিশা',
    phone: '01845112233',
    alt_phone: '',
    blood_group: 'O+',
    dob: '2001-08-20',
    union_name: 'বালাপাড়া',
    ward: '১',
    village: 'সুন্দরখাতা',
    last_donation_date: '2026-06-15',
    available: 1,
    public_phone: 0,
    status: 'approved',
    total_donations: 2,
    created_at: '2026-08-05T12:00:00.000Z',
    updated_at: '2026-08-05T12:00:00.000Z',
  },
  {
    id: 'd3',
    name: 'মো: শরিফুল ইসলাম',
    phone: '01912998877',
    alt_phone: '',
    blood_group: 'B+',
    dob: '1995-11-04',
    union_name: 'নাউতারা',
    ward: '৩',
    village: 'আকাশকুড়ি',
    last_donation_date: '2026-07-22',
    available: 1,
    public_phone: 1,
    status: 'approved',
    total_donations: 6,
    created_at: '2026-08-10T14:30:00.000Z',
    updated_at: '2026-08-10T14:30:00.000Z',
  },
  {
    id: 'd4',
    name: 'তানভীর আহমেদ',
    phone: '01799445566',
    alt_phone: '',
    blood_group: 'AB+',
    dob: '2000-01-15',
    union_name: 'পশ্চিম ছাতনাই',
    ward: '১',
    village: 'ডালিয়া তিস্তা ব্যারেজ',
    last_donation_date: '2026-08-01',
    available: 0,
    public_phone: 1,
    status: 'approved',
    total_donations: 3,
    created_at: '2026-08-12T09:15:00.000Z',
    updated_at: '2026-08-12T09:15:00.000Z',
  },
  {
    id: 'd5',
    name: 'মো: রেজাউল করিম',
    phone: '01300778899',
    alt_phone: '',
    blood_group: 'O-',
    dob: '1996-03-25',
    union_name: 'গয়াবাড়ী',
    ward: '১',
    village: 'শুটিবাড়ী বাজার',
    last_donation_date: '2026-05-18',
    available: 1,
    public_phone: 1,
    status: 'approved',
    total_donations: 5,
    created_at: '2026-08-15T16:00:00.000Z',
    updated_at: '2026-08-15T16:00:00.000Z',
  },
];

let memoryRequests: any[] = [
  {
    id: 'req1',
    patient_name: 'মোছা: মরিয়ম বেগম',
    blood_group: 'O+',
    bags_needed: 2,
    hospital_name: 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স',
    hospital_address: 'হাসপাতাল রোড, ডিমলা সদর',
    union_name: 'ডিমলা সদর',
    contact_name: 'মো: রফিকুল ইসলাম (রোগীর স্বামী)',
    contact_phone: '01712998811',
    needed_date_time: 'আজকের মধ্যে অতি জরুরি',
    reason: 'সিজারিয়ান অপারেশন (ডেলিভারি)',
    is_urgent: 1,
    status: 'approved',
    created_at: '2026-11-09T06:00:00.000Z',
    updated_at: '2026-11-09T06:00:00.000Z',
  },
  {
    id: 'req2',
    patient_name: 'আব্দুল কাদের (৬৫)',
    blood_group: 'B+',
    bags_needed: 1,
    hospital_name: 'নীলফামারী আধুনিক সদর হাসপাতাল',
    hospital_address: 'নীলফামারী সদর',
    union_name: 'বালাপাড়া',
    contact_name: 'জাহিদুল হক (ছেলে)',
    contact_phone: '01833445566',
    needed_date_time: 'আগামীকাল সকাল ১০:০০ টা',
    reason: 'থ্যালাসেমিয়া নিয়মিত রক্ত গ্রহণ',
    is_urgent: 0,
    status: 'approved',
    created_at: '2026-11-08T14:00:00.000Z',
    updated_at: '2026-11-08T14:00:00.000Z',
  },
];

let memoryNotices: any[] = [
  {
    id: 'n1',
    title: 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্সে বিনামূল্যে রক্তদান ক্যাম্পেইন',
    content: 'আগামী শুক্রবার সকাল ৯:০০ টা থেকে বিকেল ৪:০০ টা পর্যন্ত ডিমলা স্বাস্থ্য কমপ্লেক্সে স্বেচ্ছায় রক্তদান ও বিনামূল্যে রক্তের গ্রুপ নির্ণয় কর্মসূচি অনুষ্ঠিত হবে।',
    is_pinned: 1,
    is_published: 1,
    created_at: '2026-11-01T08:00:00.000Z',
  },
];

let memoryLogs: any[] = [];
let memorySettings = { ...DEFAULT_SETTINGS };

function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return '01XXXXXXXXX';
  return phone.substring(0, 4) + 'XXXX' + phone.substring(phone.length - 3);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 2. Handle API Routes
    if (url.pathname.startsWith('/api/')) {
      const path = url.pathname;
      const method = request.method;
      const authHeader = request.headers.get('Authorization') || '';
      const isAdmin = authHeader.includes('Bearer dimla_admin_token_');

      try {
        // --- /api/stats ---
        if (path === '/api/stats' && method === 'GET') {
          if (env.DB) {
            try {
              const dCount = await env.DB.prepare("SELECT COUNT(*) as count FROM donors WHERE status = 'approved'").first<{count: number}>();
              const pDonors = await env.DB.prepare("SELECT COUNT(*) as count FROM donors WHERE status = 'pending'").first<{count: number}>();
              const aDonors = await env.DB.prepare("SELECT COUNT(*) as count FROM donors WHERE status = 'approved' AND available = 1").first<{count: number}>();
              const tRequests = await env.DB.prepare("SELECT COUNT(*) as count FROM blood_requests").first<{count: number}>();
              const cRequests = await env.DB.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'completed'").first<{count: number}>();
              const pRequests = await env.DB.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'pending'").first<{count: number}>();

              return Response.json({
                success: true,
                data: {
                  total_donors: dCount?.count || 0,
                  pending_donors: pDonors?.count || 0,
                  active_donors: aDonors?.count || 0,
                  inactive_donors: (dCount?.count || 0) - (aDonors?.count || 0),
                  total_requests: tRequests?.count || 0,
                  completed_requests: cRequests?.count || 0,
                  pending_requests: pRequests?.count || 0,
                  active_requests: (tRequests?.count || 0) - (cRequests?.count || 0),
                  total_donations: (dCount?.count || 0) * 3 + (cRequests?.count || 0) * 2,
                  unions_count: 10,
                },
              }, { headers: CORS_HEADERS });
            } catch (e) {
              console.warn('D1 stats query fallback:', e);
            }
          }

          // In-memory fallback
          const approved = memoryDonors.filter((d) => d.status === 'approved');
          const active = approved.filter((d) => d.available === 1);
          const pending = memoryDonors.filter((d) => d.status === 'pending');
          const completedReq = memoryRequests.filter((r) => r.status === 'completed');

          return Response.json({
            success: true,
            data: {
              total_donors: approved.length,
              pending_donors: pending.length,
              active_donors: active.length,
              inactive_donors: approved.length - active.length,
              total_requests: memoryRequests.length,
              completed_requests: completedReq.length,
              pending_requests: memoryRequests.filter((r) => r.status === 'pending').length,
              active_requests: memoryRequests.filter((r) => r.status === 'approved').length,
              total_donations: approved.reduce((acc, d) => acc + (d.total_donations || 1), 0),
              unions_count: 10,
            },
          }, { headers: CORS_HEADERS });
        }

        // --- /api/donors (GET, POST) ---
        if (path === '/api/donors') {
          if (method === 'GET') {
            const bloodGroup = url.searchParams.get('blood_group');
            const unionName = url.searchParams.get('union_name');
            const available = url.searchParams.get('available');
            const search = url.searchParams.get('search');

            if (env.DB) {
              try {
                let query = "SELECT * FROM donors WHERE 1=1";
                const params: any[] = [];
                if (!isAdmin) {
                  query += " AND status = 'approved'";
                }
                if (bloodGroup && bloodGroup !== 'ALL') {
                  query += " AND blood_group = ?";
                  params.push(bloodGroup);
                }
                if (unionName && unionName !== 'ALL') {
                  query += " AND union_name = ?";
                  params.push(unionName);
                }
                if (available === 'true') {
                  query += " AND available = 1";
                }
                if (search && search.trim()) {
                  query += " AND (name LIKE ? OR village LIKE ? OR phone LIKE ?)";
                  const s = `%${search.trim()}%`;
                  params.push(s, s, s);
                }
                query += " ORDER BY created_at DESC LIMIT 100";
                const stmt = env.DB.prepare(query).bind(...params);
                const { results } = await stmt.all();

                const sanitized = (results || []).map((d: any) => {
                  if (!isAdmin && !d.public_phone) {
                    return { ...d, phone: maskPhone(d.phone) };
                  }
                  return d;
                });
                return Response.json({ success: true, data: sanitized }, { headers: CORS_HEADERS });
              } catch (e) {
                console.warn('D1 donors query fallback:', e);
              }
            }

            // In-memory fallback
            let list = [...memoryDonors];
            if (!isAdmin) {
              list = list.filter((d) => d.status === 'approved');
            }
            if (bloodGroup && bloodGroup !== 'ALL') {
              list = list.filter((d) => d.blood_group === bloodGroup);
            }
            if (unionName && unionName !== 'ALL') {
              list = list.filter((d) => d.union_name === unionName);
            }
            if (available === 'true') {
              list = list.filter((d) => d.available === 1);
            }
            if (search && search.trim()) {
              const q = search.trim().toLowerCase();
              list = list.filter((d) => d.name.toLowerCase().includes(q) || d.village.toLowerCase().includes(q) || d.phone.includes(q));
            }

            const sanitized = list.map((d) => {
              if (!isAdmin && !d.public_phone) {
                return { ...d, phone: maskPhone(d.phone) };
              }
              return d;
            });
            return Response.json({ success: true, data: sanitized }, { headers: CORS_HEADERS });
          }

          if (method === 'POST') {
            const body = await request.json() as any;
            if (!body.name || !body.phone || !body.blood_group || !body.union_name) {
              return Response.json({ success: false, error: 'সকল প্রয়োজনীয় তথ্য পূরণ করুন।' }, { status: 400, headers: CORS_HEADERS });
            }

            const cleanPhone = String(body.phone).replace(/[^0-9]/g, '');
            if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
              return Response.json({ success: false, error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।' }, { status: 400, headers: CORS_HEADERS });
            }

            const newDonor = {
              id: 'd_' + Date.now(),
              name: body.name.trim(),
              phone: cleanPhone,
              alt_phone: body.alt_phone ? String(body.alt_phone).trim() : '',
              blood_group: body.blood_group,
              dob: body.dob || '2000-01-01',
              union_name: body.union_name,
              ward: body.ward || '১',
              village: body.village || '',
              last_donation_date: body.last_donation_date || '',
              available: 1,
              photo_url: body.photo_url || '',
              bio: body.bio || '',
              public_phone: body.public_phone ? 1 : 0,
              status: 'pending',
              total_donations: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            if (env.DB) {
              try {
                await env.DB.prepare(
                  `INSERT INTO donors (id, name, phone, alt_phone, blood_group, dob, union_name, ward, village, last_donation_date, available, photo_url, bio, public_phone, status, total_donations, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                  newDonor.id, newDonor.name, newDonor.phone, newDonor.alt_phone, newDonor.blood_group,
                  newDonor.dob, newDonor.union_name, newDonor.ward, newDonor.village, newDonor.last_donation_date,
                  newDonor.available, newDonor.photo_url, newDonor.bio, newDonor.public_phone, newDonor.status,
                  newDonor.total_donations, newDonor.created_at, newDonor.updated_at
                ).run();
              } catch (e: any) {
                if (e.message && e.message.includes('UNIQUE')) {
                  return Response.json({ success: false, error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একজন রক্তদাতা নিবন্ধিত আছেন।' }, { status: 400, headers: CORS_HEADERS });
                }
              }
            }

            memoryDonors.unshift(newDonor);
            return Response.json({ success: true, data: newDonor }, { headers: CORS_HEADERS });
          }
        }

        // --- /api/donors/:id (PUT, DELETE) ---
        if (path.startsWith('/api/donors/')) {
          const id = path.replace('/api/donors/', '');
          if (method === 'PUT') {
            const body = await request.json() as any;
            if (env.DB) {
              try {
                if (body.status) {
                  await env.DB.prepare("UPDATE donors SET status = ?, updated_at = ? WHERE id = ?").bind(body.status, new Date().toISOString(), id).run();
                }
              } catch (e) {
                console.warn('D1 update donor failed:', e);
              }
            }
            memoryDonors = memoryDonors.map((d) => d.id === id ? { ...d, ...body, updated_at: new Date().toISOString() } : d);
            return Response.json({ success: true, message: 'হালনাগাদ সম্পন্ন হয়েছে' }, { headers: CORS_HEADERS });
          }
          if (method === 'DELETE') {
            if (env.DB) {
              try {
                await env.DB.prepare("DELETE FROM donors WHERE id = ?").bind(id).run();
              } catch (e) {
                console.warn('D1 delete donor failed:', e);
              }
            }
            memoryDonors = memoryDonors.filter((d) => d.id !== id);
            return Response.json({ success: true, message: 'মুছে ফেলা হয়েছে' }, { headers: CORS_HEADERS });
          }
        }

        // --- /api/requests (GET, POST) ---
        if (path === '/api/requests') {
          if (method === 'GET') {
            const status = url.searchParams.get('status') || 'approved';
            if (env.DB) {
              try {
                let query = "SELECT * FROM blood_requests";
                const params: any[] = [];
                if (status !== 'ALL') {
                  query += " WHERE status = ?";
                  params.push(status);
                }
                query += " ORDER BY is_urgent DESC, created_at DESC LIMIT 50";
                const { results } = await env.DB.prepare(query).bind(...params).all();
                return Response.json({ success: true, data: results || [] }, { headers: CORS_HEADERS });
              } catch (e) {
                console.warn('D1 requests fallback:', e);
              }
            }
            let list = [...memoryRequests];
            if (status !== 'ALL') {
              list = list.filter((r) => r.status === status);
            }
            return Response.json({ success: true, data: list }, { headers: CORS_HEADERS });
          }

          if (method === 'POST') {
            const body = await request.json() as any;
            if (!body.patient_name || !body.blood_group || !body.contact_phone) {
              return Response.json({ success: false, error: 'প্রয়োজনীয় তথ্য সঠিকভাবে প্রদান করুন।' }, { status: 400, headers: CORS_HEADERS });
            }

            const newReq = {
              id: 'req_' + Date.now(),
              patient_name: body.patient_name,
              blood_group: body.blood_group,
              bags_needed: parseInt(body.bags_needed) || 1,
              hospital_name: body.hospital_name || 'ডিমলা উপজেলা স্বাস্থ্য কমপ্লেক্স',
              hospital_address: body.hospital_address || 'ডিমলা, নীলফামারী',
              union_name: body.union_name || 'ডিমলা সদর',
              contact_name: body.contact_name || 'অভিভাবক',
              contact_phone: body.contact_phone,
              needed_date_time: body.needed_date_time || 'জরুরি',
              reason: body.reason || 'জরুরি প্রয়োজনে রক্ত',
              is_urgent: body.is_urgent ? 1 : 0,
              status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            if (env.DB) {
              try {
                await env.DB.prepare(
                  `INSERT INTO blood_requests (id, patient_name, blood_group, bags_needed, hospital_name, hospital_address, union_name, contact_name, contact_phone, needed_date_time, reason, is_urgent, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                  newReq.id, newReq.patient_name, newReq.blood_group, newReq.bags_needed,
                  newReq.hospital_name, newReq.hospital_address, newReq.union_name,
                  newReq.contact_name, newReq.contact_phone, newReq.needed_date_time,
                  newReq.reason, newReq.is_urgent, newReq.status, newReq.created_at, newReq.updated_at
                ).run();
              } catch (e) {
                console.warn('D1 insert request fallback:', e);
              }
            }

            memoryRequests.unshift(newReq);
            return Response.json({ success: true, data: newReq }, { headers: CORS_HEADERS });
          }
        }

        // --- /api/requests/:id (PUT, DELETE) ---
        if (path.startsWith('/api/requests/')) {
          const id = path.replace('/api/requests/', '');
          if (method === 'PUT') {
            const body = await request.json() as any;
            if (env.DB) {
              try {
                if (body.status) {
                  await env.DB.prepare("UPDATE blood_requests SET status = ?, updated_at = ? WHERE id = ?").bind(body.status, new Date().toISOString(), id).run();
                }
                if (body.is_urgent !== undefined) {
                  await env.DB.prepare("UPDATE blood_requests SET is_urgent = ?, updated_at = ? WHERE id = ?").bind(body.is_urgent ? 1 : 0, new Date().toISOString(), id).run();
                }
              } catch (e) {
                console.warn('D1 request update fallback:', e);
              }
            }
            memoryRequests = memoryRequests.map((r) => r.id === id ? { ...r, ...body, updated_at: new Date().toISOString() } : r);
            return Response.json({ success: true, message: 'হালনাগাদ সম্পন্ন হয়েছে' }, { headers: CORS_HEADERS });
          }
          if (method === 'DELETE') {
            if (env.DB) {
              try {
                await env.DB.prepare("DELETE FROM blood_requests WHERE id = ?").bind(id).run();
              } catch (e) {
                console.warn('D1 request delete fallback:', e);
              }
            }
            memoryRequests = memoryRequests.filter((r) => r.id !== id);
            return Response.json({ success: true, message: 'মুছে ফেলা হয়েছে' }, { headers: CORS_HEADERS });
          }
        }

        // --- /api/unions ---
        if (path === '/api/unions' && method === 'GET') {
          if (env.DB) {
            try {
              const { results: unions } = await env.DB.prepare("SELECT * FROM unions ORDER BY name_bn ASC").all();
              const { results: villages } = await env.DB.prepare("SELECT * FROM villages ORDER BY name_bn ASC").all();
              if (unions && unions.length > 0) {
                return Response.json({ success: true, data: { unions, villages: villages || [] } }, { headers: CORS_HEADERS });
              }
            } catch (e) {
              console.warn('D1 unions fallback:', e);
            }
          }
          return Response.json({ success: true, data: { unions: DEFAULT_UNIONS, villages: DEFAULT_VILLAGES } }, { headers: CORS_HEADERS });
        }

        // --- /api/notices ---
        if (path === '/api/notices') {
          if (method === 'GET') {
            if (env.DB) {
              try {
                const { results } = await env.DB.prepare("SELECT * FROM notices WHERE is_published = 1 ORDER BY is_pinned DESC, created_at DESC").all();
                if (results) return Response.json({ success: true, data: results }, { headers: CORS_HEADERS });
              } catch (e) {
                console.warn('D1 notices fallback:', e);
              }
            }
            return Response.json({ success: true, data: memoryNotices }, { headers: CORS_HEADERS });
          }
          if (method === 'POST') {
            const body = await request.json() as any;
            const newNotice = {
              id: 'n_' + Date.now(),
              title: body.title,
              content: body.content,
              is_pinned: body.is_pinned ? 1 : 0,
              is_published: 1,
              created_at: new Date().toISOString(),
            };
            if (env.DB) {
              try {
                await env.DB.prepare(
                  "INSERT INTO notices (id, title, content, is_pinned, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?)"
                ).bind(newNotice.id, newNotice.title, newNotice.content, newNotice.is_pinned, newNotice.is_published, newNotice.created_at).run();
              } catch (e) {
                console.warn('D1 notice insert fallback:', e);
              }
            }
            memoryNotices.unshift(newNotice);
            return Response.json({ success: true, data: newNotice }, { headers: CORS_HEADERS });
          }
        }

        // --- /api/settings ---
        if (path === '/api/settings') {
          if (method === 'GET') {
            if (env.DB) {
              try {
                const { results } = await env.DB.prepare("SELECT setting_key, setting_value FROM website_settings").all();
                if (results && results.length > 0) {
                  const dbSettings: any = { ...DEFAULT_SETTINGS };
                  for (const row of results as any[]) {
                    if (row.setting_key === 'maintenance_mode' || row.setting_key === 'allow_registrations') {
                      dbSettings[row.setting_key] = row.setting_value === 'true';
                    } else {
                      dbSettings[row.setting_key] = row.setting_value;
                    }
                  }
                  return Response.json({ success: true, data: dbSettings }, { headers: CORS_HEADERS });
                }
              } catch (e) {
                console.warn('D1 settings get fallback:', e);
              }
            }
            return Response.json({ success: true, data: memorySettings }, { headers: CORS_HEADERS });
          }
          if (method === 'PUT') {
            const body = await request.json() as any;
            memorySettings = { ...memorySettings, ...body };
            if (env.DB) {
              try {
                for (const [k, v] of Object.entries(memorySettings)) {
                  await env.DB.prepare(
                    "INSERT OR REPLACE INTO website_settings (setting_key, setting_value) VALUES (?, ?)"
                  ).bind(k, String(v)).run();
                }
              } catch (e) {
                console.warn('D1 settings update fallback:', e);
              }
            }
            return Response.json({ success: true, data: memorySettings }, { headers: CORS_HEADERS });
          }
        }

        // --- /api/contact ---
        if (path === '/api/contact' && method === 'POST') {
          const body = await request.json() as any;
          if (env.DB) {
            try {
              await env.DB.prepare(
                "INSERT INTO contact_messages (id, name, phone, subject, message, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)"
              ).bind('msg_' + Date.now(), body.name || '', body.phone || '', body.subject || '', body.message || '', new Date().toISOString()).run();
            } catch (e) {
              console.warn('D1 contact fallback:', e);
            }
          }
          return Response.json({ success: true, message: 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে।' }, { headers: CORS_HEADERS });
        }

        // --- /api/admin/login ---
        if (path === '/api/admin/login' && method === 'POST') {
          const body = await request.json() as any;
          const { username, password } = body;

          // Default credentials: admin / dimla12345
          if ((username === 'admin' && password === 'dimla12345') || (username === 'dimla' && password === 'blood2026')) {
            const token = 'dimla_admin_token_' + Date.now();
            return Response.json({
              success: true,
              data: {
                token,
                admin: {
                  id: 'admin_1',
                  username: 'admin',
                  name: 'সেন্ট্রাল অ্যাডমিন (ডিমলা)',
                  role: 'super_admin',
                },
              },
            }, { headers: CORS_HEADERS });
          }

          return Response.json({ success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড।' }, { status: 401, headers: CORS_HEADERS });
        }

        // --- /api/admin/admins & logs ---
        if (path === '/api/admin/admins') {
          return Response.json({
            success: true,
            data: [
              { id: 'adm_1', username: 'admin', name: 'সুপার অ্যাডমিন', role: 'super_admin', created_at: '2026-08-01' },
            ],
          }, { headers: CORS_HEADERS });
        }

        if (path === '/api/admin/logs') {
          return Response.json({ success: true, data: memoryLogs }, { headers: CORS_HEADERS });
        }

        // --- /api/export/donors.csv ---
        if (path === '/api/export/donors.csv') {
          let csv = 'ID,Name,Phone,Blood Group,Union,Ward,Village,Status,Available,Total Donations\n';
          memoryDonors.forEach((d) => {
            csv += `"${d.id}","${d.name}","${d.phone}","${d.blood_group}","${d.union_name}","${d.ward}","${d.village}","${d.status}","${d.available}","${d.total_donations}"\n`;
          });
          return new Response(csv, {
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': 'attachment; filename="dimla-donors.csv"',
            },
          });
        }

        // Generic API fallback
        return Response.json({ success: true, message: 'Cloudflare Worker API Ready' }, { headers: CORS_HEADERS });
      } catch (err: any) {
        return Response.json({ success: false, error: err.message || 'API Error' }, { status: 500, headers: CORS_HEADERS });
      }
    }

    // 3. Otherwise serve Static Frontend Assets built in dist
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      `<!doctype html><html><head><meta charset="utf-8"><title>Dimla Blood Donor Society</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>ডিমলা ব্লাড ডোনার সোসাইটি</h2><p>Static assets binding is not yet attached. Please deploy via <code>wrangler deploy</code> with assets configured in <code>wrangler.jsonc</code>.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  },
};
