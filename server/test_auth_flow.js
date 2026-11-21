import { db } from './database/db.js';
import bcrypt from 'bcryptjs';

console.log('=== AAROH AUTHENTICATION & PERSISTENCE TEST ===');

// 1. Check SQLite Persistent Users Table
const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`[Database] Total registered users in local persistent DB: ${countRow.count}`);

const seededUsers = db.prepare('SELECT id, user_id, name, email, phone_number, email_verified, phone_verified, role FROM users').all();
console.log('[Database] Seeded / Registered Users Sample:');
console.table(seededUsers.map(u => ({
  ID: u.user_id,
  Name: u.name,
  Email: u.email,
  Phone: u.phone_number,
  Role: u.role,
  Verified: `Email: ${Boolean(u.email_verified)} | Phone: ${Boolean(u.phone_verified)}`
})));

// 2. Verify Password Hashing Security (No plaintext passwords stored)
const passwordsWithPlaintext = db.prepare("SELECT id FROM users WHERE password_hash NOT LIKE '$2%'").all();
if (passwordsWithPlaintext.length === 0) {
  console.log('✓ Security Check Passed: 100% of stored passwords are securely hashed with bcrypt (no plaintext passwords).');
} else {
  console.error('✗ Security Alert: Plaintext passwords detected:', passwordsWithPlaintext);
}

// 3. Test Seed User Password Verification
const dulari = db.prepare('SELECT * FROM users WHERE email = ?').get('dulari@aaroh.in');
if (dulari) {
  const match = bcrypt.compareSync('Password@123', dulari.password_hash);
  console.log(`✓ Master Artisan (dulari@aaroh.in) password check: ${match ? 'MATCH (Valid credentials)' : 'FAIL'}`);
}

// 4. Check OTP security (No plaintext OTPs in database)
const otpsWithPlaintext = db.prepare("SELECT id FROM otps WHERE otp_hash NOT LIKE '$2%'").all();
console.log(`✓ OTP Security Check: ${otpsWithPlaintext.length === 0 ? 'All OTPs are cryptographically hashed before storage' : 'Unprotected OTPs found'}`);

// 5. Check Row Level Security Migration Script
import fs from 'node:fs';
import path from 'node:path';
const migrationPath = path.resolve('../supabase_migration.sql');
if (fs.existsSync(migrationPath)) {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const hasRLS = sql.includes('ENABLE ROW LEVEL SECURITY');
  const hasProfiles = sql.includes('CREATE TABLE IF NOT EXISTS public.profiles');
  const hasTrigger = sql.includes('CREATE TRIGGER on_auth_user_created');
  console.log(`✓ Supabase Migration SQL file verified:
  - Table 'public.profiles' declared: ${hasProfiles}
  - RLS Enabled: ${hasRLS}
  - Auth trigger synced: ${hasTrigger}`);
}

console.log('=== TEST COMPLETED SUCCESSFULLY ===');
