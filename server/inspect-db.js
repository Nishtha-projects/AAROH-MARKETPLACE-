/**
 * AAROH Database Inspector CLI (For Teacher & Academic Demo)
 * Inspects users, verification states, and security logs in the persistent SQLite database.
 * 
 * Usage:
 *   node server/inspect-db.js
 *   node server/inspect-db.js <email_or_user_id>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database', 'aaroh.sqlite');

function inspectDatabase() {
  console.log('\n=======================================================');
  console.log('🏛️  AAROH MARKETPLACE - PERSISTENT DATABASE INSPECTION');
  console.log('=======================================================');

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Database file not found at: ${dbPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(dbPath);
  console.log(`📁 Database File:   ${dbPath}`);
  console.log(`💾 Size on Disk:   ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`🕒 Last Modified:  ${stats.mtime.toLocaleString()}`);
  console.log(`🔒 Storage Engine: SQLite (WAL Mode, Foreign Keys ON)`);
  console.log('-------------------------------------------------------');

  const target = process.argv[2];

  if (target) {
    // Detailed single-user inspection
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(email) = LOWER(?) OR id = ? OR user_id = ? OR phone_number = ? OR phone = ?
    `).get(target, target, target, target, target);

    if (!user) {
      console.log(`❌ No user found matching identifier: "${target}"`);
      console.log('=======================================================\n');
      return;
    }

    console.log(`👤 Detailed User Record:`);
    console.log(`   • Internal ID:        ${user.id}`);
    console.log(`   • Permanent User ID:  ${user.user_id}`);
    console.log(`   • Full Name:          ${user.name || user.full_name}`);
    console.log(`   • Email:              ${user.email}`);
    console.log(`   • Phone Number:       ${user.phone_number || user.phone}`);
    console.log(`   • Role:               ${user.role}`);
    console.log(`   • Email Verified:     ${user.email_verified === 1 ? '✅ YES (Verified)' : '❌ NO (Pending)'}`);
    console.log(`   • Phone Verified:     ${user.phone_verified === 1 ? '✅ YES (Verified)' : '❌ NO (Pending)'}`);
    console.log(`   • Password Hash:      ${user.password_hash.slice(0, 20)}... [BCRYPT HASH - NO PLAINTEXT]`);
    console.log(`   • Last Login:         ${user.last_login_at || user.last_login || 'Never logged in'}`);
    console.log(`   • Login Count:        ${user.login_count || 0} successful logins`);
    console.log(`   • Account Created:    ${user.created_at}`);
    console.log(`   • Last Updated:       ${user.updated_at}`);

    // Fetch related OTP records
    const otps = db.prepare(`
      SELECT id, type, purpose, attempts_left, is_verified, is_used, is_dispatched, expires_at, created_at
      FROM otps
      WHERE target = ? OR target = ?
      ORDER BY created_at DESC LIMIT 5
    `).all(user.email, user.phone_number || user.phone);

    console.log('\n🔑 Recent OTP Records for this User (Hashes Stored - Plaintext Discarded):');
    if (otps.length === 0) {
      console.log('   (No OTP records found)');
    } else {
      console.table(otps.map(o => ({
        ID: o.id,
        Type: o.type,
        Purpose: o.purpose,
        Dispatched: o.is_dispatched === 1 ? 'Yes' : 'No',
        Verified: o.is_verified === 1 ? 'Yes' : 'No',
        Used: o.is_used === 1 ? 'Yes' : 'No',
        Created: new Date(o.created_at).toLocaleTimeString(),
        Expires: new Date(o.expires_at).toLocaleTimeString()
      })));
    }

    // Fetch security logs
    const logs = db.prepare(`
      SELECT event, details, created_at
      FROM security_logs
      WHERE user_id = ? OR identifier = ?
      ORDER BY id DESC LIMIT 5
    `).all(user.id, user.email);

    console.log('\n📜 Recent Security Audit Logs:');
    if (logs.length === 0) {
      console.log('   (No security logs found)');
    } else {
      console.table(logs);
    }

    console.log('=======================================================\n');
    return;
  }

  // Summary table of all users
  const users = db.prepare(`
    SELECT id, user_id, name, email, phone_number, email_verified, phone_verified, role, last_login_at, last_login, login_count, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();

  console.log(`👥 Total Registered Users in Database: ${users.length}\n`);

  const formattedUsers = users.map(u => ({
    'User ID': u.user_id,
    'Name': u.name,
    'Email': u.email,
    'Role': u.role === 'admin' ? '🛡️ admin' : u.role,
    'Email Ver.': u.email_verified === 1 ? '✅ YES' : '❌ NO',
    'Phone Ver.': u.phone_verified === 1 ? '✅ YES' : '❌ NO',
    'Logins': u.login_count || (u.last_login_at || u.last_login ? 1 : 0),
    'Last Login': u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never',
    'Created At': new Date(u.created_at).toLocaleDateString()
  }));

  console.table(formattedUsers);

  console.log('\n💡 Teacher Demo Tip:');
  console.log('   To view deep cryptographic records, OTP history, and security logs for a user:');
  console.log('   node server/inspect-db.js <email_or_user_id>');
  console.log('=======================================================\n');
}

inspectDatabase();
