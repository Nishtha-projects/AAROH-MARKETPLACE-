import '../env.js';
import { reloadEnv } from '../env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import db, { generateUniqueUserId } from '../database/db.js';
import { normalizeToE164 } from './smsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const demoOtpLogPath = path.join(__dirname, '..', '.demo-otps.log');
const demoOtpJsonPath = path.join(__dirname, '..', '.demo-otp-latest.json');

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes, as required
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

/**
 * Check whether Development OTP Demo Mode is active.
 * Only enabled when NODE_ENV === 'development' AND OTP_DEMO_MODE === 'true'.
 * Strictly disabled in production.
 */
export const isOtpDemoModeActive = () => {
  reloadEnv();
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  return isDev && process.env.OTP_DEMO_MODE === 'true';
};


/**
 * Automatically detect whether the input identifier is an email address or mobile phone number.
 */
export const detectContactType = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? 'email' : 'email_invalid';
  }
  // Check if phone-like (starts with + or contains digits)
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return 'phone';
  }
  return null;
};

/**
 * Find a user record in SQLite by email, phone, or User ID
 */
export const findUserByIdentifier = (identifier) => {
  if (!identifier || typeof identifier !== 'string') return null;
  const cleanInput = identifier.trim();

  let normalizedPhone = cleanInput;
  try {
    normalizedPhone = normalizeToE164(cleanInput);
  } catch {}

  const numericPhone = cleanInput.replace(/\D/g, '').slice(-10);

  return db.prepare(`
    SELECT * FROM users 
    WHERE LOWER(email) = LOWER(?) 
       OR (email_normalized IS NOT NULL AND email_normalized = LOWER(?))
       OR phone_number = ?
       OR phone = ?
       OR (LENGTH(?) >= 8 AND REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?)
       OR UPPER(user_id) = UPPER(?)
    LIMIT 1
  `).get(cleanInput, cleanInput, normalizedPhone, cleanInput, numericPhone, `%${numericPhone}%`, cleanInput);
};

/**
 * Check if an email or mobile phone is already registered in the users table.
 * Supports either identifier, email, or phone.
 */
export const checkUserExists = ({ identifier, email, phone }) => {
  let cleanEmail = email ? email.trim().toLowerCase() : '';
  let cleanPhone = phone ? phone.trim() : '';

  if (identifier && !cleanEmail && !cleanPhone) {
    const type = detectContactType(identifier);
    if (type === 'email' || type === 'email_invalid') {
      cleanEmail = identifier.trim().toLowerCase();
    } else {
      cleanPhone = identifier.trim();
    }
  }

  if (cleanEmail) {
    const existingEmail = db.prepare(`
      SELECT id, email, user_id, email_verified, phone_verified FROM users 
      WHERE LOWER(email) = LOWER(?) OR (email_normalized IS NOT NULL AND email_normalized = LOWER(?))
    `).get(cleanEmail, cleanEmail);
    if (existingEmail && (existingEmail.email_verified === 1 || existingEmail.phone_verified === 1)) {
      return {
        exists: true,
        reason: 'email',
        message: 'An account already exists with this email address. Please login instead.'
      };
    }
  }

  if (cleanPhone) {
    let normalizedPhone = cleanPhone;
    try {
      normalizedPhone = normalizeToE164(cleanPhone);
    } catch {}

    const numericPhone = cleanPhone.replace(/\D/g, '').slice(-10);
    const existingPhone = db.prepare(`
      SELECT id, phone, phone_number, user_id, email_verified, phone_verified FROM users 
      WHERE phone = ? OR phone_number = ? OR (LENGTH(?) >= 8 AND REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?)
    `).get(cleanPhone, normalizedPhone, numericPhone, `%${numericPhone}%`);

    if (existingPhone && (existingPhone.email_verified === 1 || existingPhone.phone_verified === 1)) {
      return {
        exists: true,
        reason: 'phone',
        message: 'An account already exists with this mobile number. Please login instead.'
      };
    }
  }

  return { exists: false };
};

/**
 * Generate and store a secure 6-digit random email OTP
 * - Enforces 60-second cooldown
 * - 5-minute expiry
 * - Stores only bcrypt hash
 * - Invalidates previous active OTPs for the same target
 */
