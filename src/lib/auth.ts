import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import type { AstroCookies } from 'astro';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  created_at: number;
  last_login_at: number | null;
}

const SESSION_COOKIE_NAME = 'mb_cms_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function getAdminUserCount(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  return row ? row.count : 0;
}

export function isRateLimited(ip: string): boolean {
  const db = getDb();
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  const countRow = db.prepare(`
    SELECT COUNT(*) as count FROM login_attempts
    WHERE ip_address = ? AND attempted_at > ? AND success = 0
  `).get(ip, cutoff) as { count: number };

  return (countRow?.count || 0) >= MAX_FAILED_ATTEMPTS;
}

export function recordLoginAttempt(ip: string, success: boolean) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO login_attempts (id, ip_address, attempted_at, success)
    VALUES (?, ?, ?, ?)
  `);
  insert.run(crypto.randomUUID(), ip, Date.now(), success ? 1 : 0);
}

export async function createAdminUser(username: string, email: string, plainPassword: string, name: string): Promise<AdminUser> {
  const db = getDb();
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(plainPassword);
  const now = Date.now();

  const insert = db.prepare(`
    INSERT INTO admin_users (id, username, email, password_hash, name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'admin', ?, ?)
  `);

  insert.run(id, username.trim().toLowerCase(), email.trim().toLowerCase(), passwordHash, name.trim(), now, now);

  return {
    id,
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: 'admin',
    created_at: now,
    last_login_at: null,
  };
}

export async function authenticateAdmin(
  identifier: string,
  plainPassword: string,
  ip: string
): Promise<{ user?: AdminUser; error?: string }> {
  const db = getDb();

  if (isRateLimited(ip)) {
    return { error: 'Too many failed login attempts. Account temporarily locked for 15 minutes.' };
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const row = db.prepare(`
    SELECT * FROM admin_users
    WHERE username = ? OR email = ?
  `).get(cleanIdent, cleanIdent) as any;

  if (!row) {
    recordLoginAttempt(ip, false);
    return { error: 'Invalid username/email or password.' };
  }

  const isValid = await verifyPassword(plainPassword, row.password_hash);
  if (!isValid) {
    recordLoginAttempt(ip, false);
    return { error: 'Invalid username/email or password.' };
  }

  // Record success and update last login
  recordLoginAttempt(ip, true);
  const now = Date.now();
  db.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').run(now, row.id);

  return {
    user: {
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
      last_login_at: now,
    },
  };
}

export function createSession(userId: string, cookies: AstroCookies, userAgent?: string, ip?: string): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const insert = db.prepare(`
    INSERT INTO sessions (id, token_hash, user_id, created_at, expires_at, user_agent, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(sessionId, tokenHash, userId, now, expiresAt, userAgent || null, ip || null);

  cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return token;
}

export function destroySession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const db = getDb();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
  }

  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });
}

export function getSessionUser(cookies: AstroCookies): AdminUser | null {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const db = getDb();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = Date.now();

  const row = db.prepare(`
    SELECT s.id as session_id, s.expires_at, u.id, u.username, u.email, u.name, u.role, u.created_at, u.last_login_at
    FROM sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(tokenHash, now) as any;

  if (!row) {
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.name,
    role: row.role,
    created_at: row.created_at,
    last_login_at: row.last_login_at,
  };
}
