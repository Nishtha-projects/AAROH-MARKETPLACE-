import { seedMarketplaceData } from './seedMarketplace.js';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = __dirname;
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'aaroh.sqlite');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for reliability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    email_normalized TEXT,
    phone_number TEXT,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    avatar TEXT,
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,
    login_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_login TEXT,
    last_login_at TEXT,
    password_updated_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

  CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    target TEXT NOT NULL,
    type TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts_left INTEGER DEFAULT 5,
    is_verified INTEGER DEFAULT 0,
    is_used INTEGER DEFAULT 0,
    is_dispatched INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_otps_lookup ON otps(session_id, target, type, is_used);
  CREATE INDEX IF NOT EXISTS idx_otps_target ON otps(target, type, purpose, is_used);

  CREATE TABLE IF NOT EXISTS sessions (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, is_active);

  CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    identifier TEXT NOT NULL,
    event TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pending_signups (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    email_normalized TEXT,
    phone TEXT,
    phone_number TEXT,
    verification_method TEXT NOT NULL,
    unique_user_id TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    link_token_hash TEXT,
    link_token_expires_at INTEGER,
    otp_expires_at INTEGER NOT NULL,
    attempts_left INTEGER DEFAULT 5,
    is_verified INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_pending_email ON pending_signups(email_normalized);
  CREATE INDEX IF NOT EXISTS idx_pending_phone ON pending_signups(phone);
  CREATE INDEX IF NOT EXISTS idx_pending_unique_id ON pending_signups(unique_user_id);

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    craft_id TEXT NOT NULL,
    craft_name TEXT NOT NULL,
    artisan_id TEXT NOT NULL,
    artisan_name TEXT NOT NULL,
    artisan_location TEXT,
    price REAL NOT NULL,
    availability TEXT DEFAULT 'In Stock',
    status TEXT DEFAULT 'Published',
    stock_count INTEGER DEFAULT 1,
    ready_made INTEGER DEFAULT 1,
    lead_time_days INTEGER DEFAULT 3,
    image TEXT,
    gallery TEXT,
    materials TEXT,
    dimensions TEXT,
    weight TEXT,
    description TEXT,
    gi_certified INTEGER DEFAULT 1,
    gi_tag TEXT,
    tags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_products_craft ON products(craft_id);
  CREATE INDEX IF NOT EXISTS idx_products_artisan ON products(artisan_id);

  CREATE TABLE IF NOT EXISTS artisans (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    title TEXT,
    craft TEXT NOT NULL,
    location TEXT NOT NULL,
    experience_years INTEGER DEFAULT 10,
    avatar TEXT,
    bio TEXT,
    verified INTEGER DEFAULT 1,
    badge TEXT,
    rating REAL DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 50,
    active_products_count INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_city TEXT,
    shipping_address TEXT,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'Confirmed',
    payment_mode TEXT DEFAULT 'UPI (Verified Payment)',
    tracking_code TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id, customer_email);

  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    product_title TEXT NOT NULL,
    artisan_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    purpose TEXT,
    preferred_contact TEXT DEFAULT 'WhatsApp',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New Enquiry',
    artisan_response TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_enquiries_artisan ON enquiries(artisan_id);

  CREATE TABLE IF NOT EXISTS commissions (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    artisan_id TEXT NOT NULL,
    artisan_name TEXT NOT NULL,
    craft_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget REAL NOT NULL,
    dimensions TEXT,
    timeline_weeks INTEGER DEFAULT 4,
    reference_images TEXT,
    status TEXT DEFAULT 'Requested',
    escrow_status TEXT DEFAULT 'Advance Pending (25%)',
    escrow_amount REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cultural_heritage (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    gi_certified INTEGER DEFAULT 1,
    gi_tag TEXT,
    materials TEXT,
    motifs TEXT,
    description TEXT NOT NULL,
    reviewer TEXT,
    citations TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    preferred_lang TEXT DEFAULT 'en',
    theme_mode TEXT DEFAULT 'light',
    palette TEXT DEFAULT 'ivory-indigo',
    reduced_motion INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

`);

// Run migrations for existing database columns and nullability
try {
  const commCols = db.prepare('PRAGMA table_info(commissions)').all().map(c => c.name);
  if (!commCols.includes('license_choice')) {
    db.exec("ALTER TABLE commissions ADD COLUMN license_choice TEXT DEFAULT 'personal_display';");
  }
  if (!commCols.includes('usage_permission')) {
    db.exec("ALTER TABLE commissions ADD COLUMN usage_permission INTEGER DEFAULT 1;");
  }
  if (!commCols.includes('is_private')) {
    db.exec("ALTER TABLE commissions ADD COLUMN is_private INTEGER DEFAULT 1;");
  }
  if (!commCols.includes('artisan_response')) {
    db.exec("ALTER TABLE commissions ADD COLUMN artisan_response TEXT DEFAULT '';");
  }
} catch (e) {
  console.warn('[DB Migration notice: commissions]', e.message);
}

try {
  const orderCols = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);
  if (!orderCols.includes('payment_status')) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Demo Order - Payment Not Collected';");
  }
} catch (e) {
  console.warn('[DB Migration notice: orders]', e.message);
}
try {
  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const emailCol = userColumns.find(col => col.name === 'email');
  const phoneCol = userColumns.find(col => col.name === 'phone');

  // If email or phone has NOT NULL constraint, migrate table to allow email-only or phone-only users
  if ((emailCol && emailCol.notnull === 1) || (phoneCol && phoneCol.notnull === 1)) {
    db.exec('PRAGMA foreign_keys = OFF;');
    db.exec(`
      CREATE TABLE users_migrated (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        email_normalized TEXT,
        phone_number TEXT,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        avatar TEXT,
        email_verified INTEGER DEFAULT 0,
        phone_verified INTEGER DEFAULT 0,
        login_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login TEXT,
        last_login_at TEXT,
        password_updated_at TEXT
      );

      INSERT INTO users_migrated (
        id, user_id, full_name, name, email, email_normalized, phone_number, phone,
        password_hash, role, avatar, email_verified, phone_verified, login_count,
        created_at, updated_at, last_login, last_login_at, password_updated_at
      )
      SELECT 
        id, user_id, full_name, name, email, 
        COALESCE(email_normalized, LOWER(email)), 
        phone_number, phone, password_hash, role, avatar, 
        COALESCE(email_verified, 0), COALESCE(phone_verified, 0), 
        COALESCE(login_count, 0), created_at, updated_at, 
        last_login, last_login_at, password_updated_at 
      FROM users;

      DROP TABLE users;
      ALTER TABLE users_migrated RENAME TO users;
      PRAGMA foreign_keys = ON;
    `);
  }
} catch (migErr) {
  console.warn('[DB Migration] users nullability migration notice:', migErr.message);
}

try {
  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const hasEmailNormalized = userColumns.some(col => col.name === 'email_normalized');
  if (!hasEmailNormalized) {
    db.exec('ALTER TABLE users ADD COLUMN email_normalized TEXT;');
    db.exec('UPDATE users SET email_normalized = LOWER(email) WHERE email_normalized IS NULL AND email IS NOT NULL;');
  }

  const hasPhoneNumber = userColumns.some(col => col.name === 'phone_number');
  if (!hasPhoneNumber) {
    db.exec('ALTER TABLE users ADD COLUMN phone_number TEXT;');
    db.exec(`
      UPDATE users 
      SET phone_number = CASE 
        WHEN phone LIKE '+%' THEN phone 
        ELSE '+91' || REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '')
      END
      WHERE phone_number IS NULL AND phone IS NOT NULL;
    `);
  }

  const hasName = userColumns.some(col => col.name === 'name');
  if (!hasName) {
    db.exec('ALTER TABLE users ADD COLUMN name TEXT;');
    db.exec('UPDATE users SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;');
  }

  const hasLastLoginAt = userColumns.some(col => col.name === 'last_login_at');
  if (!hasLastLoginAt) {
    db.exec('ALTER TABLE users ADD COLUMN last_login_at TEXT;');
    db.exec('UPDATE users SET last_login_at = last_login WHERE last_login IS NOT NULL;');
  }

  const hasLoginCount = userColumns.some(col => col.name === 'login_count');
  if (!hasLoginCount) {
    db.exec('ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;');
    db.exec('UPDATE users SET login_count = 1 WHERE last_login IS NOT NULL;');
  }

  const hasGoogleId = userColumns.some(col => col.name === 'google_id');
  if (!hasGoogleId) {
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT;');
  }

  const hasMicrosoftId = userColumns.some(col => col.name === 'microsoft_id');
  if (!hasMicrosoftId) {
    db.exec('ALTER TABLE users ADD COLUMN microsoft_id TEXT;');
  }

  const hasOauthProvider = userColumns.some(col => col.name === 'oauth_provider');
  if (!hasOauthProvider) {
    db.exec('ALTER TABLE users ADD COLUMN oauth_provider TEXT;');
  }
} catch (migErr) {
  console.warn('[DB Migration] users columns notice:', migErr.message);
}

const safeExec = (sql) => {
  try { db.exec(sql); } catch (e) { /* ignore duplicate or missing column warnings */ }
};

safeExec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_norm ON users(email_normalized) WHERE email_normalized IS NOT NULL AND email_normalized != "";');
safeExec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_num ON users(phone_number) WHERE phone_number IS NOT NULL AND phone_number != "";');
safeExec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
safeExec('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);');
safeExec('CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);');
safeExec('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;');
safeExec('CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id) WHERE microsoft_id IS NOT NULL;');
safeExec('CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);');
safeExec('CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);');
safeExec('CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);');

// OAuth CSRF State Management Table
safeExec(`
  CREATE TABLE IF NOT EXISTS oauth_states (
    state TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    redirect_url TEXT,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);
safeExec('CREATE INDEX IF NOT EXISTS idx_oauth_states_lookup ON oauth_states(state, provider, expires_at);');

try {
  const otpColumns = db.prepare('PRAGMA table_info(otps)').all();
  if (!otpColumns.some(col => col.name === 'is_dispatched')) {
    db.exec('ALTER TABLE otps ADD COLUMN is_dispatched INTEGER DEFAULT 0;');
  }
} catch {}

/**
 * Generate a guaranteed unique, human-readable User ID
 * Format: AAROH-XXXXXX (e.g. AAROH-581920)
 */
export const generateUniqueUserId = () => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const randomDigits = crypto.randomInt(100000, 1000000).toString();
    const candidateId = `AAROH-${randomDigits}`;

    const existingInUsers = db.prepare('SELECT id FROM users WHERE user_id = ?').get(candidateId);
    const existingInPending = db.prepare('SELECT id FROM pending_signups WHERE unique_user_id = ?').get(candidateId);

    if (!existingInUsers && !existingInPending) {
      return candidateId;
    }
  }
  return `AAROH-${Date.now().toString().slice(-6)}`;
};

