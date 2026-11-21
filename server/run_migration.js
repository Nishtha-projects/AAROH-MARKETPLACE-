// Clean migration runner for AAROH
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import db from './database/db.js';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration applied successfully.');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}

import path from 'node:path';
import fs from 'node:fs';
import db from './database/db.js';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration applied successfully.');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}

import path from 'node:path';
import fs from 'node:fs';
import db from './database/db.js';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration applied successfully.');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}
// Clean migration runner for AAROH
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import db from './database/db.js';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration applied successfully.');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}

import path from 'node:path';
import fs from 'node:fs';
import db from './database/db.js';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration applied successfully.');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}

import path from 'node:path';
import fs from 'node:fs';
import db from './database/db.js';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration applied successfully.');
} catch (e) {
  console.error('❌ Migration error:', e.message);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from 'node:fs';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');
try {
  db.exec(sql);
  console.log('Migration applied successfully.');
} catch (e) {
  console.error('Migration error:', e.message);
}
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(__dirname, 'migrations', '01_craft_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');
try {
  db.exec(sql);
  console.log('Migration applied successfully.');
} catch (e) {
  console.error('Migration error:', e.message);
}
