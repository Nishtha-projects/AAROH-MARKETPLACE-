import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import db, { generateUniqueUserId } from '../database/db.js';
import { 
  detectContactType,
  findUserByIdentifier,
  checkUserExists, 
  createEmailOtpForUser, 
  verifyEmailOtpForUser,
  createPhoneOtpForUser, 
  verifyPhoneOtpForUser,
  createPendingSignup, 
  verifyPendingSignupOtp, 
  verifyPendingSignupLink,
  createForgotPasswordOtp,
  verifyForgotPasswordOtp,
  markOtpDispatched,
  discardUnsentOtp,
  isOtpDemoModeActive,
  logSimulatedOtpToTerminal,
  getActiveDemoOtps
} from '../services/otpService.js';
import { sendOtpEmail, sendPasswordResetSuccessEmail, checkEmailConfigStatus } from '../services/mailer.js';
import { verifyTurnstileToken, checkTurnstileConfigStatus } from '../services/captchaService.js';
import { 
  normalizeToE164, 
  sendPhoneVerificationCode, 
  checkPhoneVerificationCode,
  isSmsConfigured,
  checkSmsConfigStatus
} from '../services/smsService.js';
import { 
  validatePasswordPolicy, 
  generateSessionToken, 
  generateActionToken, 
  verifyActionToken, 
  requireAuth 
} from '../middleware/authMiddleware.js';
import { 
  logSecurityEvent, 
  getSecurityLogsForUser, 
  getActiveSessionsForUser, 
  revokeAllOtherSessions 
} from '../services/securityLogger.js';
import {
  checkGoogleConfigStatus,
  checkMicrosoftConfigStatus,
  generateOAuthState,
  verifyAndConsumeOAuthState,
  getGoogleAuthUrl,
  exchangeGoogleCodeForProfile,
  verifyGoogleIdToken,
  getMicrosoftAuthUrl,
  exchangeMicrosoftCodeForProfile,
  syncOAuthUser
} from '../services/oauthService.js';

const router = express.Router();

/**
 * Remove sensitive credentials from user object before sending in response
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

/**
 * Set persistent HTTP-only session cookie
 */
const setSessionCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('aaroh_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * In-memory brute-force rate limiter for sensitive endpoints
 */
const rateLimitMap = new Map();
const checkRateLimit = (key, maxAttempts = 15, windowMs = 60 * 1000) => {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count += 1;
  }
  rateLimitMap.set(key, entry);
  return entry.count <= maxAttempts;
};

// Periodically prune stale rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ============================================================================
// 0. SERVICE CONFIGURATION STATUS: GET /api/auth/service-status
// Reports gateway readiness without leaking secret credentials
// ============================================================================
router.get(['/service-status', '/config-status', '/oauth-status'], (req, res) => {
  const emailStatus = checkEmailConfigStatus();
  const smsStatus = checkSmsConfigStatus();
  const turnstileStatus = checkTurnstileConfigStatus();
  const googleStatus = checkGoogleConfigStatus();
  const microsoftStatus = checkMicrosoftConfigStatus();
  const demoMode = isOtpDemoModeActive();

  return res.json({
    success: true,
    email: emailStatus,
    sms: smsStatus,
    turnstile: turnstileStatus,
    google: googleStatus,
    microsoft: microsoftStatus,
    demoMode
  });
});

/**
 * Validates Cloudflare Turnstile CAPTCHA token for protected endpoints.
 * Rejects invalid/expired tokens or missing server configuration.
 */
const validateTurnstileCaptcha = async (req) => {
  // Allow explicit bypass for internal test suites in non-production environments
  if (process.env.NODE_ENV !== 'production' && req.headers['x-aaroh-test-bypass'] === 'true') {
    return;
  }

  const status = checkTurnstileConfigStatus();
  if (!status.configured) {
    // Cloudflare Turnstile is optional in local development and offline environments
    return;
  }

  const token = req.body?.captchaToken || req.body?.turnstileToken;
  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    const err = new Error('CAPTCHA verification token is missing. Please complete the security check.');
    err.status = 400;
    err.code = 'CAPTCHA_TOKEN_MISSING';
    throw err;
  }

  const clientIp = req.ip || req.socket.remoteAddress || null;
  await verifyTurnstileToken({ token, remoteIp: clientIp });
};

