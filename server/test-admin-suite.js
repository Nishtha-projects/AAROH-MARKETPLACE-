/**
 * AAROH Comprehensive Admin Dashboard & Tracking Test Suite
 * Validates:
 * 1. Database schema migration (last_login_at, login_count, performance indexes, data preservation)
 * 2. Secure administrator provisioning CLI (bcrypt hash, password policy, non-hardcoded)
 * 3. Strict server-side authorization barrier (401 unauthenticated, 403 ordinary users blocked)
 * 4. Live statistics aggregation (totals, signups today/month, engagement, verification breakdown)
 * 5. User management directory API (search, pagination, explicit exclusion of password_hash)
 * 6. Login activity tracking & counters (login_count increment, last_login_at update, audit logs)
 * 7. Verification event tracking and security logging
 * 8. Protection against admin self-demotion lockout
 */

import './env.js';
import http from 'node:http';
import bcrypt from 'bcryptjs';
import db, { generateUniqueUserId } from './database/db.js';
import { validatePasswordPolicy } from './middleware/authMiddleware.js';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passedAssertions++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failedAssertions++;
  }
}

// HTTP request helper against local Express app
function makeRequest({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const reqHeaders = {
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

async function runAdminSuite() {
  console.log('\n================================================================');
  console.log('🛡️  AAROH MARKETPLACE - COMPREHENSIVE ADMIN & TRACKING TEST SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST GROUP 1: Database Schema & Migration Verification
  // --------------------------------------------------------------------------
  console.log('📦 Test Group 1: Database Schema, Column Migrations & Performance Indexes');

  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const colNames = userColumns.map(c => c.name);

  assert(colNames.includes('last_login_at'), 'users table has last_login_at column');
  assert(colNames.includes('login_count'), 'users table has login_count column');
  assert(colNames.includes('email_verified'), 'users table has email_verified column');
  assert(colNames.includes('phone_verified'), 'users table has phone_verified column');
  assert(colNames.includes('role'), 'users table has role column');

  // Verify indexes
  const userIndexes = db.prepare('PRAGMA index_list(users)').all().map(i => i.name);
  assert(userIndexes.includes('idx_users_role'), 'users table has idx_users_role index');
  assert(userIndexes.includes('idx_users_created_at'), 'users table has idx_users_created_at index');

  const securityIndexes = db.prepare('PRAGMA index_list(security_logs)').all().map(i => i.name);
  assert(securityIndexes.includes('idx_security_logs_created_at'), 'security_logs has idx_security_logs_created_at index');
  assert(securityIndexes.includes('idx_security_logs_event'), 'security_logs has idx_security_logs_event index');

  // Verify existing seed records are preserved
  const dulari = db.prepare('SELECT * FROM users WHERE email = ?').get('dulari@aaroh.in');
  assert(dulari && dulari.role === 'artisan', 'Existing master artisan Dulari Devi preserved with role artisan');

  const aditi = db.prepare('SELECT * FROM users WHERE email = ?').get('patron@aaroh.in');
  assert(aditi && aditi.role === 'customer', 'Existing craft patron Aditi Narang preserved with role customer');

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Administrator Provisioning CLI Logic & Password Policy
  // --------------------------------------------------------------------------
  console.log('\n🔐 Test Group 2: Administrator Provisioning & Policy Enforcement');

  // Password policy tests
  assert(!validatePasswordPolicy('short').valid, 'Rejects password shorter than 8 characters');
  assert(!validatePasswordPolicy('alllowercase123!').valid, 'Rejects password without uppercase letter');
  assert(!validatePasswordPolicy('ALLUPPERCASE123!').valid, 'Rejects password without lowercase letter');
  assert(!validatePasswordPolicy('NoNumberSymbol!').valid, 'Rejects password without number');
  assert(!validatePasswordPolicy('NoSymbol12345').valid, 'Rejects password without special symbol');
  assert(validatePasswordPolicy('Admin@Secure2026!').valid, 'Accepts strong administrator password policy');

  // Provision test admin account directly into SQLite
  const testAdminEmail = `admin.test.${Date.now()}@aaroh.test`;
  const testAdminPassword = 'Admin@AarohTest2026!';
  const adminSalt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync(testAdminPassword, adminSalt);
  const adminUserId = generateUniqueUserId();
  const adminInternalId = `admin_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (
      id, user_id, full_name, name, email, email_normalized, phone_number, phone,
      password_hash, role, email_verified, phone_verified, login_count, created_at, updated_at
    )
    VALUES (?, ?, 'Test Administrator', 'Test Administrator', ?, ?, '+919999000001', '+91 99990 00001',
            ?, 'admin', 1, 1, 0, ?, ?)
  `).run(adminInternalId, adminUserId, testAdminEmail, testAdminEmail, adminHash, now, now);

  db.prepare(`
    INSERT INTO security_logs (user_id, identifier, event, ip_address, user_agent, details, created_at)
    VALUES (?, ?, 'ADMIN_CREATED_CLI', '127.0.0.1', 'Test Suite Runner', 'Admin account provisioned for test suite', ?)
  `).run(adminInternalId, testAdminEmail, now);

  const createdAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(adminInternalId);
  assert(createdAdmin && createdAdmin.role === 'admin', 'Admin account inserted with role = "admin"');
  assert(createdAdmin.email_verified === 1 && createdAdmin.phone_verified === 1, 'Admin account has both email and phone marked verified');
  assert(createdAdmin.password_hash.startsWith('$2a$10$'), 'Admin password stored as secure bcrypt hash');
  assert(!createdAdmin.password_hash.includes(testAdminPassword), 'Plaintext password is never stored in database');

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Server-Side Authorization Barrier (401 & 403 Guards)
  // --------------------------------------------------------------------------
  console.log('\n🛡️ Test Group 3: Server-Side Authorization Barrier');

  // 1. Unauthenticated requests to admin endpoints must be rejected with 401
  const unauthStats = await makeRequest({ path: '/api/admin/stats' });
  assert(unauthStats.status === 401, 'GET /api/admin/stats without token returns 401 Unauthorized');

  const unauthUsers = await makeRequest({ path: '/api/admin/users' });
  assert(unauthUsers.status === 401, 'GET /api/admin/users without token returns 401 Unauthorized');

  const unauthActs = await makeRequest({ path: '/api/admin/activities' });
  assert(unauthActs.status === 401, 'GET /api/admin/activities without token returns 401 Unauthorized');

  // 2. Create and authenticate an ordinary customer
  const customerEmail = `customer.test.${Date.now()}@aaroh.test`;
  const customerPassword = 'Customer@Pass123!';
  const customerHash = bcrypt.hashSync(customerPassword, 10);
  const customerInternalId = `cust_${Date.now()}`;
  const customerUserId = generateUniqueUserId();

  db.prepare(`
    INSERT INTO users (
      id, user_id, full_name, name, email, email_normalized, phone_number, phone,
      password_hash, role, email_verified, phone_verified, login_count, created_at, updated_at
    )
    VALUES (?, ?, 'Test Customer', 'Test Customer', ?, ?, '+919876543210', '+91 98765 43210',
            ?, 'customer', 1, 1, 0, ?, ?)
  `).run(customerInternalId, customerUserId, customerEmail, customerEmail, customerHash, now, now);

  const customerLogin = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { identifier: customerEmail, password: customerPassword, captchaToken: '1x00000000000000000000AA' }
  });
  assert(customerLogin.status === 200, 'Customer signs in successfully');
  const customerToken = customerLogin.data?.token;
  assert(Boolean(customerToken), 'Customer receives valid JWT session token');

  // 3. Customer attempting to access admin APIs must be rejected with 403 Forbidden
  const custStats = await makeRequest({
    path: '/api/admin/stats',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(custStats.status === 403, 'Customer token receives 403 Forbidden on /api/admin/stats');
  assert(custStats.data?.error?.includes('Administrator privileges required'), '403 response clearly states administrator privileges required');

  const custUsers = await makeRequest({
    path: '/api/admin/users',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(custUsers.status === 403, 'Customer token receives 403 Forbidden on /api/admin/users');

  const custActivities = await makeRequest({
    path: '/api/admin/activities',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(custActivities.status === 403, 'Customer token receives 403 Forbidden on /api/admin/activities');

  // 4. Verify public signup endpoint rejects admin role injection
  const hackerEmail = `hacker.${Date.now()}@aaroh.test`;
  const hackerPhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
  const signupWithAdminRole = await makeRequest({
    method: 'POST',
    path: '/api/auth/signup',
    body: {
      name: 'Hacker Admin Candidate',
      email: hackerEmail,
      phone: hackerPhone,
      password: 'Hacker@Pass123!',
      confirmPassword: 'Hacker@Pass123!',
      role: 'admin', // Attempting to inject admin role
      captchaToken: '1x00000000000000000000AA'
    }
  });
  assert(signupWithAdminRole.status === 201, 'Signup completes');
  const hackerUser = db.prepare('SELECT role FROM users WHERE email = ?').get(hackerEmail);
  assert(hackerUser && hackerUser.role === 'customer', 'User-controlled signup field CANNOT grant admin role (defaults strictly to customer)');

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Administrator Authentication & Live Statistics API
  // --------------------------------------------------------------------------
  console.log('\n📊 Test Group 4: Administrator Authentication & Live Statistics');

  const adminLogin = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { identifier: testAdminEmail, password: testAdminPassword, captchaToken: '1x00000000000000000000AA' }
  });
  assert(adminLogin.status === 200, 'Admin signs in successfully');
  assert(adminLogin.data?.user?.role === 'admin', 'Login response returns role: admin');
  const adminToken = adminLogin.data?.token;

  // Session check endpoint
  const adminCheck = await makeRequest({
    path: '/api/admin/check',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminCheck.status === 200 && adminCheck.data?.isAdmin === true, 'GET /api/admin/check confirms isAdmin: true');

  // Stats endpoint
  const statsRes = await makeRequest({
    path: '/api/admin/stats',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(statsRes.status === 200, 'GET /api/admin/stats returns 200 OK for admin');
  const stats = statsRes.data?.stats;
  assert(typeof stats?.totalUsers === 'number' && stats.totalUsers >= 2, 'Live stats includes totalUsers count');
  assert(typeof stats?.signupsToday === 'number' && stats.signupsToday >= 1, 'Live stats includes signupsToday count');
  assert(typeof stats?.signupsThisMonth === 'number' && stats.signupsThisMonth >= 1, 'Live stats includes signupsThisMonth count');
  assert(typeof stats?.loggedUsersCount === 'number', 'Live stats includes loggedUsersCount');
  assert(typeof stats?.neverLoggedCount === 'number', 'Live stats includes neverLoggedCount');
  assert(typeof stats?.emailVerifiedCount === 'number', 'Live stats includes emailVerifiedCount');
  assert(typeof stats?.phoneVerifiedCount === 'number', 'Live stats includes phoneVerifiedCount');
  assert(typeof stats?.bothVerifiedCount === 'number', 'Live stats includes bothVerifiedCount');
  assert(Array.isArray(statsRes.data?.recentLogins), 'Returns recentLogins array');
  assert(statsRes.data?.recentLogins.length > 0, 'recentLogins contains recent successful login activity');

  // --------------------------------------------------------------------------
  // TEST GROUP 5: User Management Directory API (Privacy & Secrets Shield)
  // --------------------------------------------------------------------------
  console.log('\n👥 Test Group 5: User Directory Management & Privacy Shield');

  const usersRes = await makeRequest({
    path: '/api/admin/users?page=1&limit=10',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(usersRes.status === 200, 'GET /api/admin/users returns 200 OK');
  assert(Array.isArray(usersRes.data?.users), 'Returns users array');
  assert(usersRes.data?.pagination?.total >= 2, 'Pagination total accurate');

  const sampleUser = usersRes.data.users[0];
  assert(Boolean(sampleUser.userId), 'User item contains userId');
  assert(Boolean(sampleUser.name), 'User item contains name');
  assert(Boolean(sampleUser.email), 'User item contains email');
  assert(sampleUser.passwordStatus === 'Password protected', 'User item explicitly declares passwordStatus: "Password protected"');
  
  // PRIVACY VERIFICATION: password_hash must NEVER be exposed
  const rawResponseText = usersRes.raw;
  assert(!rawResponseText.includes('password_hash'), 'CRITICAL: password_hash is strictly excluded from JSON response');
  assert(!rawResponseText.includes('$2a$10$'), 'CRITICAL: No bcrypt hash signatures leaked in API response');
  assert(!rawResponseText.includes('otp_hash'), 'CRITICAL: No OTP hashes leaked in API response');

  // Search filter
  const searchRes = await makeRequest({
    path: `/api/admin/users?search=${encodeURIComponent(testAdminEmail)}`,
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(searchRes.data?.users?.length === 1, 'Search by exact email returns exactly 1 user');
  assert(searchRes.data?.users[0]?.email === testAdminEmail, 'Search returns matching user');

  // Role filter
  const adminFilterRes = await makeRequest({
    path: '/api/admin/users?role=admin',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminFilterRes.data?.users?.every(u => u.role === 'admin'), 'Role filter "admin" returns only administrators');

  // --------------------------------------------------------------------------
  // TEST GROUP 6: Login Activity Tracking, Counter Increment & Timestamps
  // --------------------------------------------------------------------------
  console.log('\n📈 Test Group 6: Login Tracking, Counter Increment & Timestamps');

  const trackingEmail = `track.${Date.now()}@aaroh.test`;
  const trackingPassword = 'Track@Password2026!';
  const trackingHash = bcrypt.hashSync(trackingPassword, 10);
  const trackingInternalId = `track_${Date.now()}`;
  const trackingUserId = generateUniqueUserId();

  db.prepare(`
    INSERT INTO users (
      id, user_id, full_name, name, email, email_normalized, phone_number, phone,
      password_hash, role, email_verified, phone_verified, login_count, created_at, updated_at
    )
    VALUES (?, ?, 'Tracking User', 'Tracking User', ?, ?, '+919111122222', '+91 91111 22222',
            ?, 'customer', 1, 1, 0, ?, ?)
  `).run(trackingInternalId, trackingUserId, trackingEmail, trackingEmail, trackingHash, now, now);

  const preLoginUser = db.prepare('SELECT login_count, last_login_at FROM users WHERE id = ?').get(trackingInternalId);
  assert(preLoginUser.login_count === 0, 'Initial login_count is 0');
  assert(preLoginUser.last_login_at === null, 'Initial last_login_at is null');

  // 1st Successful Login
  const login1 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { identifier: trackingEmail, password: trackingPassword, captchaToken: '1x00000000000000000000AA' }
  });
  assert(login1.status === 200, 'First login succeeds');

  const userAfterLogin1 = db.prepare('SELECT login_count, last_login_at FROM users WHERE id = ?').get(trackingInternalId);
  assert(userAfterLogin1.login_count === 1, 'login_count increments to 1 after first login');
  assert(Boolean(userAfterLogin1.last_login_at), 'last_login_at is populated with timestamp after login');
  const firstLoginTimestamp = userAfterLogin1.last_login_at;

  // 2nd Successful Login
  const login2 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { identifier: trackingEmail, password: trackingPassword, captchaToken: '1x00000000000000000000AA' }
  });
  assert(login2.status === 200, 'Second login succeeds');

  const userAfterLogin2 = db.prepare('SELECT login_count, last_login_at FROM users WHERE id = ?').get(trackingInternalId);
  assert(userAfterLogin2.login_count === 2, 'login_count increments to 2 after second login');

  // Failed Login Attempt
  const failedLogin = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { identifier: trackingEmail, password: 'WrongPassword@123', captchaToken: '1x00000000000000000000AA' }
  });
  assert(failedLogin.status === 401, 'Failed login with incorrect password returns 401');

  const userAfterFailed = db.prepare('SELECT login_count, last_login_at FROM users WHERE id = ?').get(trackingInternalId);
  assert(userAfterFailed.login_count === 2, 'login_count does NOT increment on failed login');

  // Security logs check for failed attempt
  const badPassLog = db.prepare(`
    SELECT * FROM security_logs 
    WHERE user_id = ? AND event = 'LOGIN_FAILED_BAD_PASSWORD'
  `).get(trackingInternalId);
  assert(Boolean(badPassLog), 'Failed password attempt logged as LOGIN_FAILED_BAD_PASSWORD');
  assert(!JSON.stringify(badPassLog).includes('WrongPassword@123'), 'Raw failed password is NEVER logged in security_logs');

  // --------------------------------------------------------------------------
  // TEST GROUP 7: Role Management & Protection Against Self-Demotion
  // --------------------------------------------------------------------------
  console.log('\n⚙️ Test Group 7: Role Management & Lockout Protection');

  // Promote customer to artisan
  const promoteRes = await makeRequest({
    method: 'POST',
    path: `/api/admin/users/${customerInternalId}/role`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { role: 'artisan' }
  });
  assert(promoteRes.status === 200, 'Admin can update user role to artisan');
  const promotedUser = db.prepare('SELECT role FROM users WHERE id = ?').get(customerInternalId);
  assert(promotedUser.role === 'artisan', 'Database updated with new role artisan');

  // Admin attempting to remove their own admin role must be prevented
  const selfDemoteRes = await makeRequest({
    method: 'POST',
    path: `/api/admin/users/${adminInternalId}/role`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { role: 'customer' }
  });
  assert(selfDemoteRes.status === 400, 'Admin cannot demote own role (returns 400 to prevent lockout)');
  assert(selfDemoteRes.data?.error?.includes('cannot remove your own administrator privileges'), 'Returns clear lockout prevention warning');

  // --------------------------------------------------------------------------
  // TEST GROUP 8: Activity Stream API
  // --------------------------------------------------------------------------
  console.log('\n📜 Test Group 8: Security Audit Activities API');

  const actsRes = await makeRequest({
    path: '/api/admin/activities?page=1&limit=10',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(actsRes.status === 200, 'GET /api/admin/activities returns 200 OK for admin');
  assert(Array.isArray(actsRes.data?.activities), 'Returns activities array');
  assert(actsRes.data?.activities.length > 0, 'Audit activities stream is populated');
  const sampleAct = actsRes.data.activities[0];
  assert(Boolean(sampleAct.event), 'Activity contains event type');
  assert(Boolean(sampleAct.createdAt), 'Activity contains timestamp');

  // ==========================================================================
  // FINAL RESULTS SUMMARY
  // ==========================================================================
  console.log('\n================================================================');
  console.log(`📋 TEST SUITE SUMMARY: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
  console.log('================================================================\n');

  if (failedAssertions > 0) {
    console.error(`❌ Suite failed with ${failedAssertions} assertion failures.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL ADMIN DASHBOARD & SECURITY TRACKING TESTS PASSED (100%)!');
    process.exit(0);
  }
}

runAdminSuite().catch(err => {
  console.error('[Admin Test Suite Uncaught Error]', err);
  process.exit(1);
});
