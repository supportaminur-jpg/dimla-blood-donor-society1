-- Dimla Blood Donor Society (ডিমলা ব্লাড ডোনার সোসাইটি)
-- Cloudflare D1 Database Schema & Initial Migrations
-- Location: Dimla Upazila, Nilphamari, Bangladesh

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  phone TEXT,
  email TEXT,
  created_at TEXT NOT NULL,
  last_login TEXT
);

-- 2. Donors Table
CREATE TABLE IF NOT EXISTS donors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  alt_phone TEXT,
  blood_group TEXT NOT NULL,
  dob TEXT NOT NULL,
  union_name TEXT NOT NULL,
  ward TEXT NOT NULL,
  village TEXT NOT NULL,
  last_donation_date TEXT,
  available INTEGER DEFAULT 1,
  photo_url TEXT,
  bio TEXT,
  public_phone INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  total_donations INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  bags_needed INTEGER NOT NULL DEFAULT 1,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  union_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  needed_date_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  is_urgent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 4. Unions Table (10 Unions of Dimla Upazila)
CREATE TABLE IF NOT EXISTS unions (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);

-- 5. Villages Table
CREATE TABLE IF NOT EXISTS villages (
  id TEXT PRIMARY KEY,
  union_id TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  ward TEXT NOT NULL,
  FOREIGN KEY (union_id) REFERENCES unions(id) ON DELETE CASCADE
);

-- 6. Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- 7. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL
);

-- 8. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_read INTEGER DEFAULT 0
);

-- 9. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip TEXT,
  created_at TEXT NOT NULL
);

-- Indexes for lightning-fast search on D1
CREATE INDEX IF NOT EXISTS idx_donors_search ON donors(blood_group, union_name, available, status);
CREATE INDEX IF NOT EXISTS idx_requests_status ON blood_requests(status, is_urgent);
CREATE INDEX IF NOT EXISTS idx_villages_union ON villages(union_id);

-- Seed Dimla 10 Unions
INSERT OR IGNORE INTO unions (id, name_bn, name_en, code) VALUES
('u1', 'ডিমলা সদর', 'Dimla Sadar', 'DIMLA_SADAR'),
('u2', 'বালাপাড়া', 'Balapara', 'BALAPARA'),
('u3', 'নাউতারা', 'Nautara', 'NAUTARA'),
('u4', 'খগাখড়িবাড়ী', 'Khagakharibari', 'KHAGAKHARIBARI'),
('u5', 'গয়াবাড়ী', 'Gayabari', 'GAYABARI'),
('u6', 'পশ্চিম ছাতনাই', 'Paschim Chhatnai', 'PASCHIM_CHHATNAI'),
('u7', 'পূর্ব ছাতনাই', 'Purbo Chhatnai', 'PURBO_CHHATNAI'),
('u8', 'টেপাখড়িবাড়ী', 'Tepakharibari', 'TEPAKHARIBARI'),
('u9', 'ঝুনাগাছ চাপানী', 'Jhunagachh Chapani', 'JHUNAGACHH_CHAPANI'),
('u10', 'খালিশা চাপানী', 'Khalisha Chapani', 'KHALISHA_CHAPANI');