// ============================================================================
// 0.1 DEVELOPER DEMO OTP RETRIEVAL: GET /api/auth/demo-otp
// Strictly local development only (NODE_ENV=development & OTP_DEMO_MODE=true)
// ============================================================================
router.get('/demo-otp', (req, res) => {
  if (!isOtpDemoModeActive()) {
    return res.status(404).json({ success: false, error: 'Endpoint not available.' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || '';
  const isLocal = clientIp.includes('127.0.0.1') || clientIp.includes('::1') || clientIp.includes('localhost');
  if (!isLocal && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, error: 'Access denied: local development only.' });
  }

  const activeOtps = getActiveDemoOtps();
  return res.json({
    success: true,
    isDemoMode: true,
    activeOtps
  });
});

// ============================================================================
// 1. SIGNUP: POST /api/auth/signup
// Creates account in pending/unverified state & sends verification codes
// ============================================================================
router.post('/signup', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`signup_${clientIp}`, 10, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many signup attempts. Please wait a minute before retrying.' });
  }

  try {
    // Validate Cloudflare Turnstile CAPTCHA
    await validateTurnstileCaptcha(req);

    const { 
      name, 
      fullName, 
      identifier,
      email, 
      phone, 
      phone_number, 
      password, 
      confirmPassword, 
      role = 'customer' 
    } = req.body;

    const rawName = (name || fullName || '').trim();
    if (!rawName || rawName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name (at least 2 characters).' });
    }

    let rawEmail = (email || '').trim().toLowerCase();
    let rawPhone = (phone_number || phone || '').trim();
    const rawIdentifier = (identifier || '').trim();

    // If identifier is provided, auto-detect whether it is email or phone
    if (rawIdentifier) {
      const detected = detectContactType(rawIdentifier);
      if (detected === 'email') {
        rawEmail = rawIdentifier.toLowerCase();
      } else if (detected === 'phone') {
        rawPhone = rawIdentifier;
      } else if (rawIdentifier.includes('@')) {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      } else {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address or mobile phone number.' });
      }
    }

    // Ensure at least one contact method is provided
    if (!rawEmail && !rawPhone) {
      return res.status(400).json({ success: false, error: 'Please enter your email address or mobile phone number.' });
    }

    // Validate email if provided
    if (rawEmail) {
      if (!rawEmail.includes('@') || !rawEmail.includes('.')) {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      }
    }

    // Validate and normalize phone if provided
    let normalizedPhone = null;
    if (rawPhone) {
      try {
        normalizedPhone = normalizeToE164(rawPhone);
      } catch (phoneErr) {
        return res.status(400).json({ success: false, error: phoneErr.message });
      }
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Password and confirm password do not match.' });
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.valid) {
      return res.status(400).json({ success: false, error: policy.message });
    }

    // 2. Check for existing accounts with same email or phone
    let userWithSameEmail = null;
    if (rawEmail) {
      userWithSameEmail = db.prepare(`
        SELECT id, email, user_id, email_verified, phone_verified, phone_number, phone FROM users
        WHERE LOWER(email) = LOWER(?) OR (email_normalized IS NOT NULL AND email_normalized = LOWER(?))
      `).get(rawEmail, rawEmail);

      if (userWithSameEmail && (userWithSameEmail.email_verified === 1 || userWithSameEmail.phone_verified === 1)) {
        return res.status(409).json({
          success: false,
          error: 'An account already exists with this email address. Please login instead.'
        });
      }
    }

    let userWithSamePhone = null;
    if (normalizedPhone) {
      userWithSamePhone = db.prepare(`
        SELECT id, email, user_id, email_verified, phone_verified, phone_number, phone FROM users
        WHERE phone_number = ? OR phone = ?
      `).get(normalizedPhone, rawPhone);

      if (userWithSamePhone && (userWithSamePhone.email_verified === 1 || userWithSamePhone.phone_verified === 1)) {
        return res.status(409).json({
          success: false,
          error: 'An account already exists with this mobile number. Please login instead.'
        });
      }
    }

    // Reject cross-linked duplicates
    if (userWithSameEmail && userWithSamePhone && userWithSameEmail.id !== userWithSamePhone.id) {
      return res.status(409).json({
        success: false,
        error: 'This mobile number is already registered to another account. Please use a different phone number.'
      });
    }

    const now = new Date().toISOString();
    const passwordHash = bcrypt.hashSync(password, 10);
    let userId;
    let uniqueUserId;

    const existingUser = userWithSameEmail || userWithSamePhone;
    if (existingUser) {
      // Safely update unverified account with updated details and new password hash
      userId = existingUser.id;
      uniqueUserId = existingUser.user_id || generateUniqueUserId();
      db.prepare(`
        UPDATE users 
        SET name = ?, full_name = ?, email = ?, email_normalized = ?, phone_number = ?, phone = ?,
            password_hash = ?, role = ?, updated_at = ?
        WHERE id = ?
      `).run(
        rawName, rawName, rawEmail || null, rawEmail || null, normalizedPhone || null, rawPhone || null,
        passwordHash, role === 'artisan' ? 'artisan' : 'customer', now, userId
      );
    } else {
      userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      uniqueUserId = generateUniqueUserId();
      db.prepare(`
        INSERT INTO users (
          id, user_id, full_name, name, email, email_normalized, phone_number, phone,
          password_hash, role, avatar, email_verified, phone_verified,
          created_at, updated_at, last_login, password_updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, NULL, ?)
      `).run(
        userId, uniqueUserId, rawName, rawName, rawEmail || null, rawEmail || null, normalizedPhone || null, rawPhone || null,
        passwordHash, role === 'artisan' ? 'artisan' : 'customer',
        role === 'artisan' ? '/assets/images/hero-artisan.jpg' : null,
        now, now, now
      );
    }

    // 4. Send Verification Codes based on provided contact(s)
    let emailSent = false;
    let emailIsDemo = false;
    let emailMessage = null;

    let phoneSent = false;
    let phoneIsDemo = false;
    let phoneMessage = null;

    const emailStatus = checkEmailConfigStatus();
    const isDemoMode = isOtpDemoModeActive();

    // Send Email OTP only if email was provided
    if (rawEmail) {
      if (emailStatus.configured) {
        const emailOtpData = createEmailOtpForUser({ email: rawEmail, purpose: 'email_verification' });
        try {
          await sendOtpEmail({
            toEmail: rawEmail,
            otpCode: emailOtpData.rawOtp,
            purpose: 'signup',
            userName: rawName
          });
          markOtpDispatched(emailOtpData.sessionId);
          emailSent = true;
          logSecurityEvent({
            req,
            userId,
            identifier: rawEmail,
            event: 'SIGNUP_EMAIL_OTP_SENT',
            details: 'Dispatched via Nodemailer SMTP'
          });
        } catch (sendErr) {
          discardUnsentOtp(emailOtpData.sessionId);
          console.error('[Signup Email Dispatch Error]', sendErr.message);
          return res.status(502).json({
            success: false,
            error: `Failed to deliver verification email: ${sendErr.message}`,
            code: 'EMAIL_DELIVERY_FAILED'
          });
        }
      } else if (isDemoMode) {
        const emailOtpData = createEmailOtpForUser({ email: rawEmail, purpose: 'email_verification' });
        markOtpDispatched(emailOtpData.sessionId);
        emailIsDemo = true;
        emailMessage = 'Development demo code generated (SMTP not configured).';
        logSimulatedOtpToTerminal({
          type: 'email',
          target: rawEmail,
          rawOtp: emailOtpData.rawOtp,
          userName: rawName
        });
        logSecurityEvent({
          req,
          userId,
          identifier: rawEmail,
          event: 'SIGNUP_EMAIL_OTP_DEMO',
          details: 'Simulated OTP generated for teacher demo mode'
        });
      } else {
        return res.status(503).json({
          success: false,
          error: `Email verification service is not configured. Missing in server/.env: ${emailStatus.missing.join(', ')}.`,
          code: 'EMAIL_NOT_CONFIGURED'
        });
      }
    }

    // Send Phone SMS OTP only if phone was provided
    if (normalizedPhone) {
      if (isSmsConfigured()) {
        try {
          await sendPhoneVerificationCode({ toPhone: normalizedPhone, purpose: 'signup' });
          phoneSent = true;
          logSecurityEvent({
            req,
            userId,
            identifier: normalizedPhone,
            event: 'SIGNUP_PHONE_SMS_SENT',
            details: 'Dispatched via Twilio Verify'
          });
        } catch (twilioErr) {
          console.error('[Signup SMS Dispatch Error]', twilioErr.message);
          return res.status(twilioErr.status || 400).json({
            success: false,
            error: `Failed to deliver verification SMS: ${twilioErr.message}`,
            code: 'SMS_DELIVERY_FAILED',
            twilioCode: twilioErr.twilioCode
          });
        }
      } else if (isDemoMode) {
        const phoneOtpData = createPhoneOtpForUser({ phone: normalizedPhone, purpose: 'phone_verification' });
        phoneIsDemo = true;
        phoneMessage = 'Development demo code generated (Twilio not configured).';
        logSimulatedOtpToTerminal({
          type: 'phone SMS',
          target: normalizedPhone,
          rawOtp: phoneOtpData.rawOtp,
          userName: rawName
        });
        logSecurityEvent({
          req,
          userId,
          identifier: normalizedPhone,
          event: 'SIGNUP_PHONE_SMS_DEMO',
          details: 'Simulated SMS OTP generated for teacher demo mode'
        });
      } else {
        return res.status(503).json({
          success: false,
          error: 'SMS verification service is not configured. Please configure Twilio credentials in server/.env.',
          code: 'SMS_NOT_CONFIGURED'
        });
      }
    }

    const primaryIdentifier = rawEmail || normalizedPhone;
    const contactType = rawEmail && normalizedPhone ? 'both' : (rawEmail ? 'email' : 'phone');

    logSecurityEvent({
      req,
      userId,
      identifier: primaryIdentifier,
      event: 'SIGNUP_SUCCESS',
      details: `User ID: ${uniqueUserId}, role: ${role === 'artisan' ? 'artisan' : 'customer'}, contactType: ${contactType}`
    });

    let generalMessage = 'Account created in pending verification state. Verification code has been dispatched.';
    if (emailIsDemo || phoneIsDemo) {
      generalMessage = 'Account created. Development demo code generated; no email/SMS was sent (Check terminal for teacher demonstration).';
    }

    const isActualDemo = Boolean(emailIsDemo || phoneIsDemo);

    return res.status(201).json({
      success: true,
      message: generalMessage,
      userId,
      uniqueUserId,
      name: rawName,
      contactType,
      identifier: primaryIdentifier,
      email: rawEmail || null,
      phone_number: normalizedPhone || null,
      email_verified: false,
      phone_verified: false,
      isDemoMode: isActualDemo,
      emailDelivery: rawEmail ? {
        sent: emailSent,
        isDemo: emailIsDemo,
        message: emailMessage,
        error: null
      } : null,
      phoneDelivery: normalizedPhone ? {
        sent: phoneSent,
        isDemo: phoneIsDemo,
        message: phoneMessage,
        error: null
      } : null
    });
  } catch (err) {
    console.error('[signup error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ success: false, error: err.message || 'Signup registration failed.', code: err.code });
  }
});