export const createEmailOtpForUser = ({ email, purpose = 'email_verification' }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const now = Date.now();

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    const err = new Error('Please enter a valid email address.');
    err.status = 400;
    throw err;
  }

  // 1. Cooldown check (60 seconds) - only triggered if an OTP was actually dispatched by the provider
  const recentOtp = db.prepare(`
    SELECT created_at FROM otps
    WHERE target = ? AND type = 'email' AND purpose = ? AND is_used = 0 AND is_dispatched = 1
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanEmail, purpose);

  if (recentOtp && (now - recentOtp.created_at) < OTP_RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - recentOtp.created_at)) / 1000);
    const err = new Error(`Please wait ${remaining}s before requesting a new verification code.`);
    err.status = 429;
    err.code = 'RATE_LIMITED';
    err.remainingSeconds = remaining;
    throw err;
  }

  // 2. Generate 6-digit cryptographically secure random OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = bcrypt.hashSync(rawOtp, 10);
  const sessionId = `esess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const expiresAt = now + OTP_EXPIRY_MS;

  // Invalidate previous active OTPs for this target & purpose
  db.prepare(`
    UPDATE otps SET is_used = 1 
    WHERE target = ? AND type = 'email' AND purpose = ? AND is_used = 0
  `).run(cleanEmail, purpose);

  // Store in SQLite (is_dispatched starts as 0, marked 1 ONLY after email provider succeeds)
  db.prepare(`
    INSERT INTO otps (session_id, target, type, otp_hash, purpose, expires_at, attempts_left, is_verified, is_used, is_dispatched, created_at)
    VALUES (?, ?, 'email', ?, ?, ?, ?, 0, 0, 0, ?)
  `).run(sessionId, cleanEmail, otpHash, purpose, expiresAt, MAX_ATTEMPTS, now);

  return {
    rawOtp, // Used exclusively by mailer, never exposed in API responses
    sessionId,
    expiresAt,
    cooldownSeconds: 60
  };
};

/**
 * Marks OTP as dispatched once the email or SMS gateway confirms delivery
 */
export const markOtpDispatched = (sessionId) => {
  if (!sessionId) return;
  db.prepare('UPDATE otps SET is_dispatched = 1 WHERE session_id = ?').run(sessionId);
};

/**
 * Discards un-dispatched OTP so failures never lock the user in a false cooldown
 */
export const discardUnsentOtp = (sessionId) => {
  if (!sessionId) return;
  db.prepare('DELETE FROM otps WHERE session_id = ?').run(sessionId);
};

/**
 * Verify 6-digit email OTP submitted by user
 */