// Seed default accounts if empty or missing user_id
const existingCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (existingCount && existingCount.count === 0) {
  const seedSalt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('Password@123', seedSalt);
  const now = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, user_id, full_name, name, email, email_normalized, phone_number, phone, password_hash, role, 
      avatar, email_verified, phone_verified, created_at, updated_at, last_login, password_updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?)
  `);

  insertUser.run(
    'artisan_dulari_devi',
    'ARH-000101',
    'Dulari Devi',
    'Dulari Devi',
    'dulari@aaroh.in',
    'dulari@aaroh.in',
    '+919845011001',
    '+91 98450 11001',
    defaultHash,
    'artisan',
    '/assets/images/hero-artisan.jpg',
    now,
    now,
    now,
    now
  );

  insertUser.run(
    'patron_aditi_narang',
    'ARH-000202',
    'Aditi Narang',
    'Aditi Narang',
    'patron@aaroh.in',
    'patron@aaroh.in',
    '+919845022002',
    '+91 98450 22002',
    defaultHash,
    'customer',
    null,
    now,
    now,
    now,
    now
  );

  const logStmt = db.prepare(`
    INSERT INTO security_logs (user_id, identifier, event, ip_address, user_agent, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  logStmt.run('artisan_dulari_devi', 'dulari@aaroh.in', 'ACCOUNT_SEEDED', '127.0.0.1', 'System Seed', 'Master Artisan seeded with User ID ARH-000101', now);
  logStmt.run('patron_aditi_narang', 'patron@aaroh.in', 'ACCOUNT_SEEDED', '127.0.0.1', 'System Seed', 'Craft Patron seeded with User ID ARH-000202', now);
}