// ============================================================================
// 1.1 VERIFY SIGNUP OTP (UNIFIED EMAIL OR PHONE): POST /api/auth/verify-signup-otp
// ============================================================================
router.post('/verify-signup-otp', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`verify_signup_${clientIp}`, 20, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many verification attempts. Please wait a minute.' });
  }

  try {
    const { identifier, email, phone, phone_number, userId, code } = req.body;
    let target = (identifier || email || phone_number || phone || '').trim();
    const cleanCode = (code || '').trim();

    if (!cleanCode) {
      return res.status(400).json({ success: false, error: 'Verification code is required.' });
    }

    let user = null;
    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }
    if (!user && target) {
      user = findUserByIdentifier(target);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    const detected = detectContactType(target);
    const isEmail = detected === 'email' || (!target && Boolean(user.email)) || (Boolean(user.email) && target === user.email);

    if (isEmail) {
      const targetEmail = user.email ? user.email.toLowerCase() : target.toLowerCase();
      verifyEmailOtpForUser({ email: targetEmail, code: cleanCode, purpose: 'email_verification' });
      db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);
    } else {
      const targetPhone = user.phone_number || normalizeToE164(user.phone || target);
      if (isSmsConfigured()) {
        await checkPhoneVerificationCode({ toPhone: targetPhone, code: cleanCode });
      } else if (isOtpDemoModeActive()) {
        verifyPhoneOtpForUser({ phone: targetPhone, code: cleanCode, purpose: 'phone_verification' });
      } else {
        const err = new Error("SMS verification service is not configured.");
        err.status = 503;
        throw err;
      }
      db.prepare('UPDATE users SET phone_verified = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    const hasEmail = Boolean(updatedUser.email && updatedUser.email.trim());
    const hasPhone = Boolean((updatedUser.phone_number || updatedUser.phone) && (updatedUser.phone_number || updatedUser.phone).trim());
    const emailOk = !hasEmail || updatedUser.email_verified === 1;
    const phoneOk = !hasPhone || updatedUser.phone_verified === 1;
    const isFullyVerified = emailOk && phoneOk && (hasEmail || hasPhone);

    let session = null;
    if (isFullyVerified) {
      session = generateSessionToken(updatedUser, req);
      setSessionCookie(res, session.token);
    }

    logSecurityEvent({
      req,
      userId: updatedUser.id,
      identifier: target || updatedUser.email || updatedUser.phone_number,
      event: 'SIGNUP_OTP_VERIFIED',
      details: `isFullyVerified: ${isFullyVerified}`
    });

    return res.json({
      success: true,
      message: 'Verification successful! Welcome to Aaroh.',
      fully_verified: isFullyVerified,
      email_verified: updatedUser.email_verified === 1,
      phone_verified: updatedUser.phone_verified === 1,
      user: sanitizeUser(updatedUser),
      token: session?.token
    });
  } catch (err) {
    console.error('[verify-signup-otp error]', err.message);
    const status = err.status || 400;
    return res.status(status).json({ success: false, error: err.message || 'Verification failed.', code: err.code });
  }
});

// ============================================================================
// 1.2 RESEND SIGNUP OTP (UNIFIED EMAIL OR PHONE): POST /api/auth/resend-signup-otp
// ============================================================================
router.post('/resend-signup-otp', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`resend_signup_${clientIp}`, 15, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please wait a minute.' });
  }

  try {
    await validateTurnstileCaptcha(req);

    const { identifier, email, phone, phone_number, userId } = req.body;
    let target = (identifier || email || phone_number || phone || '').trim();

    let user = null;
    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }
    if (!user && target) {
      user = findUserByIdentifier(target);
    }

    const detected = detectContactType(target);
    const isEmail = detected === 'email' || (user && user.email && (!user.phone_number || target === user.email));
    const userName = user?.name || user?.full_name || 'Valued Member';
    const isDemoMode = isOtpDemoModeActive();

    if (isEmail) {
      const targetEmail = user?.email ? user.email.toLowerCase() : target.toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid email address is required.' });
      }

      const otpData = createEmailOtpForUser({ email: targetEmail, purpose: 'email_verification' });
      const emailStatus = checkEmailConfigStatus();

      if (emailStatus.configured) {
        try {
          await sendOtpEmail({
            toEmail: targetEmail,
            otpCode: otpData.rawOtp,
            purpose: 'signup',
            userName
          });
          markOtpDispatched(otpData.sessionId);
        } catch (sendErr) {
          discardUnsentOtp(otpData.sessionId);
          throw sendErr;
        }
      } else if (isDemoMode) {
        markOtpDispatched(otpData.sessionId);
        logSimulatedOtpToTerminal({
          type: 'email',
          target: targetEmail,
          rawOtp: otpData.rawOtp,
          userName
        });
        return res.json({
          success: true,
          isDemo: true,
          message: 'Development demo code generated; no email was sent (Check terminal for code).',
          cooldownSeconds: otpData.cooldownSeconds
        });
      } else {
        discardUnsentOtp(otpData.sessionId);
        const err = new Error(`Email verification service is not configured. Missing: ${emailStatus.missing.join(', ')}.`);
        err.status = 503;
        throw err;
      }

      return res.json({
        success: true,
        message: `A verification code has been dispatched to ${targetEmail}. Valid for 5 minutes.`,
        cooldownSeconds: otpData.cooldownSeconds
      });
    } else {
      let targetPhone = user?.phone_number || target;
      try {
        targetPhone = normalizeToE164(targetPhone);
      } catch (phoneErr) {
        return res.status(400).json({ success: false, error: phoneErr.message });
      }

      if (isSmsConfigured()) {
        await sendPhoneVerificationCode({ toPhone: targetPhone, purpose: 'signup' });
        return res.json({
          success: true,
          message: `A new verification code has been dispatched via SMS to ${targetPhone}.`,
          cooldownSeconds: 60
        });
      } else if (isDemoMode) {
        const phoneOtpData = createPhoneOtpForUser({ phone: targetPhone, purpose: 'phone_verification' });
        logSimulatedOtpToTerminal({
          type: 'phone SMS',
          target: targetPhone,
          rawOtp: phoneOtpData.rawOtp,
          userName
        });
        return res.json({
          success: true,
          isDemo: true,
          message: 'Development demo code generated; no SMS was sent (Check terminal for code).',
          cooldownSeconds: phoneOtpData.cooldownSeconds
        });
      } else {
        const err = new Error("SMS verification service is not configured. Please configure Twilio Verify credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) in server/.env.");
        err.status = 503;
        err.code = 'SMS_SERVICE_NOT_CONFIGURED';
        throw err;
      }
    }
  } catch (err) {
    console.error('[resend-signup-otp error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to resend verification code.', code: err.code });
  }
});

