-- =============================================================================
-- AAROH PAN‑INDIA CRAFT DISCOVERY SCHEMA (SQLite compatible)
-- Non‑destructive tables – use IF NOT EXISTS, preserve existing auth tables.
-- =============================================================================

-- 1. Indian states / union territories
CREATE TABLE IF NOT EXISTS states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  iso_code TEXT UNIQUE
);

-- 2. Districts (belongs to a state)
CREATE TABLE IF NOT EXISTS districts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (state_id, name),
  FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- 3. Cities (belongs to a district)
CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  district_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (district_id, name),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

-- 4. Crafts (linked to a city for regional specificity)
CREATE TABLE IF NOT EXISTS crafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  gi_tag BOOLEAN DEFAULT 0,
  UNIQUE (city_id, name),
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- 5. Artisans (individual creators or communities). city_id may be NULL if location unknown.
CREATE TABLE IF NOT EXISTS artisans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  community TEXT,
  city_id INTEGER,
  bio TEXT,
  profile_image TEXT,
  demo BOOLEAN DEFAULT 0,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
);

-- 6. Products (handicrafts offered for sale). artisan_id optional for demo rows.
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  craft_id INTEGER NOT NULL,
  artisan_id INTEGER,
  name TEXT NOT NULL,
  image_url TEXT,
  price_cents INTEGER,
  currency TEXT DEFAULT 'INR',
  description TEXT,
  demo BOOLEAN DEFAULT 0,
  UNIQUE (craft_id, name, artisan_id),
  FOREIGN KEY (craft_id) REFERENCES crafts(id) ON DELETE CASCADE,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE SET NULL
);

-- 7. Cultural stories for each craft
CREATE TABLE IF NOT EXISTS craft_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  craft_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source_url TEXT,
  UNIQUE (craft_id, title),
  FOREIGN KEY (craft_id) REFERENCES crafts(id) ON DELETE CASCADE
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_crafts_city ON crafts(city_id);
CREATE INDEX IF NOT EXISTS idx_artisans_city ON artisans(city_id);
CREATE INDEX IF NOT EXISTS idx_products_craft ON products(craft_id);
CREATE INDEX IF NOT EXISTS idx_products_artisan ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_craft_stories_craft ON craft_stories(craft_id);