/**
 * Safe initialization of an administrative account via environment variables
 * Triggered on server startup if ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are configured in server/.env
 */
export const initializeAdminFromEnv = () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPass = (process.env.ADMIN_INITIAL_PASSWORD || '').trim();
    const adminName = (process.env.ADMIN_NAME || 'Aaroh System Administrator').trim();
    const adminPhone = (process.env.ADMIN_PHONE || '+919999900000').trim();

    if (!adminEmail || !adminPass) return null;

    const existing = db.prepare('SELECT id, email, role, user_id FROM users WHERE LOWER(email) = LOWER(?)').get(adminEmail);
    const now = new Date().toISOString();

    if (!existing) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(adminPass, salt);
      const userId = `admin_${Date.now()}`;
      const uniqueUserId = generateUniqueUserId();

      db.prepare(`
        INSERT INTO users (
          id, user_id, full_name, name, email, email_normalized, phone_number, phone,
          password_hash, role, email_verified, phone_verified, login_count, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', 1, 1, 0, ?, ?)
      `).run(userId, uniqueUserId, adminName, adminName, adminEmail, adminEmail, adminPhone, adminPhone, hash, now, now);

      db.prepare(`
        INSERT INTO security_logs (user_id, identifier, event, ip_address, user_agent, details, created_at)
        VALUES (?, ?, 'ADMIN_ACCOUNT_INITIALIZED', '127.0.0.1', 'System Environment Boot', 'Initial admin account created from environment config', ?)
      `).run(userId, adminEmail, now);

      console.log(`[Admin Setup] Initial administrator account created: ${adminEmail} (Role: admin, User ID: ${uniqueUserId})`);
      return { created: true, email: adminEmail, userId };
    } else if (existing.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin', email_verified = 1, phone_verified = 1, updated_at = ? WHERE id = ?").run(now, existing.id);
      db.prepare(`
        INSERT INTO security_logs (user_id, identifier, event, ip_address, user_agent, details, created_at)
        VALUES (?, ?, 'ADMIN_ROLE_PROMOTED', '127.0.0.1', 'System Environment Boot', 'Existing account promoted to admin from environment config', ?)
      `).run(existing.id, adminEmail, now);

      console.log(`[Admin Setup] Existing account promoted to administrator: ${adminEmail} (Role: admin)`);
      return { promoted: true, email: adminEmail, userId: existing.id };
    }
    return { existing: true, email: adminEmail, userId: existing.id };
  } catch (err) {
    console.warn('[Admin Setup] Notice:', err.message);
    return null;
  }
};

// Run admin initialization check on module load if environment variables are provided
initializeAdminFromEnv();

// Seed marketplace entities (products, artisans, orders, enquiries, crafts) if empty
seedMarketplaceData();

export default db;