// ============================================================================
// 2. SEND / RESEND EMAIL OTP: POST /api/auth/send-email-otp
// ============================================================================
router.post(['/send-email-otp', '/resend-email-otp'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`email_otp_${clientIp}`, 15, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many verification code requests. Please wait a minute.' });
  }

  try {
    // Validate Cloudflare Turnstile CAPTCHA on OTP resend
    await validateTurnstileCaptcha(req);

    const { email, userId } = req.body;
    let targetEmail = (email || '').trim().toLowerCase();

    if (!targetEmail && userId) {
      const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
      if (user) targetEmail = user.email.toLowerCase();
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const user = db.prepare('SELECT id, name, full_name FROM users WHERE LOWER(email) = LOWER(?)').get(targetEmail);
    const userName = user?.name || user?.full_name || 'Valued Member';

    const otpData = createEmailOtpForUser({ email: targetEmail, purpose: 'email_verification' });

    const emailStatus = checkEmailConfigStatus();
    const isDemoMode = isOtpDemoModeActive();

    if (emailStatus.configured) {
      try {
        await sendOtpEmail({
          toEmail: targetEmail,
          otpCode: otpData.rawOtp,
          purpose: 'signup',
          userName
        });
        markOtpDispatched(otpData.sessionId);
      } catch (sendErr) {
        discardUnsentOtp(otpData.sessionId);
        throw sendErr;
      }
    } else if (isDemoMode) {
      markOtpDispatched(otpData.sessionId);
      logSimulatedOtpToTerminal({
        type: 'email',
        target: targetEmail,
        rawOtp: otpData.rawOtp,
        userName
      });
      return res.json({
        success: true,
        isDemo: true,
        message: 'Development demo code generated; no email was sent (Check terminal for code).',
        cooldownSeconds: otpData.cooldownSeconds
      });
    } else {
      discardUnsentOtp(otpData.sessionId);
      const err = new Error(`Email verification service is not configured. Missing in server/.env: ${emailStatus.missing.join(', ')}.`);
      err.status = 503;
      err.requiredVariables = emailStatus.missing;
      throw err;
    }

    logSecurityEvent({
      req,
      userId: user?.id,
      identifier: targetEmail,
      event: 'EMAIL_OTP_DISPATCHED',
      details: '6-digit OTP dispatched via Nodemailer SMTP'
    });

    return res.json({
      success: true,
      message: `A verification code has been dispatched to ${targetEmail}. Valid for 5 minutes.`,
      cooldownSeconds: otpData.cooldownSeconds
    });
  } catch (err) {
    console.error(`[Aaroh OTP Error] Email OTP dispatch failed for ${req.body.email || 'user'}:`, err.message);
    const status = err.status || 500;
    return res.status(status).json({ 
      success: false, 
      error: err.message || 'Failed to dispatch email verification code.',
      requiredConfig: err.requiredVariables || ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
    });
  }
});

// ============================================================================
// 3. VERIFY EMAIL OTP: POST /api/auth/verify-email-otp
// ============================================================================
router.post('/verify-email-otp', (req, res) => {
  try {
    const { email, userId, code } = req.body;
    let targetEmail = (email || '').trim().toLowerCase();

    if (!targetEmail && userId) {
      const u = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
      if (u) targetEmail = u.email.toLowerCase();
    }

    if (!targetEmail || !code) {
      return res.status(400).json({ success: false, error: 'Email and verification code are required.' });
    }

    verifyEmailOtpForUser({ email: targetEmail, code, purpose: 'email_verification' });

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE users 
      SET email_verified = 1, updated_at = ? 
      WHERE LOWER(email) = LOWER(?) OR id = ?
    `).run(now, targetEmail, userId || '');

    const updatedUser = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR id = ?
    `).get(targetEmail, userId || '');

    logSecurityEvent({
      req,
      userId: updatedUser?.id,
      identifier: targetEmail,
      event: 'EMAIL_VERIFIED_SUCCESS',
      details: `Email marked verified. Phone verified status: ${updatedUser?.phone_verified}`
    });

    const isFullyVerified = updatedUser?.email_verified === 1 && (!updatedUser?.phone_number || updatedUser?.phone_verified === 1);

    // If fully verified, automatically issue session cookie
    let session = null;
    if (isFullyVerified && updatedUser) {
      session = generateSessionToken(updatedUser, req);
      setSessionCookie(res, session.token);
    }

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      email_verified: true,
      phone_verified: updatedUser?.phone_verified === 1,
      fully_verified: isFullyVerified,
      user: sanitizeUser(updatedUser),
      token: session?.token
    });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ success: false, error: err.message || 'Email verification failed.' });
  }
});

// ============================================================================
// 4. SEND / RESEND PHONE OTP: POST /api/auth/send-phone-otp
// Dispatches real SMS verification code via Twilio Verify API
// ============================================================================
router.post(['/send-phone-otp', '/resend-phone-otp'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`phone_otp_${clientIp}`, 15, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many verification code requests. Please wait a minute.' });
  }

  try {
    // Validate Cloudflare Turnstile CAPTCHA on SMS OTP resend
    await validateTurnstileCaptcha(req);

    const { phone, phone_number, userId } = req.body;
    let targetPhone = (phone_number || phone || '').trim();

    if (!targetPhone && userId) {
      const u = db.prepare('SELECT phone_number, phone FROM users WHERE id = ?').get(userId);
      if (u) targetPhone = u.phone_number || u.phone;
    }

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const normalizedPhone = normalizeToE164(targetPhone);
    const isDemoMode = isOtpDemoModeActive();

    if (isSmsConfigured()) {
      const result = await sendPhoneVerificationCode({ toPhone: normalizedPhone, purpose: 'verification' });

      logSecurityEvent({
        req,
        identifier: normalizedPhone,
        event: 'PHONE_SMS_DISPATCHED',
        details: `Provider: ${result.provider}, Status: ${result.status}`
      });

      return res.json({
        success: true,
        message: `A verification code has been dispatched via SMS to ${normalizedPhone}.`,
        provider: result.provider,
        cooldownSeconds: 60
      });
    } else if (isDemoMode) {
      const phoneOtpData = createPhoneOtpForUser({ phone: normalizedPhone, purpose: 'phone_verification' });
      const user = db.prepare('SELECT name, full_name FROM users WHERE phone_number = ? OR phone = ?').get(normalizedPhone, targetPhone);
      logSimulatedOtpToTerminal({
        type: 'phone SMS',
        target: normalizedPhone,
        rawOtp: phoneOtpData.rawOtp,
        userName: user?.name || user?.full_name || 'Valued Collector'
      });
      return res.json({
        success: true,
        isDemo: true,
        message: 'Development demo code generated; no SMS was sent (Check terminal for code).',
        cooldownSeconds: phoneOtpData.cooldownSeconds
      });
    } else {
      const err = new Error("SMS verification service is not configured. Please configure Twilio Verify credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) in server/.env.");
      err.status = 503;
      err.code = 'SMS_SERVICE_NOT_CONFIGURED';
      err.requiredVariables = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID'];
      throw err;
    }
  } catch (err) {
    console.error(`[Aaroh SMS Error] Phone SMS dispatch failed for ${req.body.phone_number || req.body.phone || 'phone'}:`, err.message);
    const status = err.status || 500;
    return res.status(status).json({ 
      success: false, 
      error: err.message || 'Failed to dispatch phone verification code.',
      requiredConfig: err.requiredVariables || ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID']
    });
  }
});

