/**
 * AAROH Administrative Account Provisioning Utility
 * 
 * Safely creates or promotes an administrator account in the persistent SQLite database.
 * Never hardcodes passwords; validates against Aaroh's strong password policy and hashes with bcrypt.
 * 
 * Usage Examples:
 *   1. Direct command line arguments:
 *      node server/create-admin.js --email admin@aaroh.in --password "Admin@Aaroh2026!" --name "Aaroh Admin" --phone "+919876543210"
 * 
 *   2. Promote existing user:
 *      node server/create-admin.js --promote dulari@aaroh.in
 * 
 *   3. Interactive prompt (run with no args):
 *      node server/create-admin.js
 */

import './env.js';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import db, { generateUniqueUserId } from './database/db.js';
import { validatePasswordPolicy } from './middleware/authMiddleware.js';
import { normalizeToE164 } from './services/smsService.js';
import { logSecurityEvent } from './services/securityLogger.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--email' && args[i + 1]) options.email = args[++i];
    else if (arg === '--password' && args[i + 1]) options.password = args[++i];
    else if (arg === '--name' && args[i + 1]) options.name = args[++i];
    else if (arg === '--phone' && args[i + 1]) options.phone = args[++i];
    else if (arg === '--promote' && args[i + 1]) options.promote = args[++i];
    else if (!options.email && !arg.startsWith('--')) options.email = arg;
    else if (!options.password && !arg.startsWith('--')) options.password = arg;
    else if (!options.name && !arg.startsWith('--')) options.name = arg;
    else if (!options.phone && !arg.startsWith('--')) options.phone = arg;
  }
  return options;
}

function prompt(rl, question, isPassword = false) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n=======================================================');
  console.log('🛡️  AAROH MARKETPLACE - SECURE ADMIN PROVISIONING TOOL');
  console.log('=======================================================');

  const options = parseArgs();

  // Mode 1: Promote existing user to administrator
  if (options.promote) {
    const targetEmail = options.promote.trim().toLowerCase();
    const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(targetEmail);

    if (!existing) {
      console.error(`❌ User not found with email: ${targetEmail}`);
      process.exit(1);
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE users 
      SET role = 'admin', email_verified = 1, phone_verified = 1, updated_at = ? 
      WHERE id = ?
    `).run(now, existing.id);

    logSecurityEvent({
      userId: existing.id,
      identifier: existing.email,
      event: 'ADMIN_PROMOTED_CLI',
      details: `Account promoted to admin via CLI tool. Previous role: ${existing.role}`
    });

    console.log(`✅ User successfully promoted to Administrator!`);
    console.log(`   • Name:        ${existing.name || existing.full_name}`);
    console.log(`   • Email:       ${existing.email}`);
    console.log(`   • User ID:     ${existing.user_id}`);
    console.log(`   • Role:        admin`);
    console.log(`   • Status:      Both Email and Phone marked verified.`);
    console.log('=======================================================\n');
    process.exit(0);
  }

  let { email, password, name, phone } = options;

  if (!email || !password) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (!email) {
      email = await prompt(rl, 'Enter Admin Email Address: ');
    }
    if (!password) {
      password = await prompt(rl, 'Enter Secure Admin Password (min 8 chars, uppercase, lowercase, number, symbol): ', true);
    }
    if (!name) {
      name = await prompt(rl, 'Enter Admin Full Name [Aaroh System Admin]: ');
      if (!name) name = 'Aaroh System Admin';
    }
    if (!phone) {
      phone = await prompt(rl, 'Enter Admin Phone Number [+919999900000]: ');
      if (!phone) phone = '+919999900000';
    }
    rl.close();
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || 'Aaroh System Admin').trim();
  let cleanPhone = (phone || '+919999900000').trim();

  try {
    cleanPhone = normalizeToE164(cleanPhone);
  } catch {}

  if (!cleanEmail || !cleanEmail.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    process.exit(1);
  }

  const policy = validatePasswordPolicy(password);
  if (!policy.valid) {
    console.error(`❌ Password policy violation: ${policy.message}`);
    process.exit(1);
  }

  const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(cleanEmail);
  const now = new Date().toISOString();

  if (existing) {
    // Update existing user to admin with new password hash
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    db.prepare(`
      UPDATE users 
      SET password_hash = ?, role = 'admin', email_verified = 1, phone_verified = 1, 
          name = ?, full_name = ?, phone_number = ?, phone = ?, updated_at = ?
      WHERE id = ?
    `).run(passwordHash, cleanName, cleanName, cleanPhone, cleanPhone, now, existing.id);

    logSecurityEvent({
      userId: existing.id,
      identifier: cleanEmail,
      event: 'ADMIN_UPDATED_CLI',
      details: 'Account updated and elevated to administrator via CLI'
    });

    console.log(`✅ Existing user successfully elevated to Administrator!`);
    console.log(`   • Internal ID: ${existing.id}`);
    console.log(`   • User ID:     ${existing.user_id}`);
    console.log(`   • Email:       ${cleanEmail}`);
    console.log(`   • Role:        admin`);
    console.log(`   • Password:    [PROTECTED BCRYPT HASH SAVED]`);
  } else {
    // Create new admin user
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `admin_${Date.now()}`;
    const uniqueUserId = generateUniqueUserId();

    db.prepare(`
      INSERT INTO users (
        id, user_id, full_name, name, email, email_normalized, phone_number, phone,
        password_hash, role, email_verified, phone_verified, login_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', 1, 1, 0, ?, ?)
    `).run(userId, uniqueUserId, cleanName, cleanName, cleanEmail, cleanEmail, cleanPhone, cleanPhone, passwordHash, now, now);

    logSecurityEvent({
      userId,
      identifier: cleanEmail,
      event: 'ADMIN_CREATED_CLI',
      details: `New administrator provisioned via CLI tool with User ID ${uniqueUserId}`
    });

    console.log(`✅ Administrator account created successfully!`);
    console.log(`   • Internal ID: ${userId}`);
    console.log(`   • User ID:     ${uniqueUserId}`);
    console.log(`   • Name:        ${cleanName}`);
    console.log(`   • Email:       ${cleanEmail}`);
    console.log(`   • Phone:       ${cleanPhone}`);
    console.log(`   • Role:        admin`);
    console.log(`   • Status:      Both Email and Phone verified`);
    console.log(`   • Password:    [PROTECTED BCRYPT HASH SAVED]`);
  }

  console.log('\n🚀 Next Steps:');
  console.log('   1. Navigate to: http://localhost:5173/admin');
  console.log(`   2. Sign in with ${cleanEmail} and the password you configured.`);
  console.log('=======================================================\n');
}

main().catch(err => {
  console.error('❌ Provisioning failed:', err.message);
  process.exit(1);
});