export const verifyEmailOtpForUser = ({ email, code, purpose = 'email_verification' }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCode = (code || '').trim();
  const now = Date.now();

  if (!cleanCode || cleanCode.length !== 6) {
    const err = new Error('Please enter a valid 6-digit verification code.');
    err.status = 400;
    err.code = 'INVALID_CODE_FORMAT';
    throw err;
  }

  const record = db.prepare(`
    SELECT * FROM otps
    WHERE target = ? AND type = 'email' AND purpose = ? AND is_used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanEmail, purpose);

  if (!record) {
    const err = new Error('No active verification code found. Please request a new code.');
    err.status = 400;
    err.code = 'NO_OTP_FOUND';
    throw err;
  }

  if (now > record.expires_at) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Verification code has expired. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  if (record.attempts_left <= 0) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Maximum verification attempts exceeded. Please request a new code.');
    err.status = 429;
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  const isMatch = bcrypt.compareSync(cleanCode, record.otp_hash);

  if (!isMatch) {
    const attemptsLeft = record.attempts_left - 1;
    if (attemptsLeft <= 0) {
      db.prepare('UPDATE otps SET attempts_left = 0, is_used = 1 WHERE id = ?').run(record.id);
      const err = new Error('Invalid verification code. Maximum attempts reached. Please request a new code.');
      err.status = 400;
      err.code = 'MAX_ATTEMPTS_REACHED';
      throw err;
    } else {
      db.prepare('UPDATE otps SET attempts_left = ? WHERE id = ?').run(attemptsLeft, record.id);
      const err = new Error(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
      err.status = 400;
      err.code = 'INVALID_OTP';
      throw err;
    }
  }

  // Mark verified & used
  db.prepare('UPDATE otps SET is_verified = 1, is_used = 1 WHERE id = ?').run(record.id);

  return { valid: true, target: cleanEmail };
};

/**
 * Creates a pending signup session (for backwards compatibility / multi-step signup)
 */
export const createPendingSignup = ({ fullName, email, phone, verificationMethod = 'email' }) => {
  const cleanName = (fullName || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const now = Date.now();

  if (!cleanName) {
    const err = new Error('Full name is required.');
    err.status = 400;
    throw err;
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    const err = new Error('Please enter a valid email address.');
    err.status = 400;
    throw err;
  }

  let normalizedPhone = cleanPhone;
  try {
    normalizedPhone = normalizeToE164(cleanPhone);
  } catch {}

  const check = checkUserExists({ email: cleanEmail, phone: cleanPhone });
  if (check.exists) {
    const err = new Error('An account already exists with this email/mobile number. Please login instead.');
    err.status = 409;
    err.isDuplicate = true;
    err.code = 'ACCOUNT_ALREADY_EXISTS';
    throw err;
  }

  // Cooldown check (60 seconds)
  const recentPending = db.prepare(`
    SELECT created_at FROM pending_signups
    WHERE (email_normalized = ? OR phone = ?) AND is_verified = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanEmail, cleanPhone);

  if (recentPending && (now - recentPending.created_at) < OTP_RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - recentPending.created_at)) / 1000);
    const err = new Error(`Please wait ${remaining}s before requesting a new verification code.`);
    err.status = 429;
    err.code = 'RATE_LIMITED';
    err.remainingSeconds = remaining;
    throw err;
  }

  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = bcrypt.hashSync(rawOtp, 10);
  const rawLinkToken = crypto.randomBytes(32).toString('hex');
  const linkTokenHash = crypto.createHash('sha256').update(rawLinkToken).digest('hex');
  const uniqueUserId = generateUniqueUserId();
  const pendingId = `pend_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const expiresAt = now + OTP_EXPIRY_MS;

  db.prepare(`
    DELETE FROM pending_signups 
    WHERE (email_normalized = ? OR phone = ?) AND is_verified = 0
  `).run(cleanEmail, cleanPhone);

  db.prepare(`
    INSERT INTO pending_signups (
      id, full_name, email, email_normalized, phone, phone_number, verification_method,
      unique_user_id, otp_hash, link_token_hash, link_token_expires_at,
      otp_expires_at, attempts_left, is_verified, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    pendingId,
    cleanName,
    cleanEmail,
    cleanEmail,
    cleanPhone,
    normalizedPhone,
    verificationMethod,
    uniqueUserId,
    otpHash,
    linkTokenHash,
    expiresAt,
    expiresAt,
    MAX_ATTEMPTS,
    now
  );

  return {
    pendingId,
    rawOtp,
    linkToken: rawLinkToken,
    uniqueUserId,
    cleanName,
    cleanEmail,
    cleanPhone,
    normalizedPhone,
    verificationMethod,
    cooldownSeconds: 60,
    expiresAt
  };
};