// ============================================================================
// 5. VERIFY PHONE OTP: POST /api/auth/verify-phone-otp
// Verifies submitted code with Twilio Verify API (or SQLite in demo mode)
// ============================================================================
router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { phone, phone_number, userId, code } = req.body;
    let targetPhone = (phone_number || phone || '').trim();

    if (!targetPhone && userId) {
      const u = db.prepare('SELECT phone_number, phone FROM users WHERE id = ?').get(userId);
      if (u) targetPhone = u.phone_number || u.phone;
    }

    if (!targetPhone || !code) {
      return res.status(400).json({ success: false, error: 'Phone number and verification code are required.' });
    }

    const normalizedPhone = normalizeToE164(targetPhone);
    const isDemoMode = isOtpDemoModeActive();

    if (isSmsConfigured()) {
      await checkPhoneVerificationCode({ toPhone: normalizedPhone, code });
    } else if (isDemoMode) {
      verifyPhoneOtpForUser({ phone: normalizedPhone, code, purpose: 'phone_verification' });
    } else {
      const err = new Error("SMS verification service is not configured.");
      err.status = 503;
      throw err;
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE users 
      SET phone_verified = 1, updated_at = ? 
      WHERE phone_number = ? OR phone = ? OR id = ?
    `).run(now, normalizedPhone, targetPhone, userId || '');

    const updatedUser = db.prepare(`
      SELECT * FROM users WHERE phone_number = ? OR phone = ? OR id = ?
    `).get(normalizedPhone, targetPhone, userId || '');

    logSecurityEvent({
      req,
      userId: updatedUser?.id,
      identifier: normalizedPhone,
      event: 'PHONE_VERIFIED_SUCCESS',
      details: `Phone marked verified. Email verified status: ${updatedUser?.email_verified}`
    });

    const isFullyVerified = updatedUser?.phone_verified === 1 && (!updatedUser?.email || updatedUser?.email_verified === 1);

    // If fully verified, automatically issue session cookie
    let session = null;
    if (isFullyVerified && updatedUser) {
      session = generateSessionToken(updatedUser, req);
      setSessionCookie(res, session.token);
    }

    return res.json({
      success: true,
      message: 'Phone number verified successfully!',
      phone_verified: true,
      email_verified: updatedUser?.email_verified === 1,
      fully_verified: isFullyVerified,
      user: sanitizeUser(updatedUser),
      token: session?.token
    });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ success: false, error: err.message || 'Phone verification failed.' });
  }
});

// ============================================================================
// 6. LOGIN: POST /api/auth/login
// Allows login using email OR phone number and password.
// Enforces required verification checks & sets secure HTTP-only session cookie.
// ============================================================================
router.post(['/login', '/login-password'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login_${clientIp}`, 15, 60 * 1000)) {
    logSecurityEvent({
      req,
      identifier: req.body?.identifier || req.body?.email || req.body?.phone || 'unknown',
      event: 'LOGIN_RATE_LIMITED',
      details: 'Rate limit exceeded: 15 attempts per minute'
    });
    return res.status(429).json({ success: false, error: 'Too many sign-in attempts. Please wait a minute before retrying.' });
  }

  try {
    // Validate Cloudflare Turnstile CAPTCHA
    await validateTurnstileCaptcha(req);

    const { identifier, email, phone, phone_number, password } = req.body;
    const loginIdentifier = (identifier || email || phone_number || phone || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, error: 'Please enter your Email / Phone number and password.' });
    }

    let normalizedPhone = loginIdentifier;
    try {
      normalizedPhone = normalizeToE164(loginIdentifier);
    } catch {}

    const numericPhone = loginIdentifier.replace(/\D/g, '').slice(-10);

    // Parameterized search by email, phone, or User ID
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(email) = LOWER(?) 
         OR (email_normalized IS NOT NULL AND email_normalized = LOWER(?))
         OR phone_number = ?
         OR phone = ?
         OR (LENGTH(?) >= 8 AND REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?)
         OR UPPER(user_id) = UPPER(?)
    `).get(loginIdentifier, loginIdentifier, normalizedPhone, loginIdentifier, numericPhone, `%${numericPhone}%`, loginIdentifier);

    if (!user) {
      logSecurityEvent({
        req,
        identifier: loginIdentifier,
        event: 'LOGIN_FAILED_NO_USER',
        details: 'Identifier not found'
      });
      return res.status(401).json({ success: false, error: 'Invalid Email / Phone number or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      logSecurityEvent({
        req,
        userId: user.id,
        identifier: user.email,
        event: 'LOGIN_FAILED_BAD_PASSWORD',
        details: 'Incorrect password entered'
      });
      return res.status(401).json({ success: false, error: 'Invalid Email / Phone number or password.' });
    }

    // REQUIREMENT: Reject accounts that have not completed required verification
    const hasEmail = Boolean(user.email && user.email.trim());
    const hasPhone = Boolean((user.phone_number || user.phone) && (user.phone_number || user.phone).trim());
    const emailOk = !hasEmail || user.email_verified === 1;
    const phoneOk = !hasPhone || user.phone_verified === 1;

    if (!emailOk || !phoneOk || (!hasEmail && !hasPhone)) {
      logSecurityEvent({
        req,
        userId: user.id,
        identifier: user.email || user.phone_number || user.phone,
        event: 'LOGIN_BLOCKED_UNVERIFIED',
        details: `email_verified: ${user.email_verified}, phone_verified: ${user.phone_verified}`
      });

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        error: 'Please complete your account verification before logging in.',
        userId: user.id,
        email: user.email,
        phone_number: user.phone_number || user.phone,
        emailVerified: user.email_verified === 1,
        phoneVerified: user.phone_verified === 1
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE users 
      SET last_login_at = ?, last_login = ?, login_count = COALESCE(login_count, 0) + 1, updated_at = ? 
      WHERE id = ?
    `).run(now, now, now, user.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) || user;
    const session = generateSessionToken(updatedUser, req);

    // Set secure HTTP-only cookie
    setSessionCookie(res, session.token);

    logSecurityEvent({
      req,
      userId: user.id,
      identifier: user.email,
      event: 'LOGIN_SUCCESS',
      details: 'Password authenticated'
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name || user.full_name}!`,
      user: sanitizeUser(user),
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (err) {
    console.error('[login error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ success: false, error: err.message || 'Sign-in failed. Please try again.', code: err.code });
  }
});

// ============================================================================
// 6.1 SEND LOGIN OTP (EMAIL OR PHONE): POST /api/auth/login-otp/send
// ============================================================================
router.post(['/login-otp/send', '/send-login-otp'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login_otp_${clientIp}`, 15, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many sign-in attempts. Please wait a minute before retrying.' });
  }

  try {
    await validateTurnstileCaptcha(req);

    const { identifier } = req.body;
    const rawIdentifier = (identifier || '').trim();
    if (!rawIdentifier) {
      return res.status(400).json({ success: false, error: 'Please enter your registered email address or mobile number.' });
    }

    const user = findUserByIdentifier(rawIdentifier);
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account registered with this email address or mobile number.' });
    }

    // Verify account verification status
    const hasEmail = Boolean(user.email && user.email.trim());
    const hasPhone = Boolean((user.phone_number || user.phone) && (user.phone_number || user.phone).trim());
    const emailOk = !hasEmail || user.email_verified === 1;
    const phoneOk = !hasPhone || user.phone_verified === 1;

    if (!emailOk || !phoneOk || (!hasEmail && !hasPhone)) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        error: 'Please complete your account verification before logging in.',
        userId: user.id,
        email: user.email,
        phone_number: user.phone_number || user.phone
      });
    }

    const contactType = detectContactType(rawIdentifier);
    const isEmail = contactType === 'email' || (!contactType && Boolean(user.email));
    const target = isEmail ? user.email.toLowerCase() : (user.phone_number || normalizeToE164(user.phone));
    const userName = user.name || user.full_name || 'Valued Member';

    let isDemo = false;
    let cooldownSeconds = 60;

    if (isEmail) {
      const emailStatus = checkEmailConfigStatus();
      const isDemoMode = isOtpDemoModeActive();

      const otpData = createEmailOtpForUser({ email: target, purpose: 'login' });
      cooldownSeconds = otpData.cooldownSeconds;

      if (emailStatus.configured) {
        try {
          await sendOtpEmail({
            toEmail: target,
            otpCode: otpData.rawOtp,
            purpose: 'login',
            userName
          });
          markOtpDispatched(otpData.sessionId);
        } catch (sendErr) {
          discardUnsentOtp(otpData.sessionId);
          console.error('[Login Email Dispatch Error]', sendErr.message);
          return res.status(502).json({
            success: false,
            error: `Failed to deliver login verification email: ${sendErr.message}`,
            code: 'EMAIL_DELIVERY_FAILED'
          });
        }
      } else if (isDemoMode) {
        markOtpDispatched(otpData.sessionId);
        isDemo = true;
        logSimulatedOtpToTerminal({
          type: 'email',
          target,
          rawOtp: otpData.rawOtp,
          userName
        });
      } else {
        discardUnsentOtp(otpData.sessionId);
        return res.status(503).json({
          success: false,
          error: `Email verification service is not configured. Missing in server/.env: ${emailStatus.missing.join(', ')}.`,
          code: 'EMAIL_NOT_CONFIGURED'
        });
      }
    } else {
      // Phone SMS login OTP
      const normalizedPhone = target;
      if (isSmsConfigured()) {
        try {
          await sendPhoneVerificationCode({ toPhone: normalizedPhone, purpose: 'login' });
        } catch (twilioErr) {
          console.error('[Login SMS Dispatch Error]', twilioErr.message);
          return res.status(twilioErr.status || 400).json({
            success: false,
            error: `Twilio SMS delivery failed: ${twilioErr.message}`,
            code: 'SMS_DELIVERY_FAILED',
            twilioCode: twilioErr.twilioCode
          });
        }
      } else if (isOtpDemoModeActive()) {
        const phoneOtpData = createPhoneOtpForUser({ phone: normalizedPhone, purpose: 'login' });
        cooldownSeconds = phoneOtpData.cooldownSeconds;
        isDemo = true;
        logSimulatedOtpToTerminal({
          type: 'phone SMS',
          target: normalizedPhone,
          rawOtp: phoneOtpData.rawOtp,
          userName
        });
      } else {
        return res.status(503).json({
          success: false,
          error: "SMS verification service is not configured. Please configure Twilio Verify credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) in server/.env.",
          code: 'SMS_NOT_CONFIGURED'
        });
      }
    }

    // Mask target for display
    let maskedTarget = target;
    if (isEmail) {
      const [local, dom] = target.split('@');
      maskedTarget = (local.length > 2 ? local.slice(0, 2) : local) + '***@' + dom;
    } else {
      maskedTarget = target.slice(0, 4) + '****' + target.slice(-3);
    }

    logSecurityEvent({
      req,
      userId: user.id,
      identifier: target,
      event: 'LOGIN_OTP_DISPATCHED',
      details: `Type: ${isEmail ? 'email' : 'phone'}, isDemo: ${isDemo}`
    });

    return res.json({
      success: true,
      message: `A 6-digit login verification code has been dispatched to ${maskedTarget}. Valid for 5 minutes.`,
      target: maskedTarget,
      contactType: isEmail ? 'email' : 'phone',
      isDemo,
      cooldownSeconds
    });
  } catch (err) {
    console.error('[login-otp/send error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to dispatch login verification code.', code: err.code });
  }
});

