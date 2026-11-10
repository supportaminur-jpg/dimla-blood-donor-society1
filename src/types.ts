export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Donor {
  id: string;
  name: string;
  phone: string;
  alt_phone?: string;
  blood_group: BloodGroup;
  dob: string;
  union_name: string;
  ward: string;
  village: string;
  last_donation_date?: string;
  available: boolean;
  photo_url?: string;
  bio?: string;
  public_phone: boolean;
  is_phone_hidden?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  total_donations: number;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
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

export interface ActivityLog {
  id: string;
  admin_username: string;
  action: string;
  details: string;
  ip?: string;
  created_at: string;
}

export interface Stats {
  total_donors: number;
  pending_donors: number;
  active_donors: number;
  inactive_donors: number;
  total_requests: number;
  pending_requests: number;
  active_requests: number;
  completed_requests: number;
  total_donations: number;
  unions_count: number;
}
