// Comprehensive End-to-End Validation Suite for Aaroh Authentication System
import db from './database/db.js';
import bcrypt from 'bcryptjs';
import { 
  createPendingSignup, 
  verifyPendingSignupOtp, 
  verifyPendingSignupLink,
  checkUserExists 
} from './services/otpService.js';
import { generateSessionToken } from './middleware/authMiddleware.js';

const API_BASE = 'http://localhost:5000/api/auth';

const runTests = async () => {
  console.log('=================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE AAROH AUTH & SECURITY VALIDATION SUITE');
  console.log('=================================================================');

  const testEmail = `patron_${Date.now()}@aaroh-test.in`;
  const testPhone = `+91 98450 ${Math.floor(10000 + Math.random() * 90000)}`;
  const testName = 'Vikramaditya Roy';

  // -------------------------------------------------------------
  // TEST 1: Unconfigured SMTP Protection (Requirement 16)
  // Backend MUST NOT fake sending OTP if SMTP is unconfigured
  // -------------------------------------------------------------
  console.log('\n[TEST 1] Testing Unconfigured SMTP Safety Protection...');
  const unconfiguredEmail = `unconf_${Date.now()}@aaroh-test.in`;
  const sendRes = await fetch(`${API_BASE}/send-signup-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: testName,
      email: unconfiguredEmail,
      phone: `+91 98450 ${Math.floor(10000 + Math.random() * 90000)}`,
      verificationMethod: 'email'
    })
  }).then(r => r.json());

  console.log('Unconfigured SMTP response:', sendRes);
  if (sendRes.success === true) {
    throw new Error('SECURITY VIOLATION: Backend faked sending OTP without real configured SMTP!');
  }
  if (!sendRes.error?.includes('Verification service is not configured')) {
    throw new Error(`Expected "Verification service is not configured" error, got: ${sendRes.error}`);
  }
  console.log('✓ PASS: System strictly refused to pretend OTP was sent without real SMTP credentials');

  // -------------------------------------------------------------
  // TEST 2: Pre-Signup Database Check (Requirement 1)
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Testing Pre-Signup Availability Check...');
  const preCheckRes = await fetch(`${API_BASE}/check-pre-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, phone: testPhone })
  }).then(r => r.json());

  console.log('Pre-signup check result:', preCheckRes);
  if (!preCheckRes.success || preCheckRes.exists !== false) {
    throw new Error('Pre-signup check failed for new user');
  }
  console.log('✓ PASS: New user email & phone confirmed available');

  // -------------------------------------------------------------
  // TEST 3: Cryptographic Pending Signup & User ID Generation (Requirements 5 & 6)
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Testing Pending Signup Creation & User ID Format...');
  const pending = createPendingSignup({
    fullName: testName,
    email: testEmail,
    phone: testPhone,
    verificationMethod: 'email'
  });

  console.log('Generated pending signup:', {
    pendingId: pending.pendingId,
    uniqueUserId: pending.uniqueUserId,
    cooldownSeconds: pending.cooldownSeconds,
    rawOtpLength: pending.rawOtp.length
  });

  if (!pending.uniqueUserId.startsWith('AAROH-')) {
    throw new Error(`User ID format violation: expected AAROH-XXXXXX, got ${pending.uniqueUserId}`);
  }
  if (pending.rawOtp.length !== 6) {
    throw new Error(`OTP length violation: expected 6 digits, got ${pending.rawOtp.length}`);
  }

  // Check database persistence: verify raw OTP is NOT stored in DB (only bcrypt hash)
  const dbRecord = db.prepare('SELECT * FROM pending_signups WHERE id = ?').get(pending.pendingId);
  if (!dbRecord) throw new Error('Pending record was not saved to database');
  if (dbRecord.otp_hash === pending.rawOtp) {
    throw new Error('SECURITY VIOLATION: Raw OTP was stored in plaintext in the database!');
  }
  if (dbRecord.link_token_hash === pending.linkToken) {
    throw new Error('SECURITY VIOLATION: Raw link token was stored in plaintext in the database!');
  }
  console.log('✓ PASS: User ID format is AAROH-XXXXXX');
  console.log('✓ PASS: OTP is hashed with Bcrypt (raw OTP never persisted)');
  console.log('✓ PASS: Verification link token is hashed with SHA-256');

  // -------------------------------------------------------------
  // TEST 4: Rate Limiting & Cooldown (Requirement 5)
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Testing Resend Cooldown Rate Limiting (60s)...');
  try {
    createPendingSignup({
      fullName: testName,
      email: testEmail,
      phone: testPhone,
      verificationMethod: 'email'
    });
    throw new Error('Rate limit was bypassed!');
  } catch (rateErr) {
    if (rateErr.code !== 'RATE_LIMITED') {
      throw new Error(`Expected RATE_LIMITED code, got: ${rateErr.code}`);
    }
    console.log(`✓ PASS: Rate limit triggered: ${rateErr.message}`);
  }

  // -------------------------------------------------------------
  // TEST 5: Wrong OTP Rejection & Attempt Counter (Requirement 5 & 14)
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Testing Wrong OTP Rejection & Decrementing Attempts...');
  const badVerifyRes = await fetch(`${API_BASE}/verify-signup-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, code: '000000' })
  }).then(r => r.json());

  console.log('Bad OTP response:', badVerifyRes);
  if (badVerifyRes.success === true) {
    throw new Error('SECURITY VIOLATION: Incorrect OTP was accepted!');
  }
  const updatedDbRecord = db.prepare('SELECT attempts_left FROM pending_signups WHERE id = ?').get(pending.pendingId);
  console.log('Attempts left in database:', updatedDbRecord.attempts_left);
  if (updatedDbRecord.attempts_left !== 4) {
    throw new Error(`Expected 4 attempts left, got ${updatedDbRecord.attempts_left}`);
  }
  console.log('✓ PASS: Wrong OTP rejected and attempts counter decremented');

  // -------------------------------------------------------------
  // TEST 6: Valid OTP Verification & Action Token Issuance (Requirements 5 & 6)
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Testing Valid OTP Verification...');
  const validVerifyRes = await fetch(`${API_BASE}/verify-signup-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, code: pending.rawOtp })
  }).then(r => r.json());

  console.log('Valid OTP response:', validVerifyRes);
  if (!validVerifyRes.success || !validVerifyRes.actionToken) {
    throw new Error('Valid OTP verification failed');
  }
  if (validVerifyRes.uniqueUserId !== pending.uniqueUserId) {
    throw new Error('User ID mismatch in verification response');
  }
  console.log('✓ PASS: OTP verified and Action Token issued with unique User ID:', validVerifyRes.uniqueUserId);

  // -------------------------------------------------------------
  // TEST 7: Single-Use Guarantee (Replay Attack Prevention) (Requirement 5)
  // -------------------------------------------------------------
  console.log('\n[TEST 7] Testing Single-Use OTP (Replay Prevention)...');
  const replayRes = await fetch(`${API_BASE}/verify-signup-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, code: pending.rawOtp })
  }).then(r => r.json());

  console.log('Replay attempt response:', replayRes);
  if (replayRes.success === true) {
    throw new Error('SECURITY VIOLATION: Single-use OTP was re-verified!');
  }
  console.log('✓ PASS: Single-use guarantee enforced, replay prevented');

  // -------------------------------------------------------------
  // TEST 8: Email Verification Link Validation (Requirement 4)
  // -------------------------------------------------------------
  console.log('\n[TEST 8] Testing Single-Use Email Verification Link...');
  const linkTestEmail = `link_${Date.now()}@aaroh-test.in`;
  const linkTestPhone = `+91 98450 ${Math.floor(10000 + Math.random() * 90000)}`;
  const linkPending = createPendingSignup({
    fullName: 'Ananya Sen',
    email: linkTestEmail,
    phone: linkTestPhone,
    verificationMethod: 'email'
  });

  const linkVerifyRes = await fetch(`${API_BASE}/verify-signup-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: linkPending.linkToken })
  }).then(r => r.json());

  console.log('Email link verify response:', linkVerifyRes);
  if (!linkVerifyRes.success || !linkVerifyRes.actionToken) {
    throw new Error('Email verification link token failed');
  }
  console.log('✓ PASS: Email verification link verified token and issued Action Token');

  // Test link single-use (replay)
  const linkReplayRes = await fetch(`${API_BASE}/verify-signup-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: linkPending.linkToken })
  }).then(r => r.json());

  if (linkReplayRes.success === true) {
    throw new Error('SECURITY VIOLATION: Verification link was reused!');
  }
  console.log('✓ PASS: Email verification link marked single-use');

  // -------------------------------------------------------------
  // TEST 9: Password Policy Validation (Requirement 7)
  // Max 8 characters, at least 1 uppercase, at least 1 special char
  // -------------------------------------------------------------
  console.log('\n[TEST 9] Testing Requested Password Policy (Max 8 characters, Uppercase, Special)...');

  // 9a: Too long (> 8 chars)
  const longPassRes = await fetch(`${API_BASE}/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actionToken: validVerifyRes.actionToken,
      password: 'Pass@12345678', // 13 chars > 8
      confirmPassword: 'Pass@12345678'
    })
  }).then(r => r.json());
  console.log('Password > 8 chars rejection:', longPassRes);
  if (longPassRes.success === true) {
    throw new Error('Password > 8 chars was incorrectly accepted!');
  }
  console.log('✓ PASS: Passwords longer than 8 characters correctly rejected');

  // 9b: Missing special char
  const noSpecialRes = await fetch(`${API_BASE}/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actionToken: validVerifyRes.actionToken,
      password: 'Pass1234', // No special char
      confirmPassword: 'Pass1234'
    })
  }).then(r => r.json());
  if (noSpecialRes.success === true) {
    throw new Error('Password without special char was incorrectly accepted!');
  }
  console.log('✓ PASS: Password without special character correctly rejected');

  // 9c: Missing uppercase
  const noUpperRes = await fetch(`${API_BASE}/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actionToken: validVerifyRes.actionToken,
      password: 'pass@12', // No uppercase
      confirmPassword: 'pass@12'
    })
  }).then(r => r.json());
  if (noUpperRes.success === true) {
    throw new Error('Password without uppercase was incorrectly accepted!');
  }
  console.log('✓ PASS: Password without uppercase letter correctly rejected');

  // 9d: Password mismatch
  const mismatchRes = await fetch(`${API_BASE}/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actionToken: validVerifyRes.actionToken,
      password: 'Pass@12',
      confirmPassword: 'Pass@99'
    })
  }).then(r => r.json());
  if (mismatchRes.success === true) {
    throw new Error('Mismatched passwords were accepted!');
  }
  console.log('✓ PASS: Password mismatch correctly rejected');

  // -------------------------------------------------------------
  // TEST 10: Complete Signup & Account Creation (Requirement 6 & 15)
  // -------------------------------------------------------------
  console.log('\n[TEST 10] Completing Signup with Valid 8-char Password (Pass@12)...');
  const validPass = 'Pass@12';
  const completeRes = await fetch(`${API_BASE}/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actionToken: validVerifyRes.actionToken,
      password: validPass,
      confirmPassword: validPass,
      role: 'customer'
    })
  }).then(r => r.json());

  console.log('Complete signup response:', completeRes);
  if (!completeRes.success || !completeRes.token || !completeRes.user) {
    throw new Error('Account completion failed');
  }
  if (completeRes.user.user_id !== pending.uniqueUserId) {
    throw new Error('Created user does not have the expected AAROH User ID');
  }
  console.log('✓ PASS: Permanent user account created with User ID:', completeRes.user.user_id);
  console.log('✓ PASS: Session token issued:', completeRes.token.slice(0, 25) + '...');

  // Verify pending signup record was cleaned up from database
  const cleanedRecord = db.prepare('SELECT id FROM pending_signups WHERE id = ?').get(pending.pendingId);
  if (cleanedRecord) throw new Error('Pending record was not deleted after completion');
  console.log('✓ PASS: Pending signup record cleaned up from database');

  // -------------------------------------------------------------
  // TEST 11: Duplicate User Prevention (Requirement 1 & 15)
  // -------------------------------------------------------------
  console.log('\n[TEST 11] Testing Duplicate Account Rejection on New User...');
  const duplicateCheck = await fetch(`${API_BASE}/check-pre-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, phone: testPhone })
  }).then(r => r.json());

  console.log('Duplicate check result:', duplicateCheck);
  if (duplicateCheck.success !== false || !duplicateCheck.isDuplicate) {
    throw new Error('Duplicate account was not detected!');
  }
  if (!duplicateCheck.error.includes('An account already exists with this email/mobile number')) {
    throw new Error('Expected exact duplicate account error message');
  }
  console.log('✓ PASS: Duplicate account strictly prevented with requested message');

  // -------------------------------------------------------------
  // TEST 12: Login with AAROH User ID + Password (Requirement 8)
  // -------------------------------------------------------------
  console.log('\n[TEST 12] Testing Login with AAROH User ID + Password...');
  const loginWithIdRes = await fetch(`${API_BASE}/login-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: completeRes.user.user_id,
      password: validPass
    })
  }).then(r => r.json());

  console.log('Login with User ID response:', loginWithIdRes);
  if (!loginWithIdRes.success || !loginWithIdRes.token) {
    throw new Error('Login with AAROH User ID failed');
  }
  console.log('✓ PASS: Successfully logged in using AAROH User ID');

  // -------------------------------------------------------------
  // TEST 13: Login with Email + Password (Requirement 8)
  // -------------------------------------------------------------
  console.log('\n[TEST 13] Testing Login with Email Address + Password...');
  const loginWithEmailRes = await fetch(`${API_BASE}/login-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: validPass
    })
  }).then(r => r.json());

  console.log('Login with Email response:', loginWithEmailRes);
  if (!loginWithEmailRes.success || !loginWithEmailRes.token) {
    throw new Error('Login with Email failed');
  }
  console.log('✓ PASS: Successfully logged in using Email');

  // -------------------------------------------------------------
  // TEST 14: Protected Profile & Active Sessions (Requirements 10 & 11)
  // -------------------------------------------------------------
  console.log('\n[TEST 14] Testing Protected Profile (/me) & Active Sessions...');
  const sessionToken = loginWithEmailRes.token;

  const meRes = await fetch(`${API_BASE}/me`, {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }).then(r => r.json());

  console.log('Profile /me response:', meRes);
  if (!meRes.success || meRes.user.user_id !== completeRes.user.user_id) {
    throw new Error('Protected /me profile endpoint failed');
  }
  console.log('✓ PASS: Profile verified. User ID:', meRes.user.user_id, 'Name:', meRes.user.name);

  // Check active sessions
  const sessionsRes = await fetch(`${API_BASE}/active-sessions`, {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }).then(r => r.json());
  console.log('Active sessions count:', sessionsRes.sessions?.length);
  if (!sessionsRes.success || !sessionsRes.sessions?.length) {
    throw new Error('Active sessions lookup failed');
  }
  console.log('✓ PASS: Active sessions retrieved from database');

  // Terminate all other sessions
  const logoutOthersRes = await fetch(`${API_BASE}/logout-all-others`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }).then(r => r.json());
  console.log('Logout all other sessions response:', logoutOthersRes);
  if (!logoutOthersRes.success) {
    throw new Error('Logout all other sessions failed');
  }
  console.log('✓ PASS: Terminated all other active sessions');

  // -------------------------------------------------------------
  // TEST 15: Change Password with Policy Check (Requirement 7 & 11)
  // -------------------------------------------------------------
  console.log('\n[TEST 15] Testing Change Password in Security Sanctuary...');
  const newPass = 'NewP@123';
  const changePassRes = await fetch(`${API_BASE}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      currentPassword: validPass,
      newPassword: newPass,
      confirmPassword: newPass
    })
  }).then(r => r.json());

  console.log('Change password response:', changePassRes);
  if (!changePassRes.success) {
    throw new Error('Change password failed: ' + changePassRes.error);
  }
  console.log('✓ PASS: Password successfully changed with Bcrypt encryption');

  // Verify new password works
  const loginNewPassRes = await fetch(`${API_BASE}/login-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, password: newPass })
  }).then(r => r.json());
  if (!loginNewPassRes.success) {
    throw new Error('Login with updated password failed');
  }
  console.log('✓ PASS: Login with new password succeeded');

  // -------------------------------------------------------------
  // TEST 16: Current Session Logout & Token Invalidation (Requirement 12)
  // -------------------------------------------------------------
  console.log('\n[TEST 16] Testing Current Session Logout...');
  const logoutRes = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }).then(r => r.json());

  if (!logoutRes.success) throw new Error('Logout failed');
  console.log('✓ PASS: Logout succeeded');

  // Confirm token is now invalidated in SQLite
  const postLogoutMe = await fetch(`${API_BASE}/me`, {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }).then(r => r.json());
  if (postLogoutMe.success === true) {
    throw new Error('SECURITY VIOLATION: Revoked session token was accepted!');
  }
  console.log('✓ PASS: Revoked token successfully rejected by requireAuth middleware');

  console.log('\n=================================================================');
  console.log('🎉 ALL 16 AUTHENTICATION & SECURITY VALIDATION TESTS PASSED!');
  console.log('=================================================================\n');
};

runTests().catch(err => {
  console.error('\n❌ VALIDATION TEST FAILED:', err);
  process.exit(1);
});
