import crypto from 'node:crypto';
import { getDb } from './db';
import { runInitialSeed } from './seed';

// Ensure seed runs on module load
try {
  runInitialSeed();
} catch (e) {
  console.error('Error running initial seed:', e);
}

// Activity logger helper
export function logActivity(userId: string | null, action: string, entityType: string, entityId: string | null, description: string) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(crypto.randomUUID(), userId || 'system', action, entityType, entityId || null, description, Date.now());
}

// ==========================================
// 1. HERO CONTENT
// ==========================================
export function getHeroContent(publishedOnly = true) {
  const db = getDb();
  if (!publishedOnly) {
    const draft = getDraft('hero');
    if (draft) return draft;
  }
  const row = db.prepare('SELECT * FROM hero_content ORDER BY updated_at DESC LIMIT 1').get() as any;
  return row || null;
}

export function saveHeroDraft(data: any, userId: string) {
  saveDraft('hero', data);
  logActivity(userId, 'UPDATE_DRAFT', 'hero', 'hero_default', 'Saved hero draft configuration');
}

export function publishHero(userId: string) {
  const db = getDb();
  const draft = getDraft('hero');
  const target = draft || getHeroContent(true);
  if (!target) return;

  const now = Date.now();
  const update = db.prepare(`
    UPDATE hero_content SET
      name = ?, role_badge = ?, education_badge = ?, college_badge = ?,
      headline_line1 = ?, headline_highlight = ?, headline_gradient = ?,
      description = ?, description_html = ?,
      cta_primary_label = ?, cta_primary_url = ?,
      cta_secondary_label = ?, cta_secondary_url = ?,
      cta_terminal_label = ?, cta_terminal_url = ?,
      orbital_radar_top_left = ?, orbital_radar_top_right = ?,
      orbital_radar_bottom_left = ?, orbital_radar_bottom_right = ?,
      orbital_status_title = ?, orbital_status_reliability = ?, orbital_core_label = ?,
      is_published = 1, updated_at = ?
    WHERE id = 'hero_default'
  `);

  update.run(
    target.name, target.role_badge, target.education_badge, target.college_badge,
    target.headline_line1, target.headline_highlight, target.headline_gradient,
    target.description, target.description_html || target.description,
    target.cta_primary_label, target.cta_primary_url,
    target.cta_secondary_label, target.cta_secondary_url,
    target.cta_terminal_label, target.cta_terminal_url,
    target.orbital_radar_top_left, target.orbital_radar_top_right,
    target.orbital_radar_bottom_left, target.orbital_radar_bottom_right,
    target.orbital_status_title, target.orbital_status_reliability, target.orbital_core_label,
    now
  );

  createRevision('hero', 'hero_default', target, userId, 'Published updated Hero Section');
  deleteDraft('hero');
  logActivity(userId, 'PUBLISH', 'hero', 'hero_default', 'Published live Hero Section');
}

// ==========================================
// 2. PROJECTS CRUD & ORDERING
// ==========================================
export function getProjects(placement = 'all', publishedOnly = false) {
  const db = getDb();
  let query = 'SELECT * FROM projects';
  const params: any[] = [];

  const conditions: string[] = [];
  if (placement !== 'all') {
    conditions.push('placement = ?');
    params.push(placement);
  }
  if (publishedOnly) {
    conditions.push('is_published = 1');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY display_order ASC, created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(formatProject);
}

export function getProjectBySlug(slug: string, publishedOnly = false) {
  const db = getDb();
  let query = 'SELECT * FROM projects WHERE slug = ?';
  if (publishedOnly) {
    query += ' AND is_published = 1';
  }
  const row = db.prepare(query).get(slug) as any;
  return row ? formatProject(row) : null;
}

export function getProjectById(id: string) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  return row ? formatProject(row) : null;
}

function formatProject(row: any) {
  return {
    ...row,
    featured: Boolean(row.featured),
    is_published: Boolean(row.is_published),
    badges: safeJson(row.badges, []),
    architecture_steps: safeJson(row.architecture_steps, []),
    technical_highlights: safeJson(row.technical_highlights, []),
    verified_claims: safeJson(row.verified_claims, []),
    stack: safeJson(row.stack, { runtime: [], dataStores: [], messaging: [], protocols: [], tooling: [] }),
    key_features: safeJson(row.key_features, []),
    // Compatibility fields for existing public views
    architectureSteps: safeJson(row.architecture_steps, []),
    technicalHighlights: safeJson(row.technical_highlights, []),
    verifiedClaims: safeJson(row.verified_claims, []),
    keyFeatures: safeJson(row.key_features, []),
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    architectureNarrative: row.architecture_narrative,
  };
}

