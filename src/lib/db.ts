import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DATA_DIR, 'portfolio.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Global database instance
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    // Performance and integrity pragmas
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // 1. Admin Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_login_at INTEGER
    );
  `);

  // 2. Active Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      FOREIGN KEY (user_id) REFERENCES admin_users (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);

  // 3. Login Rate Limiting
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id TEXT PRIMARY KEY,
      ip_address TEXT NOT NULL,
      attempted_at INTEGER NOT NULL,
      success INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempted_at);
  `);

  // 4. Hero Content (Draft & Published)
  db.exec(`
    CREATE TABLE IF NOT EXISTS hero_content (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role_badge TEXT NOT NULL,
      education_badge TEXT NOT NULL,
      college_badge TEXT NOT NULL,
      headline_line1 TEXT NOT NULL,
      headline_highlight TEXT NOT NULL,
      headline_gradient TEXT NOT NULL,
      description TEXT NOT NULL,
      description_html TEXT,
      cta_primary_label TEXT NOT NULL,
      cta_primary_url TEXT NOT NULL,
      cta_secondary_label TEXT NOT NULL,
      cta_secondary_url TEXT NOT NULL,
      cta_terminal_label TEXT NOT NULL,
      cta_terminal_url TEXT NOT NULL,
      orbital_radar_top_left TEXT,
      orbital_radar_top_right TEXT,
      orbital_radar_bottom_left TEXT,
      orbital_radar_bottom_right TEXT,
      orbital_status_title TEXT,
      orbital_status_reliability TEXT,
      orbital_core_label TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);

  // 5. Projects
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      category TEXT NOT NULL,
      role TEXT NOT NULL,
      organization TEXT,
      period TEXT NOT NULL,
      placement TEXT NOT NULL DEFAULT 'showcase', -- 'showcase', 'additional', 'archived'
      featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      github_url TEXT,
      live_url TEXT,
      badges TEXT NOT NULL, -- JSON array
      summary TEXT NOT NULL,
      challenge TEXT NOT NULL,
      architecture_narrative TEXT NOT NULL,
      architecture_steps TEXT NOT NULL, -- JSON array
      technical_highlights TEXT NOT NULL, -- JSON array
      verified_claims TEXT NOT NULL, -- JSON array
      stack TEXT NOT NULL, -- JSON object
      key_features TEXT, -- JSON array
      cover_image TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_placement ON projects(placement, display_order);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
  `);

  // 6. Skills & Skill Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      proficiency TEXT NOT NULL DEFAULT 'Practiced', -- 'Basic', 'Familiar', 'Practiced', 'Advanced'
      is_highlighted INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES skill_categories (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id, display_order);
  `);

  // 7. Experience
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      period TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Internship',
      status TEXT NOT NULL DEFAULT 'Completed',
      description TEXT NOT NULL,
      responsibilities TEXT NOT NULL, -- JSON array
      technologies TEXT NOT NULL, -- JSON array
      display_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL
    );
  `);

  // 8. Education
  db.exec(`
    CREATE TABLE IF NOT EXISTS education (
      id TEXT PRIMARY KEY,
      degree TEXT NOT NULL,
      field TEXT NOT NULL,
      institution TEXT NOT NULL,
      location TEXT NOT NULL,
      period TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT NOT NULL, -- JSON array
      display_order INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);

  // 9. Engineering Principles
  db.exec(`
    CREATE TABLE IF NOT EXISTS principles (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      narrative TEXT NOT NULL,
      implementation TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1
    );
  `);

  // 10. Navigation Links
  db.exec(`
    CREATE TABLE IF NOT EXISTS navigation_items (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      is_cta INTEGER NOT NULL DEFAULT 0
    );
  `);

  // 11. Interactive Modules (Simulation & Terminal)
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_configs (
      id TEXT PRIMARY KEY,
      module_key TEXT UNIQUE NOT NULL, -- 'simulation', 'terminal', 'contact', 'footer'
      data TEXT NOT NULL, -- JSON object
      updated_at INTEGER NOT NULL
    );
  `);

  // 12. Appearance & Design Tokens
  db.exec(`
    CREATE TABLE IF NOT EXISTS appearance_settings (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL, -- JSON object: colors, cloud animation params, typography
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL
    );
  `);

  // 13. SEO & Site Metadata
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id TEXT PRIMARY KEY,
      site_title TEXT NOT NULL,
      site_description TEXT NOT NULL,
      canonical_url TEXT NOT NULL,
      og_title TEXT NOT NULL,
      og_description TEXT NOT NULL,
      og_image TEXT,
      twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
      robots_directives TEXT NOT NULL DEFAULT 'index, follow',
      updated_at INTEGER NOT NULL
    );
  `);

  // 14. Media Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      file_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // 15. Activity Audit Log
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
  `);

  // 16. Published Revisions / Rollback History
  db.exec(`
    CREATE TABLE IF NOT EXISTS revisions (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      data_snapshot TEXT NOT NULL, -- JSON snapshot of state
      published_by TEXT NOT NULL,
      published_at INTEGER NOT NULL,
      summary TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_revisions_entity ON revisions(entity_type, entity_id);
  `);

  // 17. Draft Store (Key-Value JSON store for staging edits before publish)
  db.exec(`
    CREATE TABLE IF NOT EXISTS draft_store (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}