export const verifyPendingSignupOtp = ({ identifier, code }) => {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanCode = (code || '').trim();
  const now = Date.now();

  if (!cleanCode || cleanCode.length !== 6) {
    const err = new Error('Please enter a valid 6-digit verification code.');
    err.status = 400;
    err.code = 'INVALID_CODE_FORMAT';
    throw err;
  }

  const record = db.prepare(`
    SELECT * FROM pending_signups
    WHERE (email_normalized = ? OR phone = ? OR id = ?) AND is_verified = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanId, cleanId, cleanId);

  if (!record) {
    const err = new Error('No active verification session found. Please request a new verification code.');
    err.status = 400;
    err.code = 'NO_OTP_FOUND';
    throw err;
  }

  if (now > record.otp_expires_at) {
    db.prepare('DELETE FROM pending_signups WHERE id = ?').run(record.id);
    const err = new Error('The verification code has expired. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  if (record.attempts_left <= 0) {
    db.prepare('DELETE FROM pending_signups WHERE id = ?').run(record.id);
    const err = new Error('Maximum verification attempts exceeded. Please start signup again.');
    err.status = 429;
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  const isMatch = bcrypt.compareSync(cleanCode, record.otp_hash);

  if (!isMatch) {
    const attemptsLeft = record.attempts_left - 1;
    if (attemptsLeft <= 0) {
      db.prepare('DELETE FROM pending_signups WHERE id = ?').run(record.id);
      const err = new Error('Invalid verification code. Maximum attempts reached. Please request a new code.');
      err.status = 400;
      err.code = 'MAX_ATTEMPTS_REACHED';
      throw err;
    } else {
      db.prepare('UPDATE pending_signups SET attempts_left = ? WHERE id = ?').run(attemptsLeft, record.id);
      const err = new Error(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
      err.status = 400;
      err.code = 'INVALID_OTP';
      throw err;
    }
  }

  db.prepare('UPDATE pending_signups SET is_verified = 1 WHERE id = ?').run(record.id);

  return {
    valid: true,
    pendingRecord: { ...record, is_verified: 1 }
  };
};

export const verifyPendingSignupLink = ({ token }) => {
  if (!token) {
    const err = new Error('Verification token is required.');
    err.status = 400;
    throw err;
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const now = Date.now();

  const record = db.prepare(`
    SELECT * FROM pending_signups
    WHERE link_token_hash = ? AND is_verified = 0
    LIMIT 1
  `).get(tokenHash);

  if (!record) {
    const err = new Error('Verification link is invalid or has already been used.');
    err.status = 400;
    err.code = 'INVALID_LINK_TOKEN';
    throw err;
  }

  if (now > record.link_token_expires_at) {
    db.prepare('DELETE FROM pending_signups WHERE id = ?').run(record.id);
    const err = new Error('The email verification link has expired. Please sign up again.');
    err.status = 400;
    err.code = 'LINK_EXPIRED';
    throw err;
  }

  db.prepare('UPDATE pending_signups SET is_verified = 1 WHERE id = ?').run(record.id);

  return {
    valid: true,
    pendingRecord: { ...record, is_verified: 1 }
  };
};

/**
 * Forgot password OTP creation (supports Email OR Mobile)
 * Never exposes whether an account exists or not
 */
export const createForgotPasswordOtp = ({ identifier }) => {
  const cleanInput = (identifier || '').trim();
  const now = Date.now();

  let normalizedPhone = cleanInput;
  try {
    normalizedPhone = normalizeToE164(cleanInput);
  } catch {}

  const user = db.prepare(`
    SELECT id, name, full_name, email, phone, phone_number, user_id FROM users
    WHERE LOWER(email) = LOWER(?) OR phone = ? OR phone_number = ? OR UPPER(user_id) = UPPER(?)
  `).get(cleanInput, cleanInput, normalizedPhone, cleanInput);

  if (!user) {
    return { notFound: true, cooldownSeconds: 60 };
  }

  const isEmail = cleanInput.includes('@') || !cleanInput.match(/^\+?[0-9\s-]+$/);
  const target = isEmail ? user.email.toLowerCase() : (user.phone_number || user.phone);
  const type = isEmail ? 'email' : 'phone';

  // Cooldown check (60 seconds) - only triggered if an OTP was actually dispatched by the provider
  const recentOtp = db.prepare(`
    SELECT created_at FROM otps
    WHERE target = ? AND purpose = 'forgot_password' AND is_used = 0 AND is_dispatched = 1
    ORDER BY created_at DESC LIMIT 1
  `).get(target);

  if (recentOtp && (now - recentOtp.created_at) < OTP_RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - recentOtp.created_at)) / 1000);
    const err = new Error(`Please wait ${remaining}s before requesting a new code.`);
    err.status = 429;
    err.code = 'RATE_LIMITED';
    throw err;
  }

  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = bcrypt.hashSync(rawOtp, 10);
  const sessionId = `vsess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const expiresAt = now + OTP_EXPIRY_MS;

  db.prepare(`UPDATE otps SET is_used = 1 WHERE target = ? AND purpose = 'forgot_password'`).run(target);

  db.prepare(`
    INSERT INTO otps (session_id, target, type, otp_hash, purpose, expires_at, attempts_left, is_verified, is_used, is_dispatched, created_at)
    VALUES (?, ?, ?, ?, 'forgot_password', ?, ?, 0, 0, 0, ?)
  `).run(sessionId, target, type, otpHash, expiresAt, MAX_ATTEMPTS, now);

  return {
    notFound: false,
    user,
    rawOtp,
    target,
    type,
    sessionId,
    expiresAt,
    cooldownSeconds: 60
  };
};

/**
 * Verifies forgot password OTP
 */
export const verifyForgotPasswordOtp = ({ identifier, code }) => {
  const cleanInput = (identifier || '').trim();
  const cleanCode = (code || '').trim();
  const now = Date.now();

  if (!cleanCode || cleanCode.length !== 6) {
    const err = new Error('Please enter a valid 6-digit verification code.');
    err.status = 400;
    err.code = 'INVALID_CODE_FORMAT';
    throw err;
  }

  let normalizedPhone = cleanInput;
  try {
    normalizedPhone = normalizeToE164(cleanInput);
  } catch {}

  const user = db.prepare(`
    SELECT id, name, full_name, email, phone, phone_number, user_id FROM users
    WHERE LOWER(email) = LOWER(?) OR phone = ? OR phone_number = ? OR UPPER(user_id) = UPPER(?)
  `).get(cleanInput, cleanInput, normalizedPhone, cleanInput);

  const targets = user 
    ? [user.email.toLowerCase(), user.phone, user.phone_number].filter(Boolean)
    : [cleanInput.toLowerCase(), cleanInput, normalizedPhone].filter(Boolean);

  const placeholders = targets.map(() => '?').join(' OR target = ');
  const record = db.prepare(`
    SELECT * FROM otps
    WHERE (target = ${placeholders}) AND purpose = 'forgot_password' AND is_used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(...targets);

  if (!record) {
    const err = new Error('No active verification code found. Please request a new code.');
    err.status = 400;
    err.code = 'NO_OTP_FOUND';
    throw err;
  }

  if (now > record.expires_at) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Verification code has expired. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  if (record.attempts_left <= 0) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Maximum verification attempts exceeded. Please request a new code.');
    err.status = 429;
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  const isMatch = bcrypt.compareSync(cleanCode, record.otp_hash);

  if (!isMatch) {
    const attemptsLeft = record.attempts_left - 1;
    if (attemptsLeft <= 0) {
      db.prepare('UPDATE otps SET attempts_left = 0, is_used = 1 WHERE id = ?').run(record.id);
      const err = new Error('Invalid code. Maximum attempts reached. Please request a new code.');
      err.status = 400;
      err.code = 'MAX_ATTEMPTS_REACHED';
      throw err;
    } else {
      db.prepare('UPDATE otps SET attempts_left = ? WHERE id = ?').run(attemptsLeft, record.id);
      const err = new Error(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
      err.status = 400;
      err.code = 'INVALID_OTP';
      throw err;
    }
  }

  db.prepare('UPDATE otps SET is_verified = 1, is_used = 1 WHERE id = ?').run(record.id);

  return {
    valid: true,
    user
  };
};

/**
 * Generate and store a secure 6-digit phone OTP in SQLite for demo mode
 * - Stores bcrypt hash in otps table
 * - 5-minute expiry, 5 attempts max
 */
export const createPhoneOtpForUser = ({ phone, purpose = 'phone_verification' }) => {
  const cleanPhone = (phone || '').trim();
  const now = Date.now();

  let normalizedPhone = cleanPhone;
  try {
    normalizedPhone = normalizeToE164(cleanPhone);
  } catch {}

  // Cooldown check (60 seconds)
  const recentOtp = db.prepare(`
    SELECT created_at FROM otps
    WHERE (target = ? OR target = ?) AND type = 'phone' AND purpose = ? AND is_used = 0 AND is_dispatched = 1
    ORDER BY created_at DESC LIMIT 1
  `).get(normalizedPhone, cleanPhone, purpose);

  if (recentOtp && (now - recentOtp.created_at) < OTP_RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - recentOtp.created_at)) / 1000);
    const err = new Error(`Please wait ${remaining}s before requesting a new verification code.`);
    err.status = 429;
    err.code = 'RATE_LIMITED';
    err.remainingSeconds = remaining;
    throw err;
  }

  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = bcrypt.hashSync(rawOtp, 10);
  const sessionId = `psess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const expiresAt = now + OTP_EXPIRY_MS;

  // Invalidate previous active OTPs for this phone
  db.prepare(`
    UPDATE otps SET is_used = 1 
    WHERE (target = ? OR target = ?) AND type = 'phone' AND purpose = ? AND is_used = 0
  `).run(normalizedPhone, cleanPhone, purpose);

  // Store in SQLite otps table
  db.prepare(`
    INSERT INTO otps (session_id, target, type, otp_hash, purpose, expires_at, attempts_left, is_verified, is_used, is_dispatched, created_at)
    VALUES (?, ?, 'phone', ?, ?, ?, ?, 0, 0, 1, ?)
  `).run(sessionId, normalizedPhone, otpHash, purpose, expiresAt, MAX_ATTEMPTS, now);

  return {
    rawOtp,
    sessionId,
    expiresAt,
    cooldownSeconds: 60
  };
};

/**
 * Verify 6-digit phone OTP from SQLite (used in demo mode when Twilio is not configured)
 */
export const verifyPhoneOtpForUser = ({ phone, code, purpose = 'phone_verification' }) => {
  const cleanPhone = (phone || '').trim();
  const cleanCode = (code || '').trim();
  const now = Date.now();

  let normalizedPhone = cleanPhone;
  try {
    normalizedPhone = normalizeToE164(cleanPhone);
  } catch {}

  if (!cleanCode || cleanCode.length !== 6) {
    const err = new Error('Please enter a valid 6-digit verification code.');
    err.status = 400;
    err.code = 'INVALID_CODE_FORMAT';
    throw err;
  }

  const record = db.prepare(`
    SELECT * FROM otps
    WHERE (target = ? OR target = ?) AND type = 'phone' AND purpose = ? AND is_used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(normalizedPhone, cleanPhone, purpose);

  if (!record) {
    const err = new Error('No active verification code found for this phone number. Please request a new code.');
    err.status = 400;
    err.code = 'NO_OTP_FOUND';
    throw err;
  }

  if (now > record.expires_at) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Verification code has expired. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  if (record.attempts_left <= 0) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Maximum verification attempts exceeded. Please request a new code.');
    err.status = 429;
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  const isMatch = bcrypt.compareSync(cleanCode, record.otp_hash);

  if (!isMatch) {
    const attemptsLeft = record.attempts_left - 1;
    if (attemptsLeft <= 0) {
      db.prepare('UPDATE otps SET attempts_left = 0, is_used = 1 WHERE id = ?').run(record.id);
      const err = new Error('Invalid verification code. Maximum attempts reached. Please request a new code.');
      err.status = 400;
      err.code = 'MAX_ATTEMPTS_REACHED';
      throw err;
    } else {
      db.prepare('UPDATE otps SET attempts_left = ? WHERE id = ?').run(attemptsLeft, record.id);
      const err = new Error(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
      err.status = 400;
      err.code = 'INVALID_OTP';
      throw err;
    }
  }

  // Mark verified & used
  db.prepare('UPDATE otps SET is_verified = 1, is_used = 1 WHERE id = ?').run(record.id);

  return { valid: true, target: normalizedPhone };
};

/**
 * Display simulated OTP safely to the local development terminal ONLY
 * Writes to stdout, appends to server/.demo-otps.log, and caches active demo codes for CLI retrieval.
 */
export const logSimulatedOtpToTerminal = ({ type, target, rawOtp, userName = 'Valued Collector' }) => {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  if (!isDev) return;

  const timestamp = new Date().toLocaleTimeString();
  const banner = [
    '',
    '=======================================================',
    `🧪 [AAROH DEV DEMO] SIMULATED ${type.toUpperCase()} OTP CODE`,
    `   ⏰ Time:         ${timestamp}`,
    `   👤 User:         ${userName}`,
    `   🎯 Target:       ${target} (${type.includes('email') ? 'Email Address' : 'Phone SMS'})`,
    `   🔑 6-Digit Code: [ ${rawOtp} ]`,
    `   ⏱️ Validity:     5 minutes (Single-Use)`,
    `   🛡️ Security:     Stored ONLY as bcrypt hash in SQLite (server/database/aaroh.sqlite)`,
    '=======================================================',
    ''
  ].join('\n');

  // 1. Direct console and unbuffered stdout flush
  console.log(banner);
  try {
    process.stdout.write(banner + '\n');
  } catch {}

  // 2. Local development audit file (server/.demo-otps.log)
  try {
    fs.appendFileSync(demoOtpLogPath, `[${new Date().toISOString()}] ${type.toUpperCase()} -> ${target}: ${rawOtp}\n`, 'utf8');
  } catch {}

  // 3. Save latest active demo codes for local CLI and developer inspection
  try {
    let currentMap = {};
    if (fs.existsSync(demoOtpJsonPath)) {
      try {
        currentMap = JSON.parse(fs.readFileSync(demoOtpJsonPath, 'utf8'));
      } catch {}
    }
    currentMap[target] = {
      type,
      target,
      code: rawOtp,
      userName,
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_EXPIRY_MS
    };
    fs.writeFileSync(demoOtpJsonPath, JSON.stringify(currentMap, null, 2), 'utf8');
  } catch {}
};

/**
 * Retrieve active (non-expired) demo OTPs for developer CLI and local inspection
 * Strictly returns empty array if not in development demo mode.
 */
export const getActiveDemoOtps = () => {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  if (!isDev || process.env.OTP_DEMO_MODE !== 'true') return [];

  const now = Date.now();
  if (!fs.existsSync(demoOtpJsonPath)) return [];

  try {
    const map = JSON.parse(fs.readFileSync(demoOtpJsonPath, 'utf8'));
    const active = [];
    let updated = false;

    for (const key of Object.keys(map)) {
      const item = map[key];
      if (item && item.expiresAt > now) {
        active.push(item);
      } else {
        delete map[key];
        updated = true;
      }
    }

    if (updated) {
      try {
        fs.writeFileSync(demoOtpJsonPath, JSON.stringify(map, null, 2), 'utf8');
      } catch {}
    }

    return active;
  } catch {
    return [];
  }
};

/**
 * Create a secure 6-digit login OTP for an existing user (Email OR Phone).
 * - Enforces 60s cooldown on dispatched OTPs
 * - 5-minute expiry
 * - Stored exclusively as bcrypt hash in otps table
 */
export const createLoginOtpForUser = ({ identifier }) => {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    const err = new Error('No registered account found with this email or mobile number.');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  // Account must have completed required verification
  const hasEmail = Boolean(user.email && user.email.trim());
  const hasPhone = Boolean((user.phone_number || user.phone) && (user.phone_number || user.phone).trim());
  const emailOk = !hasEmail || user.email_verified === 1;
  const phoneOk = !hasPhone || user.phone_verified === 1;

  if (!emailOk || !phoneOk || (!hasEmail && !hasPhone)) {
    const err = new Error('Please complete your account verification before logging in.');
    err.status = 403;
    err.code = 'ACCOUNT_UNVERIFIED';
    err.requiresVerification = true;
    err.user = user;
    throw err;
  }

  const cleanInput = identifier.trim();
  const contactType = detectContactType(cleanInput);

  let type;
  let target;

  if (contactType === 'email') {
    type = 'email';
    target = user.email ? user.email.toLowerCase() : cleanInput.toLowerCase();
  } else if (contactType === 'phone') {
    type = 'phone';
    target = user.phone_number || normalizeToE164(user.phone || cleanInput);
  } else {
    // User ID entered: prefer email if present, else phone
    if (user.email) {
      type = 'email';
      target = user.email.toLowerCase();
    } else {
      type = 'phone';
      target = user.phone_number || normalizeToE164(user.phone);
    }
  }

  const now = Date.now();

  // Cooldown check (60 seconds)
  const recentOtp = db.prepare(`
    SELECT created_at FROM otps
    WHERE target = ? AND purpose = 'login' AND is_used = 0 AND is_dispatched = 1
    ORDER BY created_at DESC LIMIT 1
  `).get(target);

  if (recentOtp && (now - recentOtp.created_at) < OTP_RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - recentOtp.created_at)) / 1000);
    const err = new Error(`Please wait ${remaining}s before requesting a new verification code.`);
    err.status = 429;
    err.code = 'RATE_LIMITED';
    err.remainingSeconds = remaining;
    throw err;
  }

  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = bcrypt.hashSync(rawOtp, 10);
  const sessionId = `lsess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const expiresAt = now + OTP_EXPIRY_MS;

  // Invalidate previous active login OTPs for this target
  db.prepare(`UPDATE otps SET is_used = 1 WHERE target = ? AND purpose = 'login' AND is_used = 0`).run(target);

  // Store in SQLite
  db.prepare(`
    INSERT INTO otps (session_id, target, type, otp_hash, purpose, expires_at, attempts_left, is_verified, is_used, is_dispatched, created_at)
    VALUES (?, ?, ?, ?, 'login', ?, ?, 0, 0, 0, ?)
  `).run(sessionId, target, type, otpHash, expiresAt, MAX_ATTEMPTS, now);

  return {
    rawOtp,
    sessionId,
    expiresAt,
    cooldownSeconds: 60,
    target,
    type,
    user
  };
};

/**
 * Verify 6-digit login OTP for an account
 */
export const verifyLoginOtpForUser = ({ identifier, code }) => {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    const err = new Error('No registered account found with this email or mobile number.');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const cleanCode = (code || '').trim();
  const now = Date.now();

  if (!cleanCode || cleanCode.length !== 6) {
    const err = new Error('Please enter a valid 6-digit verification code.');
    err.status = 400;
    err.code = 'INVALID_CODE_FORMAT';
    throw err;
  }

  const cleanInput = identifier.trim();
  let normalizedPhone = cleanInput;
  try {
    normalizedPhone = normalizeToE164(cleanInput);
  } catch {}

  const targets = [
    cleanInput.toLowerCase(),
    cleanInput,
    normalizedPhone,
    user.email ? user.email.toLowerCase() : null,
    user.phone,
    user.phone_number
  ].filter(Boolean);

  const placeholders = targets.map(() => '?').join(' OR target = ');
  const record = db.prepare(`
    SELECT * FROM otps
    WHERE (target = ${placeholders}) AND purpose = 'login' AND is_used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(...targets);

  if (!record) {
    const err = new Error('No active verification code found. Please request a new code.');
    err.status = 400;
    err.code = 'NO_OTP_FOUND';
    throw err;
  }

  if (now > record.expires_at) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Verification code has expired. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  if (record.attempts_left <= 0) {
    db.prepare('UPDATE otps SET is_used = 1 WHERE id = ?').run(record.id);
    const err = new Error('Maximum verification attempts exceeded. Please request a new code.');
    err.status = 429;
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  const isMatch = bcrypt.compareSync(cleanCode, record.otp_hash);

  if (!isMatch) {
    const attemptsLeft = record.attempts_left - 1;
    if (attemptsLeft <= 0) {
      db.prepare('UPDATE otps SET attempts_left = 0, is_used = 1 WHERE id = ?').run(record.id);
      const err = new Error('Invalid verification code. Maximum attempts reached. Please request a new code.');
      err.status = 400;
      err.code = 'MAX_ATTEMPTS_REACHED';
      throw err;
    } else {
      db.prepare('UPDATE otps SET attempts_left = ? WHERE id = ?').run(attemptsLeft, record.id);
      const err = new Error(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
      err.status = 400;
      err.code = 'INVALID_OTP';
      throw err;
    }
  }

  // Mark verified & used
  db.prepare('UPDATE otps SET is_verified = 1, is_used = 1 WHERE id = ?').run(record.id);

  return { valid: true, user, target: record.target };
};

export default {
  detectContactType,
  findUserByIdentifier,
  checkUserExists,
  createEmailOtpForUser,
  verifyEmailOtpForUser,
  createPhoneOtpForUser,
  verifyPhoneOtpForUser,
  createLoginOtpForUser,
  verifyLoginOtpForUser,
  createPendingSignup,
  verifyPendingSignupOtp,
  verifyPendingSignupLink,
  createForgotPasswordOtp,
  verifyForgotPasswordOtp,
  isOtpDemoModeActive,
  logSimulatedOtpToTerminal,
  getActiveDemoOtps
};