export function saveProject(p: any, userId: string) {
  const db = getDb();
  const existing = p.id ? getProjectById(p.id) : null;
  const now = Date.now();
  const id = p.id || crypto.randomUUID();

  const badges = JSON.stringify(Array.isArray(p.badges) ? p.badges : (p.badges ? p.badges.split(',').map((s: string) => s.trim()) : []));
  const archSteps = JSON.stringify(p.architecture_steps || p.architectureSteps || []);
  const highlights = JSON.stringify(p.technical_highlights || p.technicalHighlights || []);
  const claims = JSON.stringify(p.verified_claims || p.verifiedClaims || []);
  const stack = JSON.stringify(p.stack || { runtime: [], dataStores: [], messaging: [], protocols: [], tooling: [] });
  const keyFeat = JSON.stringify(p.key_features || p.keyFeatures || []);

  if (existing) {
    const update = db.prepare(`
      UPDATE projects SET
        slug = ?, title = ?, tagline = ?, category = ?, role = ?, organization = ?,
        period = ?, placement = ?, featured = ?, display_order = ?, github_url = ?, live_url = ?,
        badges = ?, summary = ?, challenge = ?, architecture_narrative = ?,
        architecture_steps = ?, technical_highlights = ?, verified_claims = ?, stack = ?, key_features = ?,
        cover_image = ?, is_published = ?, updated_at = ?
      WHERE id = ?
    `);

    update.run(
      p.slug, p.title, p.tagline, p.category, p.role, p.organization || null,
      p.period, p.placement || 'showcase', p.featured ? 1 : 0, p.display_order ?? existing.display_order,
      p.github_url || p.githubUrl || null, p.live_url || p.liveUrl || null,
      badges, p.summary, p.challenge, p.architecture_narrative || p.architectureNarrative || '',
      archSteps, highlights, claims, stack, keyFeat,
      p.cover_image || null, p.is_published !== undefined ? (p.is_published ? 1 : 0) : 1, now,
      id
    );

    logActivity(userId, 'UPDATE', 'project', id, `Updated project "${p.title}"`);
  } else {
    // Get max display order
    const maxOrderRow = db.prepare('SELECT MAX(display_order) as m FROM projects').get() as any;
    const nextOrder = (maxOrderRow?.m || 0) + 1;

    const insert = db.prepare(`
      INSERT INTO projects (
        id, slug, title, tagline, category, role, organization,
        period, placement, featured, display_order, github_url, live_url,
        badges, summary, challenge, architecture_narrative,
        architecture_steps, technical_highlights, verified_claims, stack, key_features,
        cover_image, is_published, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    insert.run(
      id, p.slug, p.title, p.tagline, p.category, p.role, p.organization || null,
      p.period, p.placement || 'showcase', p.featured ? 1 : 0, nextOrder,
      p.github_url || p.githubUrl || null, p.live_url || p.liveUrl || null,
      badges, p.summary, p.challenge, p.architecture_narrative || p.architectureNarrative || '',
      archSteps, highlights, claims, stack, keyFeat,
      p.cover_image || null, p.is_published !== undefined ? (p.is_published ? 1 : 0) : 1, now, now
    );

    logActivity(userId, 'CREATE', 'project', id, `Created new project "${p.title}"`);
  }

  createRevision('project', id, p, userId, `Saved project "${p.title}"`);
  return id;
}

export function deleteProject(id: string, userId: string) {
  const db = getDb();
  const existing = getProjectById(id);
  if (!existing) return;

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  logActivity(userId, 'DELETE', 'project', id, `Deleted project "${existing.title}"`);
}

export function reorderProjects(orderedIds: string[], userId: string) {
  const db = getDb();
  const stmt = db.prepare('UPDATE projects SET display_order = ? WHERE id = ?');
  orderedIds.forEach((id, idx) => {
    stmt.run(idx, id);
  });
  logActivity(userId, 'REORDER', 'projects', null, 'Reordered portfolio projects');
}

// ==========================================
// 3. SKILLS & ARCHITECTURE
// ==========================================
export function getSkillCategories() {
  const db = getDb();
  return db.prepare('SELECT * FROM skill_categories ORDER BY display_order ASC').all() as any[];
}

export function getSkills() {
  const db = getDb();
  return db.prepare('SELECT * FROM skills ORDER BY category_id, display_order ASC').all() as any[];
}

export function getFullSkillsMatrix() {
  const categories = getSkillCategories();
  const skills = getSkills();

  return categories.map((cat) => ({
    ...cat,
    skills: skills.filter((s) => s.category_id === cat.id),
  }));
}

export function saveSkill(s: any, userId: string) {
  const db = getDb();
  const id = s.id || crypto.randomUUID();
  const existing = db.prepare('SELECT id FROM skills WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE skills SET
        category_id = ?, name = ?, proficiency = ?, is_highlighted = ?, display_order = ?
      WHERE id = ?
    `).run(s.category_id, s.name, s.proficiency || 'Practiced', s.is_highlighted ? 1 : 0, s.display_order || 0, id);
    logActivity(userId, 'UPDATE', 'skill', id, `Updated skill "${s.name}"`);
  } else {
    db.prepare(`
      INSERT INTO skills (id, category_id, name, proficiency, is_highlighted, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, s.category_id, s.name, s.proficiency || 'Practiced', s.is_highlighted ? 1 : 0, s.display_order || 0);
    logActivity(userId, 'CREATE', 'skill', id, `Added skill "${s.name}"`);
  }
}

export function deleteSkill(id: string, userId: string) {
  const db = getDb();
  const s = db.prepare('SELECT name FROM skills WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM skills WHERE id = ?').run(id);
  logActivity(userId, 'DELETE', 'skill', id, `Deleted skill "${s?.name || id}"`);
}

// ==========================================
// 4. EXPERIENCES & EDUCATION
// ==========================================
export function getExperiences(publishedOnly = false) {
  const db = getDb();
  let query = 'SELECT * FROM experiences';
  if (publishedOnly) query += ' WHERE is_published = 1';
  query += ' ORDER BY display_order ASC';

  const rows = db.prepare(query).all() as any[];
  return rows.map((r) => ({
    ...r,
    responsibilities: safeJson(r.responsibilities, []),
    technologies: safeJson(r.technologies, []),
  }));
}

export function saveExperience(exp: any, userId: string) {
  const db = getDb();
  const id = exp.id || crypto.randomUUID();
  const now = Date.now();
  const existing = db.prepare('SELECT id FROM experiences WHERE id = ?').get(id);

  const resp = JSON.stringify(Array.isArray(exp.responsibilities) ? exp.responsibilities : []);
  const tech = JSON.stringify(Array.isArray(exp.technologies) ? exp.technologies : []);

  if (existing) {
    db.prepare(`
      UPDATE experiences SET
        role = ?, company = ?, location = ?, period = ?, type = ?, status = ?,
        description = ?, responsibilities = ?, technologies = ?, display_order = ?, updated_at = ?
      WHERE id = ?
    `).run(
      exp.role, exp.company, exp.location, exp.period, exp.type || 'Work Experience', exp.status || 'Completed',
      exp.description, resp, tech, exp.display_order || 0, now, id
    );
    logActivity(userId, 'UPDATE', 'experience', id, `Updated experience at "${exp.company}"`);
  } else {
    db.prepare(`
      INSERT INTO experiences (
        id, role, company, location, period, type, status,
        description, responsibilities, technologies, display_order, is_published, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id, exp.role, exp.company, exp.location, exp.period, exp.type || 'Work Experience', exp.status || 'Completed',
      exp.description, resp, tech, exp.display_order || 0, now
    );
    logActivity(userId, 'CREATE', 'experience', id, `Added experience at "${exp.company}"`);
  }
}

export function deleteExperience(id: string, userId: string) {
  const db = getDb();
  db.prepare('DELETE FROM experiences WHERE id = ?').run(id);
  logActivity(userId, 'DELETE', 'experience', id, 'Deleted experience entry');
}

export function getEducation() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM education ORDER BY display_order ASC').all() as any[];
  return rows.map((r) => ({
    ...r,
    details: safeJson(r.details, []),
  }));
}

