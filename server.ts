import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, generateToken, verifyToken, INITIAL_UNIONS } from './server/db.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent browser/CDN caching on all dynamic API responses
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Helper middleware for admin authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'অননুমোদিত প্রবেশ। অনুগ্রহ করে অ্যাডমিন লগইন করুন।' });
  }
  const token = authHeader.substring(7);
  const result = verifyToken(token);
  if (!result.valid || !result.username) {
    return res.status(401).json({ success: false, error: 'লগইন সেশন মেয়াদোত্তীর্ণ হয়েছে। পুনরায় লগইন করুন।' });
  }
  (req as any).admin = { username: result.username, adminId: result.adminId };
  next();
}

function optionalAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const result = verifyToken(token);
    if (result.valid) {
      (req as any).admin = { username: result.username, adminId: result.adminId };
    }
  }
  next();
}

// ----------------- API ROUTES -----------------

// 1. Stats
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Website Settings
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const updated = db.updateSettings(req.body);
    db.addLog(admin.username, 'UPDATE_SETTINGS', 'ওয়েবসাইটের সেটিংস হালনাগাদ করা হয়েছে।', req.ip);
    res.json({ success: true, data: updated, message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Unions & Villages
app.get('/api/unions', (req: Request, res: Response) => {
  try {
    const unions = db.getUnions();
    const villages = db.getVillages();
    res.json({ success: true, data: { unions, villages } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/unions/:id/villages', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name_bn, name_en, ward } = req.body;
    if (!name_bn) {
      return res.status(400).json({ success: false, error: 'গ্রামের নাম আবশ্যক।' });
    }
    const admin = (req as any).admin;
    const village = db.addVillage(req.params.id, name_bn, name_en, ward);
    db.addLog(admin.username, 'ADD_VILLAGE', `নতুন গ্রাম যোগ করা হয়েছে: ${name_bn}`, req.ip);
    res.json({ success: true, data: village });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/villages/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const success = db.deleteVillage(req.params.id);
    if (success) {
      db.addLog(admin.username, 'DELETE_VILLAGE', `গ্রাম মুছে ফেলা হয়েছে (ID: ${req.params.id})`, req.ip);
      res.json({ success: true, message: 'গ্রাম সফলভাবে মুছে ফেলা হয়েছে।' });
    } else {
      res.status(404).json({ success: false, error: 'গ্রাম পাওয়া যায়নি।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Donors Search & Management
app.get('/api/donors', optionalAdmin, (req: Request, res: Response) => {
  try {
    const isAdmin = Boolean((req as any).admin);
    const { blood_group, union_name, ward, village, available, status, search } = req.query;

    const filter: any = {};
    if (blood_group) filter.blood_group = String(blood_group);
    if (union_name) filter.union_name = String(union_name);
    if (ward) filter.ward = String(ward);
    if (village) filter.village = String(village);
    if (search) filter.search = String(search);
    if (available === 'true') filter.available = true;
    if (available === 'false') filter.available = false;

    // Non-admin can only see approved donors
    if (!isAdmin) {
      filter.status = 'approved';
    } else if (status) {
      filter.status = String(status);
    }

    const donors = db.getDonors(filter);

    // If public visitor, mask private phone if public_phone is false
    const sanitized = donors.map(d => {
      if (!isAdmin && !d.public_phone) {
        return {
          ...d,
          phone: d.phone.substring(0, 4) + 'XXXX' + d.phone.substring(8),
          alt_phone: undefined,
          is_phone_hidden: true,
        };
      }
      return d;
    });

    res.json({ success: true, data: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/donors/:id', optionalAdmin, (req: Request, res: Response) => {
  try {
    const isAdmin = Boolean((req as any).admin);
    const donor = db.getDonorById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, error: 'রক্তদাতা পাওয়া যায়নি।' });
    }
    if (!isAdmin && donor.status !== 'approved') {
      return res.status(403).json({ success: false, error: 'এই রক্তদাতার প্রোফাইল এখনও অনুমোদিত নয়।' });
    }
    if (!isAdmin && !donor.public_phone) {
      return res.json({
        success: true,
        data: {
          ...donor,
          phone: donor.phone.substring(0, 4) + 'XXXX' + donor.phone.substring(8),
          alt_phone: undefined,
          is_phone_hidden: true,
        },
      });
    }
    res.json({ success: true, data: donor });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register new donor
app.post('/api/donors', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    if (!settings.allow_registrations) {
      return res.status(403).json({
        success: false,
        error: 'বর্তমানে জরুরি রক্ষণাবেক্ষণের কারণে নতুন রক্তদাতা নিবন্ধন সাময়িকভাবে বন্ধ রয়েছে।',
      });
    }

    const {
      name,
      phone,
      alt_phone,
      blood_group,
      dob,
      union_name,
      ward,
      village,
      last_donation_date,
      photo_url,
      bio,
      public_phone,
      consent,
    } = req.body;

    // Validations
    if (!name || !phone || !blood_group || !dob || !union_name || !ward || !village) {
      return res.status(400).json({
        success: false,
        error: 'অনুগ্রহ করে সকল আবশ্যক তথ্য (নাম, ফোন, রক্তের গ্রুপ, জন্মতারিখ, ইউনিয়ন, ওয়ার্ড, গ্রাম) সঠিকভাবে পূরণ করুন।',
      });
    }

    if (!consent) {
      return res.status(400).json({
        success: false,
        error: 'নিবন্ধনের জন্য সম্মতিপত্রে টিক চিহ্ন দেওয়া আবশ্যক।',
      });
    }

    // Bangladeshi phone validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)।',
      });
    }

    // Duplicate check
    const existing = db.findDonorByPhone(cleanPhone);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'এই মোবাইল নম্বরটি দিয়ে ইতোমধ্যে একজন রক্তদাতা নিবন্ধিত আছেন।',
      });
    }

    // Verify union is from Dimla Upazila
    const validUnion = INITIAL_UNIONS.some(u => u.name_bn === union_name || u.name_en === union_name);
    if (!validUnion) {
      return res.status(400).json({
        success: false,
        error: 'রক্তদাতা শুধুমাত্র নীলফামারী জেলার ডিমলা উপজেলার ১০টি ইউনিয়নের বাসিন্দা হতে হবে।',
      });
    }

    // Age validation (must be 18+)
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ success: false, error: 'সঠিক জন্মতারিখ প্রদান করুন।' });
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({
        success: false,
        error: 'রক্তদাতা হিসেবে নিবন্ধনের জন্য বয়স কমপক্ষে ১৮ বছর হতে হবে।',
      });
    }

    // Availability calculation based on last donation date (if last donation was < 90 days ago, available = false)
    let isAvailable = true;
    if (last_donation_date) {
      const lastDate = new Date(last_donation_date);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 90) {
        isAvailable = false;
      }
    }

    const newDonor = db.addDonor({
      name: name.trim(),
      phone: cleanPhone,
      alt_phone: alt_phone ? alt_phone.trim() : undefined,
      blood_group,
      dob,
      union_name,
      ward: String(ward),
      village: village.trim(),
      last_donation_date: last_donation_date || undefined,
      available: isAvailable,
      photo_url: photo_url || undefined,
      bio: bio ? bio.trim() : undefined,
      public_phone: Boolean(public_phone),
      status: 'pending', // Requires admin review
      total_donations: last_donation_date ? 1 : 0,
    });

    db.addLog('SYSTEM', 'NEW_DONOR_REGISTERED', `নতুন রক্তদাতা নিবন্ধন: ${newDonor.name} (${newDonor.blood_group}) - ইউনিয়ন: ${newDonor.union_name}`, req.ip);

    res.status(201).json({
      success: true,
      data: newDonor,
      message: 'অভিনন্দন! আপনার নিবন্ধন সফলভাবে গৃহীত হয়েছে। ডিমলা ব্লাড ডোনার সোসাইটির অ্যাডমিন দ্বারা যাচাই ও অনুমোদনের পর প্রোফাইলটি তালিকায় প্রকাশিত হবে।',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update donor profile (by donor phone+id or admin)
app.put('/api/donors/:id', optionalAdmin, (req: Request, res: Response) => {
  try {
    const isAdmin = Boolean((req as any).admin);
    const donor = db.getDonorById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, error: 'রক্তদাতা পাওয়া যায়নি।' });
    }

    const { available, last_donation_date, public_phone, bio, village, ward, name, alt_phone } = req.body;

    const updates: any = {};
    if (typeof available === 'boolean') updates.available = available;
    if (typeof public_phone === 'boolean') updates.public_phone = public_phone;
    if (last_donation_date !== undefined) updates.last_donation_date = last_donation_date;
    if (bio !== undefined) updates.bio = bio;
    if (village !== undefined) updates.village = village;
    if (ward !== undefined) updates.ward = ward;
    if (name !== undefined) updates.name = name;
    if (alt_phone !== undefined) updates.alt_phone = alt_phone;

    if (isAdmin) {
      if (req.body.status) updates.status = req.body.status;
      if (req.body.blood_group) updates.blood_group = req.body.blood_group;
      if (req.body.union_name) updates.union_name = req.body.union_name;
      if (req.body.phone) updates.phone = req.body.phone;
      if (typeof req.body.total_donations === 'number') updates.total_donations = req.body.total_donations;
    }

    const updated = db.updateDonor(req.params.id, updates);
    res.json({ success: true, data: updated, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve donor
app.post('/api/donors/:id/approve', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const updated = db.updateDonor(req.params.id, { status: 'approved' });
    if (!updated) return res.status(404).json({ success: false, error: 'রক্তদাতা পাওয়া যায়নি।' });
    db.addLog(admin.username, 'APPROVE_DONOR', `রক্তদাতা অনুমোদন: ${updated.name} (${updated.phone})`, req.ip);
    res.json({ success: true, data: updated, message: 'রক্তদাতা সফলভাবে অনুমোদিত হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reject donor
app.post('/api/donors/:id/reject', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const updated = db.updateDonor(req.params.id, { status: 'rejected' });
    if (!updated) return res.status(404).json({ success: false, error: 'রক্তদাতা পাওয়া যায়নি।' });
    db.addLog(admin.username, 'REJECT_DONOR', `রক্তদাতা বাতিল: ${updated.name} (${updated.phone})`, req.ip);
    res.json({ success: true, data: updated, message: 'রক্তদাতার আবেদন বাতিল করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete donor
app.delete('/api/donors/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const donor = db.getDonorById(req.params.id);
    const success = db.deleteDonor(req.params.id);
    if (success) {
      db.addLog(admin.username, 'DELETE_DONOR', `রক্তদাতা মুছে ফেলা হয়েছে: ${donor?.name || req.params.id}`, req.ip);
      res.json({ success: true, message: 'রক্তদাতার তথ্য মুছে ফেলা হয়েছে।' });
    } else {
      res.status(404).json({ success: false, error: 'রক্তদাতা পাওয়া যায়নি।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Emergency Blood Requests
app.get('/api/requests', optionalAdmin, (req: Request, res: Response) => {
  try {
    const isAdmin = Boolean((req as any).admin);
    const { status, blood_group, union_name, is_urgent } = req.query;

    const filter: any = {};
    if (status) filter.status = String(status);
    if (blood_group) filter.blood_group = String(blood_group);
    if (union_name) filter.union_name = String(union_name);
    if (is_urgent === 'true') filter.is_urgent = true;

    // Public only sees approved or completed requests by default
    if (!isAdmin && !status) {
      filter.status = 'approved';
    }

    const requests = db.getBloodRequests(filter);
    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/requests', (req: Request, res: Response) => {
  try {
    const {
      patient_name,
      blood_group,
      bags_needed,
      hospital_name,
      hospital_address,
      union_name,
      contact_name,
      contact_phone,
      needed_date_time,
      reason,
      is_urgent,
    } = req.body;

    if (!patient_name || !blood_group || !hospital_name || !contact_phone || !needed_date_time) {
      return res.status(400).json({
        success: false,
        error: 'অনুগ্রহ করে রোগীর নাম, রক্তের গ্রুপ, হাসপাতালের নাম, যোগাযোগের ফোন ও সময় প্রদান করুন।',
      });
    }

    const cleanPhone = contact_phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      return res.status(400).json({
        success: false,
        error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।',
      });
    }

    const newReq = db.addBloodRequest({
      patient_name: patient_name.trim(),
      blood_group,
      bags_needed: parseInt(bags_needed) || 1,
      hospital_name: hospital_name.trim(),
      hospital_address: hospital_address ? hospital_address.trim() : 'ডিমলা, নীলফামারী',
      union_name: union_name || 'ডিমলা সদর',
      contact_name: contact_name ? contact_name.trim() : patient_name.trim(),
      contact_phone: cleanPhone,
      needed_date_time: needed_date_time.trim(),
      reason: reason ? reason.trim() : 'জরুরি রক্তের প্রয়োজন',
      is_urgent: Boolean(is_urgent),
      status: 'approved', // Auto-approved for life-saving speed, with admin moderation capability
    });

    db.addLog('SYSTEM', 'NEW_BLOOD_REQUEST', `জরুরি রক্তের অনুরোধ: ${newReq.patient_name} (${newReq.blood_group}, ${newReq.bags_needed} ব্যাগ) - হাসপাতাল: ${newReq.hospital_name}`, req.ip);

    res.status(201).json({
      success: true,
      data: newReq,
      message: 'জরুরি রক্তের অনুরোধ সফলভাবে প্রকাশিত হয়েছে। স্বেচ্ছাসেবী রক্তদাতারা দ্রুত যোগাযোগ করবেন।',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/requests/:id', optionalAdmin, (req: Request, res: Response) => {
  try {
    const reqItem = db.getBloodRequestById(req.params.id);
    if (!reqItem) return res.status(404).json({ success: false, error: 'অনুরোধ পাওয়া যায়নি।' });

    const { status, is_urgent, bags_needed, hospital_name, needed_date_time, reason } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (typeof is_urgent === 'boolean') updates.is_urgent = is_urgent;
    if (bags_needed) updates.bags_needed = parseInt(bags_needed);
    if (hospital_name) updates.hospital_name = hospital_name;
    if (needed_date_time) updates.needed_date_time = needed_date_time;
    if (reason) updates.reason = reason;

    const updated = db.updateBloodRequest(req.params.id, updates);
    res.json({ success: true, data: updated, message: 'অনুরোধের তথ্য হালনাগাদ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/requests/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const success = db.deleteBloodRequest(req.params.id);
    if (success) {
      db.addLog(admin.username, 'DELETE_BLOOD_REQUEST', `রক্তের অনুরোধ মুছে ফেলা হয়েছে (ID: ${req.params.id})`, req.ip);
      res.json({ success: true, message: 'অনুরোধ সফলভাবে মুছে ফেলা হয়েছে।' });
    } else {
      res.status(404).json({ success: false, error: 'অনুরোধ পাওয়া যায়নি।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Notices
app.get('/api/notices', (req: Request, res: Response) => {
  try {
    const notices = db.getNotices();
    res.json({ success: true, data: notices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notices', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const { title, content, is_pinned, is_published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'শিরোনাম ও বিবরণ আবশ্যক।' });
    }
    const notice = db.addNotice({
      title: title.trim(),
      content: content.trim(),
      is_pinned: Boolean(is_pinned),
      is_published: is_published !== false,
    });
    db.addLog(admin.username, 'ADD_NOTICE', `নোটিশ প্রকাশ: ${notice.title}`, req.ip);
    res.status(201).json({ success: true, data: notice, message: 'নোটিশ সফলভাবে প্রকাশিত হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/notices/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateNotice(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'নোটিশ পাওয়া যায়নি।' });
    res.json({ success: true, data: updated, message: 'নোটিশ হালনাগাদ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/notices/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const success = db.deleteNotice(req.params.id);
    if (success) {
      db.addLog(admin.username, 'DELETE_NOTICE', `নোটিশ মুছে ফেলা হয়েছে (ID: ${req.params.id})`, req.ip);
      res.json({ success: true, message: 'নোটিশ মুছে ফেলা হয়েছে।' });
    } else {
      res.status(404).json({ success: false, error: 'নোটিশ পাওয়া যায়নি।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Contact Messages
app.post('/api/contact', (req: Request, res: Response) => {
  try {
    const { name, phone, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, error: 'নাম, ফোন নম্বর এবং বার্তা আবশ্যক।' });
    }
    const msg = db.addContactMessage({
      name: name.trim(),
      phone: phone.trim(),
      subject: subject ? subject.trim() : undefined,
      message: message.trim(),
    });
    res.status(201).json({ success: true, data: msg, message: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/contact', requireAdmin, (req: Request, res: Response) => {
  try {
    const messages = db.getContactMessages();
    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/contact/:id/read', requireAdmin, (req: Request, res: Response) => {
  try {
    db.markMessageRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Admin Authentication & Management
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'ব্যবহারকারী নাম ও পাসওয়ার্ড আবশ্যক।' });
    }
    const admin = db.findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড।' });
    }

    const hashed = hashPassword(password);
    if (admin.password_hash !== hashed) {
      return res.status(401).json({ success: false, error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড।' });
    }

    admin.last_login = new Date().toISOString();
    db.save();

    const token = generateToken(admin.id, admin.username);
    db.addLog(admin.username, 'ADMIN_LOGIN', `অ্যাডমিন সফলভাবে লগইন করেছেন`, req.ip);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        email: admin.email,
        phone: admin.phone,
      },
      message: 'লগইন সফল হয়েছে। ডিমলা ব্লাড ডোনার সোসাইটি ড্যাশবোর্ডে স্বাগতম!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/me', requireAdmin, (req: Request, res: Response) => {
  try {
    const adminReq = (req as any).admin;
    const admin = db.findAdminByUsername(adminReq.username);
    if (!admin) return res.status(404).json({ success: false, error: 'অ্যাডমিন পাওয়া যায়নি।' });
    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  try {
    const adminReq = (req as any).admin;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
    }
    const admin = db.findAdminByUsername(adminReq.username);
    if (!admin) return res.status(404).json({ success: false, error: 'অ্যাডমিন পাওয়া যায়নি।' });

    if (admin.password_hash !== hashPassword(current_password)) {
      return res.status(400).json({ success: false, error: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
    }

    const newHash = hashPassword(new_password);
    db.updateAdminPassword(admin.id, newHash);
    db.addLog(admin.username, 'PASSWORD_CHANGED', 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।', req.ip);

    res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/admins', requireAdmin, (req: Request, res: Response) => {
  try {
    const admins = db.getAdmins();
    res.json({ success: true, data: admins });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/admins', requireAdmin, (req: Request, res: Response) => {
  try {
    const adminReq = (req as any).admin;
    const { username, password, name, role, phone, email } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, error: 'ব্যবহারকারী নাম, পাসওয়ার্ড ও পূর্ণ নাম আবশ্যক।' });
    }
    const existing = db.findAdminByUsername(username);
    if (existing) {
      return res.status(400).json({ success: false, error: 'এই ব্যবহারকারী নামটি ইতোমধ্যে ব্যবহৃত।' });
    }

    const newAdmin = {
      id: 'adm_' + Date.now(),
      username: username.toLowerCase().trim(),
      password_hash: hashPassword(password),
      name: name.trim(),
      role: (role === 'moderator' ? 'moderator' : 'super_admin') as 'super_admin' | 'moderator',
      phone: phone ? phone.trim() : undefined,
      email: email ? email.trim() : undefined,
      created_at: new Date().toISOString(),
    };

    db.addAdmin(newAdmin);
    db.addLog(adminReq.username, 'CREATE_ADMIN', `নতুন অ্যাডমিন/মডারেটর তৈরি: ${newAdmin.username}`, req.ip);

    const { password_hash, ...safe } = newAdmin;
    res.status(201).json({ success: true, data: safe, message: 'নতুন অ্যাডমিন সফলভাবে তৈরি হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/logs', requireAdmin, (req: Request, res: Response) => {
  try {
    const logs = db.getRawData().activity_logs;
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Exports
app.get('/api/export/donors.csv', requireAdmin, (req: Request, res: Response) => {
  try {
    const donors = db.getDonors();
    let csv = '\uFEFF'; // UTF-8 BOM for Excel Bengali support
    csv += 'ID,Name,Phone,Alt Phone,Blood Group,Date of Birth,Union,Ward,Village,Last Donation Date,Available,Total Donations,Status,Created At\n';

    donors.forEach(d => {
      const row = [
        d.id,
        `"${d.name.replace(/"/g, '""')}"`,
        `"${d.phone}"`,
        `"${d.alt_phone || ''}"`,
        `"${d.blood_group}"`,
        `"${d.dob}"`,
        `"${d.union_name}"`,
        `"${d.ward}"`,
        `"${d.village.replace(/"/g, '""')}"`,
        `"${d.last_donation_date || ''}"`,
        d.available ? 'Yes' : 'No',
        d.total_donations,
        `"${d.status}"`,
        `"${d.created_at}"`,
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dimla-donors-export.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/export/backup.json', requireAdmin, (req: Request, res: Response) => {
  try {
    const data = db.getRawData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="dimla-blood-db-backup.json"');
    res.send(JSON.stringify(data, null, 2));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Cloudflare Ready ZIP Archive Generation & Download
app.get('/api/download-zip', async (req: Request, res: Response) => {
  try {
    const zip = new JSZip();

    // 1. Cloudflare configuration files
    if (fs.existsSync('wrangler.jsonc')) {
      zip.file('wrangler.jsonc', fs.readFileSync('wrangler.jsonc', 'utf8'));
    }
    if (fs.existsSync('wrangler.toml')) {
      zip.file('wrangler.toml', fs.readFileSync('wrangler.toml', 'utf8'));
    }
    if (fs.existsSync('cloudflare/schema.sql')) {
      zip.file('migrations/0001_initial_schema.sql', fs.readFileSync('cloudflare/schema.sql', 'utf8'));
      zip.file('cloudflare/schema.sql', fs.readFileSync('cloudflare/schema.sql', 'utf8'));
    }
    if (fs.existsSync('cloudflare/worker.ts')) {
      zip.file('cloudflare/worker.ts', fs.readFileSync('cloudflare/worker.ts', 'utf8'));
    }

    // 2. Package and config
    if (fs.existsSync('package.json')) {
      zip.file('package.json', fs.readFileSync('package.json', 'utf8'));
    }
    if (fs.existsSync('tsconfig.json')) {
      zip.file('tsconfig.json', fs.readFileSync('tsconfig.json', 'utf8'));
    }
    if (fs.existsSync('vite.config.ts')) {
      zip.file('vite.config.ts', fs.readFileSync('vite.config.ts', 'utf8'));
    }
    if (fs.existsSync('.env.example')) {
      zip.file('.env.example', fs.readFileSync('.env.example', 'utf8'));
    }
    if (fs.existsSync('index.html')) {
      zip.file('index.html', fs.readFileSync('index.html', 'utf8'));
    }

    // 3. Source files
    function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (item === 'node_modules' || item === 'dist' || item === '.git') continue;
          addDirectoryToZip(fullPath, zipFolder.folder(item)!);
        } else {
          zipFolder.file(item, fs.readFileSync(fullPath));
        }
      }
    }

    addDirectoryToZip('src', zip.folder('src')!);
    addDirectoryToZip('server', zip.folder('server')!);
    addDirectoryToZip('public', zip.folder('public')!);
    if (fs.existsSync('functions')) {
      addDirectoryToZip('functions', zip.folder('functions')!);
    }
    if (fs.existsSync('dist')) {
      addDirectoryToZip('dist', zip.folder('dist')!);
    }

    if (fs.existsSync('server.ts')) {
      zip.file('server.ts', fs.readFileSync('server.ts', 'utf8'));
    }

    // 4. Bengali Deployment & Setup README
    const readmeContent = `# ডিমলা ব্লাড ডোনার সোসাইটি (Dimla Blood Donor Society)
> স্লোগান: রক্তের প্রয়োজনে, পাশে আছি আমরা।
> এলাকা: নীলফামারী জেলার ডিমলা উপজেলার ১০টি ইউনিয়ন।

---

## ১. প্রজেক্ট পরিচিতি
এটি ডিমলা উপজেলার স্বেচ্ছাসেবী রক্তদাতাদের একত্রিত করা এবং জরুরি প্রয়োজনে রক্তের সন্ধানের জন্য তৈরি একটি সম্পূর্ণ ফুল-স্ট্যাক ওয়েবসাইট।

### প্রধান ফিচারসমূহ:
- রক্তদাতা খোঁজার উন্নত সার্চ ইঞ্জিন (রক্তের গ্রুপ, ইউনিয়ন, ওয়ার্ড, গ্রাম, প্রাপ্যতা ফিল্টার)
- ডিমলা উপজেলার নির্দিষ্ট ১০টি ইউনিয়ন ও সংশ্লিষ্ট গ্রামের তালিকা
- নতুন রক্তদাতা নিবন্ধন (১৮+ বয়স যাচাই, ইউনিক ফোন যাচাই, অ্যাডমিন অনুমোদন ব্যবস্থা)
- জরুরি রক্তের অনুরোধ সিস্টেম (রোগীর নাম, হাসপাতাল, রক্তের ব্যাগ, হোয়াটসঅ্যাপ ও কল বাটন)
- পূর্ণাঙ্গ অ্যাডমিন ড্যাশবোর্ড (ডোনার ম্যানেজমেন্ট, রিকোয়েস্ট ম্যানেজমেন্ট, ইউনিয়ন ও গ্রাম নিয়ন্ত্রণ, নোটিশ বোর্ড, সাইট সেটিংস)
- গোপনীয়তা নিয়ন্ত্রণ (ডোনার নিজের ফোন নম্বর উন্মুক্ত বা গোপন রাখতে পারেন)
- সম্পূর্ণ মোবাইল-ফার্স্ট ও রেসপনসিভ ডিজাইন (Red, White ও Light Gray থিম)
- বাংলা প্রধান ভাষা ও ইংরেজি সুইচ সুবিধা

---

## ২. কেন ওয়েবসাইট ওপেন করলে সাদা পেজ (Blank White Page) দেখায় এবং এর নিশ্চিত সমাধান

### সাদা পেজ হওয়ার মূল কারণ:
Cloudflare Pages বা Workers-এ ডিপ্লয় করার সময় যদি **\`npm run build\` না চালিয়ে** সরাসরি প্রজেক্ট রুট ফোল্ডার (\`.\`) ডিপ্লয় করা হয়, তবে ব্রাউজার আনকম্পাইল্ড \`/src/main.tsx\` ফাইল লোড করতে গিয়ে ক্র্যাশ করে এবং সাদা পেজ দেখায়। ব্রাউজার সরাসরি TypeScript বা JSX রান করতে পারে না।

### সমাধান (২টি সহজ পদ্ধতির যেকোনো একটি অনুসরণ করুন):

#### পদ্ধতি ক: Cloudflare Pages Direct Upload (সবচেয়ে সহজ - মাত্র ১ মিনিট)
এই ZIP ফাইলে ইতিমধ্যে সম্পূর্ণ প্রস্তুতকৃত \`dist\` ফোল্ডার দেওয়া রয়েছে।
1. Cloudflare Dashboard এ যান -> **Compute (Workers & Pages)** -> **Create** -> **Pages** -> **Upload assets** এ ক্লিক করুন।
2. Project Name দিন (যেমন: \`dimlablooddonorsociety\`)।
3. এই প্রজেক্টের ভেতরের **\`dist\`** ফোল্ডারটি ড্র্যাগ করে আপলোড করে দিন (অথবা সিলেক্ট করুন)।
4. **Deploy site** এ ক্লিক করুন। সাথে সাথে আপনার ওয়েবসাইট লাইভ হয়ে যাবে এবং আর কখনো সাদা পেজ দেখাবে না!

#### পদ্ধতি খ: Cloudflare Workers (Full-Stack with D1 & Static Assets)
\`\`\`bash
# ১. ডিপেন্ডেন্সি ইনস্টল ও বিল্ড করুন
npm install
npm run build

# ২. D1 Database তৈরি ও মাইগ্রেশন চালান (যদি আগে না করে থাকেন)
npx wrangler d1 create dimla_blood_db
# প্রাপ্ত database_id টি wrangler.jsonc ফাইলে বসান
npx wrangler d1 execute dimla_blood_db --file=./migrations/0001_initial_schema.sql

# ৩. Workers-এ Deploy করুন
npx wrangler deploy
\`\`\`

#### পদ্ধতি গ: Cloudflare Pages Git Integration (GitHub থেকে ডিপ্লয়)
Cloudflare Pages Settings -> Build & deployments এ নিচের মতো দিন:
- **Build command:** \`npm run build\`
- **Build output directory:** \`dist\`
- **Root directory:** \`/\` (অথবা ফাঁকা)

---

## ৩. লোকাল সার্ভারে রান করার নিয়ম (Node.js)
\`\`\`bash
npm install
npm run dev
\`\`\`
ব্রাউজারে \`http://localhost:3000\` ওপেন করুন।

---

## ৪. অ্যাডমিন লগইন তথ্য (ডিফল্ট)
- **অ্যাডমিন লগইন লিংক**: \`/admin\` অথবা হোমপেজের ফুটার থেকে অ্যাডমিন লিংকে ক্লিক করুন।
- **ডিফল্ট ইউজারনেম**: \`admin\`
- **ডিফল্ট পাসওয়ার্ড**: \`dimla12345\`
*(লগইন করার পর ড্যাশবোর্ডের Settings মেনু থেকে অবশ্যই পাসওয়ার্ড পরিবর্তন করে নিন)*
`;

    zip.file('README.md', readmeContent);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="dimla-blood-donor-society.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Cloudflare Pages Upload ZIP (only dist/ contents at root, no _headers/_redirects)
app.get('/api/download-pages-zip', async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync('dist')) {
      return res.status(404).json({ success: false, error: 'dist folder not built yet.' });
    }
    const zip = new JSZip();

    function addDistFiles(dirPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item === '_headers' || item === '_redirects') continue;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDistFiles(fullPath, zipFolder.folder(item)!);
        } else {
          zipFolder.file(item, fs.readFileSync(fullPath));
        }
      }
    }

    addDistFiles('dist', zip);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="dimla-pages-dist.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- VITE INTEGRATION -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ডিমলা ব্লাড ডোনার সোসাইটি সার্ভার চালু আছে: http://localhost:${PORT}`);
  });
}

startServer();