// ============================================================================
// 6.2 VERIFY LOGIN OTP (EMAIL OR PHONE): POST /api/auth/login-otp/verify
// ============================================================================
router.post(['/login-otp/verify', '/verify-login-otp'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login_otp_verify_${clientIp}`, 20, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many verification attempts. Please wait a minute.' });
  }

  try {
    const { identifier, code } = req.body;
    const rawIdentifier = (identifier || '').trim();
    const cleanCode = (code || '').trim();

    if (!rawIdentifier || !cleanCode) {
      return res.status(400).json({ success: false, error: 'Identifier and 6-digit verification code are required.' });
    }

    const user = findUserByIdentifier(rawIdentifier);
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account registered with this email address or mobile number.' });
    }

    const contactType = detectContactType(rawIdentifier);
    const isEmail = contactType === 'email' || (!contactType && Boolean(user.email));
    const target = isEmail ? user.email.toLowerCase() : (user.phone_number || normalizeToE164(user.phone));

    if (isEmail) {
      verifyEmailOtpForUser({ email: target, code: cleanCode, purpose: 'login' });
    } else {
      const normalizedPhone = target;
      if (isSmsConfigured()) {
        await checkPhoneVerificationCode({ toPhone: normalizedPhone, code: cleanCode });
      } else if (isOtpDemoModeActive()) {
        verifyPhoneOtpForUser({ phone: normalizedPhone, code: cleanCode, purpose: 'login' });
      } else {
        const err = new Error("SMS verification service is not configured.");
        err.status = 503;
        throw err;
      }
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE users 
      SET last_login_at = ?, last_login = ?, login_count = COALESCE(login_count, 0) + 1, updated_at = ? 
      WHERE id = ?
    `).run(now, now, now, user.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) || user;
    const session = generateSessionToken(updatedUser, req);

    setSessionCookie(res, session.token);

    logSecurityEvent({
      req,
      userId: user.id,
      identifier: target,
      event: 'LOGIN_OTP_SUCCESS',
      details: 'Passwordless OTP authenticated'
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name || user.full_name}!`,
      user: sanitizeUser(updatedUser),
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (err) {
    console.error('[login-otp/verify error]', err.message);
    const status = err.status || 400;
    return res.status(status).json({ success: false, error: err.message || 'Login verification failed.', code: err.code });
  }
});

// ============================================================================
// 7. LOGOUT: POST /api/auth/logout
// Clears HTTP-only session cookie and revokes session in SQLite
// ============================================================================
router.post('/logout', (req, res) => {
  try {
    let token = req.cookies?.aaroh_session;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyActionToken(token);
        if (decoded?.tokenId) {
          db.prepare('UPDATE sessions SET is_active = 0 WHERE token_id = ?').run(decoded.tokenId);
        }
      } catch {}
    }

    res.clearCookie('aaroh_session', { path: '/' });

    logSecurityEvent({
      req,
      identifier: req.user?.email || 'anonymous',
      event: 'LOGOUT',
      details: 'Session terminated and HTTP-only cookie cleared'
    });

    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.clearCookie('aaroh_session', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully.' });
  }
});

// ============================================================================
// 8. GET CURRENT USER: GET /api/auth/me
// Authenticated via HTTP-only cookie or Authorization header
// ============================================================================
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
});

// ============================================================================
// 9. FORGOT PASSWORD: POST /api/auth/forgot-password
// Never reveals whether an account exists. Rate-limited, 5-minute expiry.
// ============================================================================
router.post(['/forgot-password', '/forgot-password/request'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`forgot_${clientIp}`, 10, 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many password reset requests. Please wait a minute.' });
  }

  try {
    // Validate Cloudflare Turnstile CAPTCHA
    await validateTurnstileCaptcha(req);

    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter your registered Email or Mobile number.' });
    }

    const cleanInput = identifier.trim();
    const result = createForgotPasswordOtp({ identifier: cleanInput });

    // REQUIREMENT: Never reveal whether account exists
    const genericSuccessMessage = 'If an account matches those details, a verification code has been dispatched.';

    if (result.notFound) {
      return res.json({
        success: true,
        message: genericSuccessMessage,
        cooldownSeconds: 60
      });
    }

    if (result.type === 'email') {
      try {
        await sendOtpEmail({
          toEmail: result.target,
          otpCode: result.rawOtp,
          purpose: 'forgot_password',
          userName: result.user.name || result.user.full_name || 'Valued Member'
        });
        markOtpDispatched(result.sessionId);
      } catch (sendErr) {
        discardUnsentOtp(result.sessionId);
        throw sendErr;
      }
    } else {
      if (isSmsConfigured()) {
        await sendPhoneVerificationCode({
          toPhone: result.target,
          purpose: 'forgot_password'
        });
      }
    }

    logSecurityEvent({
      req,
      userId: result.user.id,
      identifier: result.target,
      event: 'FORGOT_PASSWORD_REQUESTED',
      details: `Type: ${result.type}`
    });

    return res.json({
      success: true,
      message: genericSuccessMessage,
      cooldownSeconds: result.cooldownSeconds
    });
  } catch (err) {
    console.error('[forgot-password error]', err);
    return res.json({
      success: true,
      message: 'If an account matches those details, a verification code has been dispatched.',
      cooldownSeconds: 60
    });
  }
});

// ============================================================================
// 10. VERIFY FORGOT PASSWORD OTP: POST /api/auth/verify-password-reset-otp
// Verifies OTP and generates short-lived reset action token (15 mins)
// ============================================================================
router.post(['/verify-password-reset-otp', '/forgot-password/verify'], async (req, res) => {
  try {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, error: 'Identifier and verification code are required.' });
    }

    const cleanInput = identifier.trim();
    const cleanCode = code.trim();

    // Check if SMS verification
    let isSms = false;
    let normalizedPhone = cleanInput;
    try {
      normalizedPhone = normalizeToE164(cleanInput);
      isSms = true;
    } catch {}

    let user;
    if (isSms && isSmsConfigured()) {
      await checkPhoneVerificationCode({ toPhone: normalizedPhone, code: cleanCode });
      user = db.prepare('SELECT id, email, user_id FROM users WHERE phone_number = ? OR phone = ?').get(normalizedPhone, cleanInput);
    } else {
      const verified = verifyForgotPasswordOtp({ identifier: cleanInput, code: cleanCode });
      user = verified.user;
    }

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid verification code or user not found.' });
    }

    const actionToken = generateActionToken({
      userId: user.id,
      email: user.email,
      purpose: 'reset_password',
      verified: true
    }, '15m');

    logSecurityEvent({
      req,
      userId: user.id,
      identifier: user.email,
      event: 'PASSWORD_RESET_OTP_VERIFIED',
      details: 'Proceeding to new password entry'
    });

    return res.json({
      success: true,
      message: 'Code verified successfully! Please enter your new password.',
      actionToken
    });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ success: false, error: err.message || 'Verification failed.' });
  }
});

// ============================================================================
// 11. RESET PASSWORD: POST /api/auth/reset-password
// Sets new password, verifies token, hashes with bcrypt, invalidates old sessions
// ============================================================================
router.post(['/reset-password', '/forgot-password/reset'], (req, res) => {
  try {
    const { actionToken, newPassword, confirmPassword } = req.body;

    if (!actionToken) {
      return res.status(400).json({ success: false, error: 'Reset session token is required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const decoded = verifyActionToken(actionToken);
    if (!decoded || decoded.purpose !== 'reset_password' || !decoded.verified) {
      return res.status(400).json({
        success: false,
        error: 'Password reset session expired or invalid. Please request a new verification code.'
      });
    }

    const policy = validatePasswordPolicy(newPassword);
    if (!policy.valid) {
      return res.status(400).json({ success: false, error: policy.message });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users 
      SET password_hash = ?, password_updated_at = ? 
      WHERE id = ?
    `).run(newHash, now, decoded.userId);

    // Invalidate all prior active sessions for security
    db.prepare('UPDATE sessions SET is_active = 0 WHERE user_id = ?').run(decoded.userId);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    const session = generateSessionToken(updatedUser, req);
    setSessionCookie(res, session.token);

    logSecurityEvent({
      req,
      userId: updatedUser.id,
      identifier: updatedUser.email,
      event: 'PASSWORD_RESET_SUCCESS',
      details: 'Password updated and new session issued'
    });

    // Send confirmation email asynchronously
    sendPasswordResetSuccessEmail({
      toEmail: updatedUser.email,
      userName: updatedUser.name || updatedUser.full_name || 'Member'
    }).catch(mailErr => {
      console.warn('[Password Reset Confirmation Mail Notice]', mailErr.message);
    });

    return res.json({
      success: true,
      message: 'Password reset successfully! You are now securely logged in.',
      user: sanitizeUser(updatedUser),
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// ============================================================================
// 12. BACKWARDS COMPATIBLE LEGACY ROUTES
// ============================================================================
router.post('/check-pre-signup', (req, res) => {
  try {
    const { email, phone } = req.body;
    const result = checkUserExists({ email, phone });

    if (result.exists) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        reason: result.reason,
        error: 'An account already exists with this email/mobile number. Please login instead.'
      });
    }

    return res.json({
      success: true,
      exists: false,
      message: 'Email and phone are available for registration.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Database check failed.' });
  }
});

