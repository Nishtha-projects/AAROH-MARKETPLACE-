import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve('server/database/aaroh.sqlite');
console.log('1. EXACT DATABASE PATH:', dbPath);
console.log('   Exists on disk:', fs.existsSync(dbPath));
if (fs.existsSync(dbPath)) {
  const stat = fs.statSync(dbPath);
  console.log('   Size:', (stat.size / 1024).toFixed(2), 'KB');
  console.log('   Last Modified:', stat.mtime.toISOString());
}

const db = new DatabaseSync(dbPath);

console.log('\n2. TABLES IN DATABASE:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.table(tables);

console.log('\n3. USERS TABLE SCHEMA (PRAGMA table_info):');
const userColumns = db.prepare("PRAGMA table_info(users)").all();
console.table(userColumns.map(c => ({
  cid: c.cid,
  column_name: c.name,
  data_type: c.type,
  not_null: c.notnull === 1 ? 'YES' : 'NO',
  default_value: c.dflt_value,
  is_primary_key: c.pk === 1 ? 'YES' : 'NO'
})));

console.log('\n4. USER COUNT & VERIFICATION STATUSES:');
const counts = db.prepare(`
  SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as email_verified_count,
    SUM(CASE WHEN phone_verified = 1 THEN 1 ELSE 0 END) as phone_verified_count,
    SUM(CASE WHEN email_verified = 1 AND phone_verified = 1 THEN 1 ELSE 0 END) as dual_verified_count,
    SUM(CASE WHEN (login_count > 0 OR last_login_at IS NOT NULL OR last_login IS NOT NULL) THEN 1 ELSE 0 END) as has_logged_in_count,
    SUM(CASE WHEN (login_count IS NULL OR login_count = 0) AND last_login_at IS NULL AND last_login IS NULL THEN 1 ELSE 0 END) as never_logged_in_count
  FROM users
`).get();
console.table([counts]);

console.log('\n5. REGISTERED USERS (SAFE - NO SECRETS/PASSWORDS/HASHES):');
const userList = db.prepare(`
  SELECT 
    user_id,
    name,
    email,
    phone_number,
    role,
    CASE WHEN email_verified = 1 THEN 'Verified' ELSE 'Pending' END as email_status,
    CASE WHEN phone_verified = 1 THEN 'Verified' ELSE 'Pending' END as phone_status,
    COALESCE(login_count, 0) as login_count,
    COALESCE(last_login_at, last_login, 'Never') as last_login,
    'Password protected' as password_status,
    created_at
  FROM users
  ORDER BY created_at DESC
`).all();
console.table(userList);

console.log('\n6. LOGIN & ACTIVITY TRACKING TABLES:');
const secLogCols = db.prepare("PRAGMA table_info(security_logs)").all();
console.log('   security_logs columns:', secLogCols.map(c => c.name).join(', '));

const eventSummary = db.prepare(`
  SELECT event, COUNT(*) as count, MAX(created_at) as latest_timestamp
  FROM security_logs
  GROUP BY event
  ORDER BY count DESC
`).all();
console.table(eventSummary);
