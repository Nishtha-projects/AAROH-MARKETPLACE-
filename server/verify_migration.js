import db from './database/db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to migration SQL (will be used when script is run)
const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

// Apply migration (safe: will use IF NOT EXISTS)
try {
  db.exec(sql);
  console.log('✅ Migration applied successfully');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log('📋 Tables in DB:', tables.join(', '));

const required = ['states','districts','cities','crafts','artisans','products','craft_stories'];
const missing = required.filter(t => !tables.includes(t));
if (missing.length === 0) {
  console.log('✅ All required tables exist');
} else {
  console.log('❌ Missing tables:', missing.join(', '));
}

// Foreign key check
const fkIssues = db.prepare('PRAGMA foreign_key_check').all();
if (fkIssues.length === 0) {
  console.log('✅ No foreign key violations');
} else {
  console.log('⚠️ Foreign key issues:', fkIssues);
}

// Show actual DB file path used by db.js
const dbPath = db.path || (function(){
  // db.js does not expose path directly; we recreate the same logic
  const dir = __dirname;
  return path.join(dir, 'database', 'aaroh.sqlite');
})();
console.log('🗄️ SQLite DB path:', dbPath);