router.post('/send-signup-verification', async (req, res) => {
  let pending = null;
  try {
    const { fullName, email, phone, verificationMethod = 'email' } = req.body;

    pending = createPendingSignup({ fullName, email, phone, verificationMethod });
    const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';

    if (verificationMethod === 'email') {
      const verificationLink = `${clientUrl}/?verify_token=${pending.linkToken}`;
      await sendOtpEmail({
        toEmail: pending.cleanEmail,
        otpCode: pending.rawOtp,
        verificationLink,
        purpose: 'signup',
        userName: pending.cleanName
      });

      return res.json({
        success: true,
        message: `A verification code and email link have been dispatched to ${pending.cleanEmail}.`,
        pendingId: pending.pendingId,
        cooldownSeconds: pending.cooldownSeconds
      });
    } else {
      await sendPhoneVerificationCode({ toPhone: pending.cleanPhone, purpose: 'signup' });
      return res.json({
        success: true,
        message: `A verification code has been dispatched via SMS to ${pending.cleanPhone}.`,
        pendingId: pending.pendingId,
        cooldownSeconds: pending.cooldownSeconds
      });
    }
  } catch (err) {
    if (pending?.pendingId) {
      try {
        db.prepare('DELETE FROM pending_signups WHERE id = ?').run(pending.pendingId);
      } catch {}
    }
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      isDuplicate: Boolean(err.isDuplicate),
      error: err.message || 'Failed to dispatch verification code.'
    });
  }
});

router.post('/verify-signup-otp', (req, res) => {
  try {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, error: 'Identifier and verification code are required.' });
    }

    const { valid, pendingRecord } = verifyPendingSignupOtp({ identifier, code });

    const actionToken = generateActionToken({
      pendingId: pendingRecord.id,
      email: pendingRecord.email,
      phone: pendingRecord.phone,
      fullName: pendingRecord.full_name,
      uniqueUserId: pendingRecord.unique_user_id,
      verificationMethod: pendingRecord.verification_method,
      purpose: 'complete_signup',
      verified: true
    }, '20m');

    return res.json({
      success: true,
      message: `Account verified! Your unique Aaroh User ID is ${pendingRecord.unique_user_id}. Please create your secure password.`,
      actionToken,
      uniqueUserId: pendingRecord.unique_user_id,
      fullName: pendingRecord.full_name,
      email: pendingRecord.email,
      phone: pendingRecord.phone
    });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ success: false, error: err.message });
  }
});

router.post('/verify-signup-link', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Verification token is required.' });
    }

    const { valid, pendingRecord } = verifyPendingSignupLink({ token });

    const actionToken = generateActionToken({
      pendingId: pendingRecord.id,
      email: pendingRecord.email,
      phone: pendingRecord.phone,
      fullName: pendingRecord.full_name,
      uniqueUserId: pendingRecord.unique_user_id,
      verificationMethod: 'email',
      purpose: 'complete_signup',
      verified: true
    }, '20m');

    return res.json({
      success: true,
      message: `Email verified via secure link! Your unique Aaroh User ID is ${pendingRecord.unique_user_id}. Please create your secure password.`,
      actionToken,
      uniqueUserId: pendingRecord.unique_user_id,
      fullName: pendingRecord.full_name,
      email: pendingRecord.email,
      phone: pendingRecord.phone
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/complete-signup', async (req, res) => {
  try {
    const { actionToken, password, confirmPassword, role = 'customer' } = req.body;

    if (!actionToken) {
      return res.status(400).json({ success: false, error: 'Action token is required. Please verify first.' });
    }

    const decoded = verifyActionToken(actionToken);
    if (!decoded || decoded.purpose !== 'complete_signup' || !decoded.verified) {
      return res.status(400).json({
        success: false,
        error: 'Verification session expired or invalid. Please verify again.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.valid) {
      return res.status(400).json({ success: false, error: policy.message });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(decoded.email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Account already created. Please login.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const uniqueUserId = decoded.uniqueUserId;

    let normalizedPhone = decoded.phone;
    try {
      normalizedPhone = normalizeToE164(decoded.phone);
    } catch {}

    db.prepare(`
      INSERT INTO users (
        id, user_id, full_name, name, email, email_normalized, phone_number, phone, 
        password_hash, role, avatar, email_verified, phone_verified, 
        created_at, updated_at, last_login, password_updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?)
    `).run(
      userId,
      uniqueUserId,
      decoded.fullName,
      decoded.fullName,
      decoded.email,
      decoded.email.toLowerCase(),
      normalizedPhone,
      decoded.phone,
      passwordHash,
      role === 'artisan' ? 'artisan' : 'customer',
      role === 'artisan' ? '/assets/images/hero-artisan.jpg' : null,
      now,
      now,
      now,
      now
    );

    if (decoded.pendingId) {
      db.prepare('DELETE FROM pending_signups WHERE id = ?').run(decoded.pendingId);
    }

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const session = generateSessionToken(newUser, req);
    setSessionCookie(res, session.token);

    return res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome to AAROH, ${newUser.full_name}. (User ID: ${uniqueUserId})`,
      user: sanitizeUser(newUser),
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// Active sessions & Security Activity
router.post('/logout-all-others', requireAuth, (req, res) => {
  try {
    const count = revokeAllOtherSessions(req.user.id, req.sessionId);
    return res.json({ success: true, message: `Terminated ${count} other active session(s) successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to terminate other sessions.' });
  }
});

router.get('/active-sessions', requireAuth, (req, res) => {
  try {
    const activeSessions = getActiveSessionsForUser(req.user.id);
    return res.json({ success: true, currentSessionId: req.sessionId, sessions: activeSessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch sessions.' });
  }
});

router.post('/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'New password and confirmation do not match.' });
    }

    const fullUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const isCurrentValid = bcrypt.compareSync(currentPassword, fullUser.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, error: 'Incorrect current password.' });
    }

    const policy = validatePasswordPolicy(newPassword);
    if (!policy.valid) {
      return res.status(400).json({ success: false, error: policy.message });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET password_hash = ?, password_updated_at = ? WHERE id = ?').run(newHash, now, req.user.id);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update password.' });
  }
});