export function saveEducation(edu: any, userId: string) {
  const db = getDb();
  const id = edu.id || crypto.randomUUID();
  const now = Date.now();
  const existing = db.prepare('SELECT id FROM education WHERE id = ?').get(id);
  const details = JSON.stringify(Array.isArray(edu.details) ? edu.details : []);

  if (existing) {
    db.prepare(`
      UPDATE education SET
        degree = ?, field = ?, institution = ?, location = ?, period = ?,
        status = ?, details = ?, display_order = ?, updated_at = ?
      WHERE id = ?
    `).run(edu.degree, edu.field, edu.institution, edu.location, edu.period, edu.status, details, edu.display_order || 0, now, id);
  } else {
    db.prepare(`
      INSERT INTO education (id, degree, field, institution, location, period, status, details, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, edu.degree, edu.field, edu.institution, edu.location, edu.period, edu.status, details, edu.display_order || 0, now);
  }
  logActivity(userId, 'UPDATE', 'education', id, `Updated education "${edu.institution}"`);
}

// ==========================================
// 5. PRINCIPLES
// ==========================================
export function getPrinciples() {
  const db = getDb();
  return db.prepare('SELECT * FROM principles ORDER BY display_order ASC').all() as any[];
}

export function savePrinciple(p: any, userId: string) {
  const db = getDb();
  db.prepare(`
    UPDATE principles SET
      title = ?, summary = ?, narrative = ?, implementation = ?
    WHERE id = ?
  `).run(p.title, p.summary, p.narrative, p.implementation, p.id);
  logActivity(userId, 'UPDATE', 'principle', p.id, `Updated Principle "${p.title}"`);
}

// ==========================================
// 6. MODULE CONFIGS (SIMULATION, TERMINAL, CONTACT, FOOTER)
// ==========================================
export function getModuleConfig(key: string) {
  const db = getDb();
  const row = db.prepare('SELECT data FROM module_configs WHERE module_key = ?').get(key) as any;
  return row ? safeJson(row.data, null) : null;
}

export function saveModuleConfig(key: string, data: any, userId: string) {
  const db = getDb();
  const jsonStr = JSON.stringify(data);
  const now = Date.now();
  db.prepare(`
    INSERT INTO module_configs (id, module_key, data, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(module_key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(`mod_${key}`, key, jsonStr, now);

  logActivity(userId, 'UPDATE', 'module_config', key, `Updated ${key} presentation module`);
}

// ==========================================
// 7. APPEARANCE SETTINGS & CLOUD ANIMATION
// ==========================================
export function getAppearanceSettings(publishedOnly = true) {
  const db = getDb();
  if (!publishedOnly) {
    const draft = getDraft('appearance');
    if (draft) return draft;
  }
  const row = db.prepare('SELECT data FROM appearance_settings WHERE id = "app_default"').get() as any;
  return row ? safeJson(row.data, {}) : {};
}

export function saveAppearanceDraft(data: any, userId: string) {
  saveDraft('appearance', data);
  logActivity(userId, 'UPDATE_DRAFT', 'appearance', 'app_default', 'Saved appearance draft settings');
}

export function publishAppearance(userId: string) {
  const db = getDb();
  const draft = getDraft('appearance');
  const target = draft || getAppearanceSettings(true);

  db.prepare(`
    UPDATE appearance_settings SET data = ?, updated_at = ? WHERE id = 'app_default'
  `).run(JSON.stringify(target), Date.now());

  createRevision('appearance', 'app_default', target, userId, 'Published visual appearance & cloud parameters');
  deleteDraft('appearance');
  logActivity(userId, 'PUBLISH', 'appearance', 'app_default', 'Published live appearance settings');
}

// ==========================================
// 8. SEO SETTINGS
// ==========================================
export function getSeoSettings() {
  const db = getDb();
  const row = db.prepare('SELECT * FROM seo_settings WHERE id = "seo_default"').get() as any;
  return row || {};
}

export function saveSeoSettings(data: any, userId: string) {
  const db = getDb();
  db.prepare(`
    UPDATE seo_settings SET
      site_title = ?, site_description = ?, canonical_url = ?,
      og_title = ?, og_description = ?, og_image = ?,
      twitter_card = ?, robots_directives = ?, updated_at = ?
    WHERE id = 'seo_default'
  `).run(
    data.site_title, data.site_description, data.canonical_url,
    data.og_title, data.og_description, data.og_image || null,
    data.twitter_card || 'summary_large_image', data.robots_directives || 'index, follow',
    Date.now()
  );
  logActivity(userId, 'UPDATE', 'seo', 'seo_default', 'Updated site SEO settings');
}

// ==========================================
// 9. DRAFTS & REVISIONS (ROLLBACK ENGINE)
// ==========================================
export function getDraft(key: string) {
  const db = getDb();
  const row = db.prepare('SELECT data FROM draft_store WHERE key = ?').get(key) as any;
  return row ? safeJson(row.data, null) : null;
}

export function saveDraft(key: string, data: any) {
  const db = getDb();
  db.prepare(`
    INSERT INTO draft_store (key, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(key, JSON.stringify(data), Date.now());
}

export function deleteDraft(key: string) {
  const db = getDb();
  db.prepare('DELETE FROM draft_store WHERE key = ?').run(key);
}

export function getAllDrafts() {
  const db = getDb();
  return db.prepare('SELECT key, updated_at FROM draft_store ORDER BY updated_at DESC').all() as any[];
}

export function createRevision(entityType: string, entityId: string, data: any, userId: string, summary: string) {
  const db = getDb();
  db.prepare(`
    INSERT INTO revisions (id, entity_type, entity_id, data_snapshot, published_by, published_at, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), entityType, entityId, JSON.stringify(data), userId, Date.now(), summary);
}

export function getRevisions(entityType?: string, limit = 20) {
  const db = getDb();
  let query = 'SELECT * FROM revisions';
  const params: any[] = [];
  if (entityType) {
    query += ' WHERE entity_type = ?';
    params.push(entityType);
  }
  query += ' ORDER BY published_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    data_snapshot: safeJson(r.data_snapshot, {}),
  }));
}

export function restoreRevision(revisionId: string, userId: string): boolean {
  const db = getDb();
  const row = db.prepare('SELECT * FROM revisions WHERE id = ?').get(revisionId) as any;
  if (!row) return false;

  const data = safeJson(row.data_snapshot, null);
  if (!data) return false;

  if (row.entity_type === 'hero') {
    saveHeroDraft(data, userId);
    publishHero(userId);
  } else if (row.entity_type === 'project') {
    saveProject(data, userId);
  } else if (row.entity_type === 'appearance') {
    saveAppearanceDraft(data, userId);
    publishAppearance(userId);
  }

  logActivity(userId, 'ROLLBACK', row.entity_type, row.entity_id, `Restored revision from ${new Date(row.published_at).toLocaleString()}`);
  return true;
}

// ==========================================
// 10. DASHBOARD STATS & RECENT ACTIVITY
// ==========================================
export function getDashboardStats() {
  const db = getDb();

  const totalProjects = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as any)?.count || 0;
  const publishedProjects = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE is_published = 1').get() as any)?.count || 0;
  const showcaseProjects = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE placement = "showcase"').get() as any)?.count || 0;
  const additionalProjects = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE placement = "additional"').get() as any)?.count || 0;
  const totalSkills = (db.prepare('SELECT COUNT(*) as count FROM skills').get() as any)?.count || 0;
  const pendingDrafts = (db.prepare('SELECT COUNT(*) as count FROM draft_store').get() as any)?.count || 0;

  const lastPubRow = db.prepare('SELECT published_at FROM revisions ORDER BY published_at DESC LIMIT 1').get() as any;
  const lastPublishedAt = lastPubRow ? lastPubRow.published_at : Date.now();

  // Activity distribution for Fintrixity Chart (last 7 days activity)
  const oneDay = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const activityDays: { day: string; count: number; date: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i * oneDay);
    const dayEnd = dayStart + oneDay;
    const dateObj = new Date(dayStart);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const countRow = db.prepare(`
      SELECT COUNT(*) as c FROM activity_logs WHERE created_at >= ? AND created_at < ?
    `).get(dayStart, dayEnd) as any;

    activityDays.push({
      day: dayName,
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: (countRow?.c || 0) + (i === 0 ? 3 : 0), // Base activity
    });
  }

  const recentActivities = db.prepare(`
    SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10
  `).all() as any[];

  return {
    totalProjects,
    publishedProjects,
    showcaseProjects,
    additionalProjects,
    totalSkills,
    pendingDrafts,
    lastPublishedAt,
    activityDays,
    recentActivities,
  };
}

// Utility JSON parser
function safeJson(val: any, fallback: any) {
  if (typeof val !== 'string') return val ?? fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
