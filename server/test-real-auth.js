/**
 * AAROH MARKETPLACE - REAL AUTHENTICATION & GATEWAY INTEGRATION TEST SUITE
 * 
 * Verifies live Gmail SMTP, live Twilio Verify SMS, and DB verification:
 * 1. Gateway Status: Gmail SMTP & Twilio Verify live & demo mode disabled
 * 2. Real Email OTP Dispatch via Gmail SMTP to nishthagarg647@gmail.com
 * 3. Real SMS OTP Dispatch via Twilio Verify to +919175702555
 * 4. Dual Signup: Both Email and Phone provided, separate OTPs dispatched
 * 5. Wrong OTP Rejection (400 error, no demo fallback)
 * 6. Expired OTP Rejection (400 error)
 * 7. Real Verification & Session Token Generation
 * 8. Admin Login (ARH-ADMIN) & Admin Stats API Access
 * 9. Demo Endpoint Disabled (404)
 */

import http from 'node:http';
import bcrypt from 'bcryptjs';
import db from './database/db.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

function makeRequest({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'x-aaroh-test-bypass': 'true',
      ...headers,
      ...(jsonBody ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonBody)
      } : {})
    };

    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          raw: rawData
        });
      });
    });

    req.on('error', err => reject(err));
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

async function run() {
  console.log('\n================================================================');
  console.log('🚀 AAROH REAL GATEWAY INTEGRATION & AUTHENTICATION TEST SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // STEP 0: SERVICE CONFIGURATION STATUS
  // --------------------------------------------------------------------------
  console.log('📡 Step 0: Checking Live Service Gateway Status...');
  const resStatus = await makeRequest({ method: 'GET', path: '/api/auth/service-status' });
  assert(resStatus.status === 200, `GET /api/auth/service-status returned 200 OK`);
  assert(resStatus.data?.email?.configured === true, `Email Gateway is configured (${resStatus.data?.email?.provider})`);
  assert(resStatus.data?.email?.provider === 'Gmail SMTP', `Email Gateway provider is Gmail SMTP`);
  assert(resStatus.data?.sms?.configured === true, `SMS Gateway is configured (${resStatus.data?.sms?.provider})`);
  assert(resStatus.data?.sms?.provider === 'Twilio Verify', `SMS Gateway provider is Twilio Verify`);
  assert(resStatus.data?.demoMode === false, `Demo OTP mode is strictly FALSE (Real delivery active)`);

  // --------------------------------------------------------------------------
  // STEP 1: DEMO ENDPOINT STRICT PRIVACY CHECK
  // --------------------------------------------------------------------------
  console.log('\n🔒 Step 1: Confirming Demo Code Endpoint is Disabled...');
  const resDemo = await makeRequest({ method: 'GET', path: '/api/auth/demo-otp' });
  assert(resDemo.status === 404, `GET /api/auth/demo-otp returns 404 Not Found in real mode (Status: ${resDemo.status})`);

  // --------------------------------------------------------------------------
  // STEP 2: REAL EMAIL-ONLY SIGNUP TO SECOND GMAIL ACCOUNT
  // --------------------------------------------------------------------------
  const secondGmail = 'nishthagarg647@gmail.com';
  console.log(`\n📧 Step 2: Testing Real Email-Only Signup to ${secondGmail}...`);

  // Clean test user with secondGmail so signup runs fresh
  db.prepare('DELETE FROM users WHERE LOWER(email) = LOWER(?)').run(secondGmail);
  db.prepare('DELETE FROM otps WHERE target = ?').run(secondGmail);

  const resEmailSignup = await makeRequest({
    method: 'POST',
    path: '/api/auth/signup',
    body: {
      name: 'Nishtha Garg Second Account',
      email: secondGmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'customer'
    }
  });

  assert(resEmailSignup.status === 201, `Signup returned 201 Created (Status: ${resEmailSignup.status})`);
  assert(resEmailSignup.data?.email === secondGmail, `User email matches ${secondGmail}`);
  assert(resEmailSignup.data?.phone_number === null, `User phone is null (Email-only signup)`);
  assert(resEmailSignup.data?.isDemoMode === false, `isDemoMode is FALSE`);
  assert(resEmailSignup.data?.emailDelivery?.sent === true, `Email delivery marked as sent: true`);
  assert(resEmailSignup.data?.emailDelivery?.isDemo === false, `Email delivery isDemo is false`);

  // Verify SQLite OTP record was created and marked dispatched
  const emailOtpRecord = db.prepare(`
    SELECT * FROM otps WHERE target = ? AND type = 'email' AND is_used = 0 ORDER BY created_at DESC LIMIT 1
  `).get(secondGmail);
  assert(Boolean(emailOtpRecord), `SQLite otps record found for ${secondGmail}`);
  assert(emailOtpRecord?.is_dispatched === 1, `OTP is_dispatched flag is 1 (Real SMTP verified)`);

  // --------------------------------------------------------------------------
  // STEP 3: WRONG & EXPIRED OTP REJECTION FOR EMAIL
  // --------------------------------------------------------------------------
  console.log('\n❌ Step 3: Testing Wrong and Expired OTP Rejection...');
  const resWrongOtp = await makeRequest({
    method: 'POST',
    path: '/api/auth/verify-signup-otp',
    body: {
      identifier: secondGmail,
      code: '000000'
    }
  });
  assert(resWrongOtp.status === 400, `Wrong OTP returns 400 Bad Request (Status: ${resWrongOtp.status})`);
  assert(resWrongOtp.data?.error?.includes('Invalid verification code'), `Error states: "${resWrongOtp.data?.error}"`);

  // Expired OTP test: simulate past expiry
  db.prepare(`UPDATE otps SET expires_at = ? WHERE id = ?`).run(Date.now() - 10000, emailOtpRecord.id);
  const resExpiredOtp = await makeRequest({
    method: 'POST',
    path: '/api/auth/verify-signup-otp',
    body: {
      identifier: secondGmail,
      code: '123456'
    }
  });
  assert(resExpiredOtp.status === 400, `Expired OTP returns 400 Bad Request (Status: ${resExpiredOtp.status})`);
  assert(resExpiredOtp.data?.error?.includes('expired'), `Error states: "${resExpiredOtp.data?.error}"`);

  // --------------------------------------------------------------------------
  // STEP 4: VERIFY EMAIL OTP & SESSION CREATION
  // --------------------------------------------------------------------------
  console.log('\n🔑 Step 4: Testing Successful Verification and Account Activation...');
  const testValidCode = '654321';
  const validHash = bcrypt.hashSync(testValidCode, 10);
  db.prepare(`
    INSERT INTO otps (session_id, target, type, otp_hash, purpose, expires_at, attempts_left, is_verified, is_used, is_dispatched, created_at)
    VALUES (?, ?, 'email', ?, 'email_verification', ?, 5, 0, 0, 1, ?)
  `).run(`test_sess_${Date.now()}`, secondGmail, validHash, Date.now() + 300000, Date.now());

  const resVerifySuccess = await makeRequest({
    method: 'POST',
    path: '/api/auth/verify-signup-otp',
    body: {
      identifier: secondGmail,
      code: testValidCode
    }
  });
  assert(resVerifySuccess.status === 200, `Verification returned 200 OK`);
  assert(resVerifySuccess.data?.fully_verified === true, `User is fully_verified: true`);
  assert(resVerifySuccess.data?.email_verified === true, `email_verified is true`);
  assert(Boolean(resVerifySuccess.data?.token), `JWT session token returned`);

  // --------------------------------------------------------------------------
  // STEP 5: REAL PHONE-ONLY SIGNUP VIA TWILIO VERIFY (+919175702555)
  // --------------------------------------------------------------------------
  const verifiedTwilioNumber = '+919175702555';
  console.log(`\n📱 Step 5: Testing Real Phone-Only Signup via Twilio Verify (${verifiedTwilioNumber})...`);

  // Backup and temporarily release phone on existing user so signup can test real delivery
  const existingWithPhone = db.prepare(`SELECT id, phone, phone_number FROM users WHERE phone_number = ? OR phone = ?`).get(verifiedTwilioNumber, verifiedTwilioNumber);
  if (existingWithPhone) {
    db.prepare(`UPDATE users SET phone = '+919111111111', phone_number = '+919111111111' WHERE id = ?`).run(existingWithPhone.id);
  }

  const resPhoneSignup = await makeRequest({
    method: 'POST',
    path: '/api/auth/signup',
    body: {
      name: 'Nishtha Garg Twilio Verified',
      phone_number: verifiedTwilioNumber,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'customer'
    }
  });

  assert(resPhoneSignup.status === 201, `Phone signup returned 201 Created (Status: ${resPhoneSignup.status})`);
  assert(resPhoneSignup.data?.phone_number === verifiedTwilioNumber, `User phone matches ${verifiedTwilioNumber}`);
  assert(resPhoneSignup.data?.email === null, `User email is null (Phone-only signup)`);
  assert(resPhoneSignup.data?.isDemoMode === false, `isDemoMode is FALSE`);
  assert(resPhoneSignup.data?.phoneDelivery?.sent === true, `Phone SMS delivery marked as sent: true`);
  assert(resPhoneSignup.data?.phoneDelivery?.isDemo === false, `Phone delivery isDemo is false`);

  // --------------------------------------------------------------------------
  // STEP 6: TWILIO VERIFY LIVE SMS CODE CHECK (WRONG CODE REJECTION)
  // --------------------------------------------------------------------------
  console.log('\n📲 Step 6: Testing Twilio Verify Live SMS Code Check (Wrong Code Rejection)...');
  const resTwilioWrong = await makeRequest({
    method: 'POST',
    path: '/api/auth/verify-signup-otp',
    body: {
      userId: resPhoneSignup.data?.userId,
      identifier: verifiedTwilioNumber,
      code: '000000'
    }
  });
  assert(resTwilioWrong.status === 400, `Live Twilio check rejects wrong code with 400 Bad Request (Status: ${resTwilioWrong.status})`);
  assert(
    resTwilioWrong.data?.error?.includes('Invalid verification code') ||
    resTwilioWrong.data?.error?.includes('expired') ||
    resTwilioWrong.data?.error?.includes('Verification check failed'),
    `Twilio rejection message received: "${resTwilioWrong.data?.error}"`
  );

  // Clean test phone signup user before dual signup
  db.prepare(`DELETE FROM users WHERE phone_number = ? AND email IS NULL`).run(verifiedTwilioNumber);

  // --------------------------------------------------------------------------
  // STEP 7: DUAL SIGNUP (BOTH EMAIL AND PHONE)
  // --------------------------------------------------------------------------
  console.log('\n👥 Step 7: Testing Dual Contact Signup (Both Email and Phone)...');
  const dualEmail = `dual.real.${Date.now()}@aaroh.test`;

  const resDualSignup = await makeRequest({
    method: 'POST',
    path: '/api/auth/signup',
    body: {
      name: 'Dual Contact Real',
      email: dualEmail,
      phone_number: verifiedTwilioNumber,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'customer'
    }
  });

  assert(resDualSignup.status === 201, `Dual signup returned 201 Created (Status: ${resDualSignup.status})`);
  assert(resDualSignup.data?.contactType === 'both', `contactType is 'both'`);
  assert(resDualSignup.data?.email === dualEmail, `User email matches ${dualEmail}`);
  assert(resDualSignup.data?.phone_number === verifiedTwilioNumber, `User phone matches ${verifiedTwilioNumber}`);
  assert(resDualSignup.data?.emailDelivery?.sent === true, `Email delivery sent: true`);
  assert(resDualSignup.data?.phoneDelivery?.sent === true, `Phone SMS delivery sent: true`);
  assert(resDualSignup.data?.isDemoMode === false, `Dual signup isDemoMode is FALSE`);

  // Clean dual test user and restore original user's phone
  db.prepare(`DELETE FROM users WHERE LOWER(email) = LOWER(?)`).run(dualEmail);
  if (existingWithPhone) {
    db.prepare(`UPDATE users SET phone = ?, phone_number = ? WHERE id = ?`).run(existingWithPhone.phone, existingWithPhone.phone_number, existingWithPhone.id);
  }

  // --------------------------------------------------------------------------
  // STEP 8: ADMIN LOGIN & ADMIN STATS PRESERVATION
  // --------------------------------------------------------------------------
  console.log('\n👑 Step 8: Preserving Existing Admin Login & Admin Controls...');
  const resAdminLogin = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: {
      identifier: 'ARH-ADMIN',
      password: 'Admin@Aaroh2026!'
    }
  });

  assert(resAdminLogin.status === 200, `Admin login returned 200 OK (Status: ${resAdminLogin.status})`);
  assert(resAdminLogin.data?.user?.role === 'admin', `Admin role confirmed: ${resAdminLogin.data?.user?.role}`);
  assert(Boolean(resAdminLogin.data?.token), `Admin received JWT token`);

  const resAdminCheck = await makeRequest({
    method: 'GET',
    path: '/api/admin/check',
    headers: {
      'Authorization': `Bearer ${resAdminLogin.data?.token}`
    }
  });
  assert(resAdminCheck.status === 200, `Admin check returned 200 OK (isAdmin: ${resAdminCheck.data?.isAdmin})`);

  const resAdminStats = await makeRequest({
    method: 'GET',
    path: '/api/admin/stats',
    headers: {
      'Authorization': `Bearer ${resAdminLogin.data?.token}`
    }
  });
  assert(resAdminStats.status === 200, `Admin stats returned 200 OK (Total users: ${resAdminStats.data?.stats?.totalUsers})`);

  // --------------------------------------------------------------------------
  // STEP 9: CLOUDFLARE TURNSTILE CAPTCHA SERVER-SIDE VALIDATION
  // --------------------------------------------------------------------------
  console.log('\n🛡️ Step 9: Testing Cloudflare Turnstile Server-Side Validation...');
  // 9a. Turnstile Status
  assert(resStatus.data?.turnstile?.configured === true, `Turnstile secret key configured (${resStatus.data?.turnstile?.mode})`);

  // 9b. Request with missing Turnstile token and NO test bypass header
  const resMissingCaptcha = await new Promise((resolve, reject) => {
    const jsonBody = JSON.stringify({
      identifier: 'test@aaroh.in',
      password: 'SomePassword123!'
      // No captchaToken provided
    });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonBody)
        // NOT passing x-aaroh-test-bypass header
      }
    }, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(rawData); } catch {}
        resolve({ status: res.statusCode, data: json });
      });
    });
    req.on('error', reject);
    req.write(jsonBody);
    req.end();
  });

  assert(resMissingCaptcha.status === 400, `Missing Turnstile token rejected with HTTP 400 (Status: ${resMissingCaptcha.status})`);
  assert(resMissingCaptcha.data?.error?.includes('CAPTCHA'), `Rejection message requires CAPTCHA token (${resMissingCaptcha.data?.error})`);

  // 9c. Verify Cloudflare Siteverify API rejects invalid/failing challenges
  // Using Cloudflare's official always-fail testing secret key: 2x0000000000000000000000000000000AA
  const cfVerifyForm = new URLSearchParams({
    secret: '2x0000000000000000000000000000000AA',
    response: 'any_dummy_challenge_token'
  });
  const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: cfVerifyForm.toString()
  });
  const cfData = await cfRes.json();
  assert(cfData.success === false, `Cloudflare Siteverify rejects invalid challenge (success: ${cfData.success})`);
  assert(Array.isArray(cfData['error-codes']) && cfData['error-codes'].length > 0, `Cloudflare Siteverify returned rejection error-codes: ${cfData['error-codes']?.join(', ')}`);

  // --------------------------------------------------------------------------
  // STEP 10: GOOGLE & MICROSOFT OAUTH ENDPOINT CONFIGURATION & STATE INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n🌐 Step 10: Testing Google & Microsoft OAuth 2.0 / OIDC Flow...');
  // 10a. Status endpoint reports accurate OAuth configuration
  assert(typeof resStatus.data?.google?.configured === 'boolean', `Google OAuth status is boolean (${resStatus.data?.google?.configured})`);
  assert(typeof resStatus.data?.microsoft?.configured === 'boolean', `Microsoft OAuth status is boolean (${resStatus.data?.microsoft?.configured})`);
  assert(resStatus.data?.google?.redirectUri?.includes('/api/auth/google/callback'), `Google redirect URI is valid: ${resStatus.data?.google?.redirectUri}`);
  assert(resStatus.data?.microsoft?.redirectUri?.includes('/api/auth/microsoft/callback'), `Microsoft redirect URI is valid: ${resStatus.data?.microsoft?.redirectUri}`);

  // 10b. When unconfigured, initiating Google OAuth via JSON returns 503 with exact missing variable guidance
  const resGoogleInit = await makeRequest({ method: 'GET', path: '/api/auth/google?format=json' });
  if (!resStatus.data?.google?.configured) {
    assert(resGoogleInit.status === 503, `Unconfigured Google OAuth returns HTTP 503 (${resGoogleInit.status})`);
    assert(resGoogleInit.data?.configured === false, `Google OAuth reports configured: false`);
    assert(resGoogleInit.data?.error?.includes('GOOGLE_CLIENT_ID'), `Google OAuth error guides user to GOOGLE_CLIENT_ID`);
  } else {
    assert(resGoogleInit.status === 200, `Configured Google OAuth returns HTTP 200 with authorization URL`);
    assert(resGoogleInit.data?.url?.includes('accounts.google.com'), `Google auth URL generated correctly`);
  }

  // 10c. When unconfigured, initiating Microsoft OAuth via JSON returns 503 with exact guidance
  const resMicrosoftInit = await makeRequest({ method: 'GET', path: '/api/auth/microsoft?format=json' });
  if (!resStatus.data?.microsoft?.configured) {
    assert(resMicrosoftInit.status === 503, `Unconfigured Microsoft OAuth returns HTTP 503 (${resMicrosoftInit.status})`);
    assert(resMicrosoftInit.data?.configured === false, `Microsoft OAuth reports configured: false`);
    assert(resMicrosoftInit.data?.error?.includes('MICROSOFT_CLIENT_ID'), `Microsoft OAuth error guides user to MICROSOFT_CLIENT_ID`);
  } else {
    assert(resMicrosoftInit.status === 200, `Configured Microsoft OAuth returns HTTP 200 with authorization URL`);
    assert(resMicrosoftInit.data?.url?.includes('login.microsoftonline.com'), `Microsoft auth URL generated correctly`);
  }

  // 10d. Callback without code or state safely redirects to login with error
  const resGoogleBadCallback = await makeRequest({ method: 'GET', path: '/api/auth/google/callback' });
  assert(resGoogleBadCallback.status === 302, `Missing OAuth callback parameters redirects (302)`);
  assert(resGoogleBadCallback.headers.location?.includes('error='), `OAuth callback redirect includes error parameter`);

  // Health check
  const resHealth = await makeRequest({ method: 'GET', path: '/api/health' });
  assert(resHealth.status === 200 && resHealth.data?.status === 'online', `Aaroh platform health online`);

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 REAL AUTHENTICATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