router.get('/security-activity', requireAuth, (req, res) => {
  try {
    const logs = getSecurityLogsForUser(req.user.id, 20);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve security activity.' });
  }
});


// ============================================================================
// OAUTH 2.0 / OPENID CONNECT ENDPOINTS (GOOGLE & MICROSOFT ENTRA ID)
// ============================================================================

/**
 * GET /api/auth/google
 * Initiates Google OAuth 2.0 / OIDC login or returns authorization URL.
 */
router.get('/google', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';
  const role = req.query.role === 'artisan' ? 'artisan' : 'customer';
  const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

  try {
    const config = checkGoogleConfigStatus();
    if (!config.configured) {
      if (wantsJson) {
        return res.status(503).json({
          success: false,
          configured: false,
          provider: 'google',
          error: `Google OAuth is not configured. Missing environment variables: ${config.missing.join(', ')}.`
        });
      }
      return res.redirect(`${clientUrl}/login?error=GOOGLE_OAUTH_NOT_CONFIGURED`);
    }

    const state = generateOAuthState({ provider: 'google', role });
    const authUrl = getGoogleAuthUrl({ state });

    if (wantsJson) {
      return res.json({ success: true, configured: true, url: authUrl, state });
    }

    return res.redirect(authUrl);
  } catch (err) {
    console.error('[Google OAuth Initiation Error]', err);
    if (wantsJson) {
      return res.status(err.status || 500).json({ success: false, error: err.message });
    }
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message || 'Failed to initiate Google sign-in.')}`);
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth 2.0 authorization code redirect, exchanges code, and creates session.
 */
router.get('/google/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';

  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      const errMsg = error_description || error;
      console.warn('[Google OAuth Callback Error from Provider]', errMsg);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errMsg)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientUrl}/login?error=INVALID_OAUTH_CALLBACK`);
    }

    // 1. Verify CSRF State
    const stateRecord = verifyAndConsumeOAuthState({ state, provider: 'google' });

    // 2. Exchange authorization code for user profile
    const profile = await exchangeGoogleCodeForProfile({ code });

    // 3. Sync or link user in SQLite
    const { user, isNewUser } = syncOAuthUser({
      provider: 'google',
      providerId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      requestedRole: stateRecord.role || 'customer',
      req
    });

    // 4. Generate persistent session
    const sessionToken = generateSessionToken(user.id, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    setSessionCookie(res, sessionToken);

    return res.redirect(
      `${clientUrl}/#auth-success?provider=google&token=${encodeURIComponent(sessionToken)}&role=${encodeURIComponent(user.role)}&isNew=${isNewUser ? '1' : '0'}`
    );
  } catch (err) {
    console.error('[Google Callback Exception]', err);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message || 'Google sign-in encountered an error.')}`);
  }
});

/**
 * POST /api/auth/google/verify-token
 * Direct ID token verification for Google One Tap / frontend Google buttons.
 */
router.post('/google/verify-token', async (req, res) => {
  try {
    const { idToken, role = 'customer' } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Google ID token is required.' });
    }

    const profile = await verifyGoogleIdToken({ idToken });
    const { user, isNewUser } = syncOAuthUser({
      provider: 'google',
      providerId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      requestedRole: role === 'artisan' ? 'artisan' : 'customer',
      req
    });

    const sessionToken = generateSessionToken(user.id, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    setSessionCookie(res, sessionToken);

    return res.json({
      success: true,
      token: sessionToken,
      user: sanitizeUser(user),
      isNewUser,
      message: isNewUser ? 'Account created via Google.' : 'Welcome back! Signed in with Google.'
    });
  } catch (err) {
    console.error('[Google Token Verification Error]', err);
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/microsoft
 * Initiates Microsoft Entra ID OAuth 2.0 login or returns authorization URL.
 */
router.get('/microsoft', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';
  const role = req.query.role === 'artisan' ? 'artisan' : 'customer';
  const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

  try {
    const config = checkMicrosoftConfigStatus();
    if (!config.configured) {
      if (wantsJson) {
        return res.status(503).json({
          success: false,
          configured: false,
          provider: 'microsoft',
          error: `Microsoft Entra OAuth is not configured. Missing environment variables: ${config.missing.join(', ')}.`
        });
      }
      return res.redirect(`${clientUrl}/login?error=MICROSOFT_OAUTH_NOT_CONFIGURED`);
    }

    const state = generateOAuthState({ provider: 'microsoft', role });
    const authUrl = getMicrosoftAuthUrl({ state });

    if (wantsJson) {
      return res.json({ success: true, configured: true, url: authUrl, state });
    }

    return res.redirect(authUrl);
  } catch (err) {
    console.error('[Microsoft OAuth Initiation Error]', err);
    if (wantsJson) {
      return res.status(err.status || 500).json({ success: false, error: err.message });
    }
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message || 'Failed to initiate Microsoft sign-in.')}`);
  }
});

/**
 * GET /api/auth/microsoft/callback
 * Handles Microsoft Entra ID authorization code redirect, exchanges code, and creates session.
 */
router.get('/microsoft/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';

  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      const errMsg = error_description || error;
      console.warn('[Microsoft OAuth Callback Error from Provider]', errMsg);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errMsg)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientUrl}/login?error=INVALID_OAUTH_CALLBACK`);
    }

    // 1. Verify CSRF State
    const stateRecord = verifyAndConsumeOAuthState({ state, provider: 'microsoft' });

    // 2. Exchange authorization code for user profile
    const profile = await exchangeMicrosoftCodeForProfile({ code });

    // 3. Sync or link user in SQLite
    const { user, isNewUser } = syncOAuthUser({
      provider: 'microsoft',
      providerId: profile.microsoftId,
      email: profile.email,
      name: profile.name,
      avatar: null,
      requestedRole: stateRecord.role || 'customer',
      req
    });

    // 4. Generate persistent session
    const sessionToken = generateSessionToken(user.id, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    setSessionCookie(res, sessionToken);

    return res.redirect(
      `${clientUrl}/#auth-success?provider=microsoft&token=${encodeURIComponent(sessionToken)}&role=${encodeURIComponent(user.role)}&isNew=${isNewUser ? '1' : '0'}`
    );
  } catch (err) {
    console.error('[Microsoft Callback Exception]', err);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message || 'Microsoft sign-in encountered an error.')}`);
  }
});

export default router;
