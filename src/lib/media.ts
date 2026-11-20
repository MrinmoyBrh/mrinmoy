import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb } from './db';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function getAllMedia() {
  const db = getDb();
  return db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all() as any[];
}

export function getMediaById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM media_assets WHERE id = ?').get(id) as any;
}

export async function saveMediaFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  altText = ''
): Promise<{ success: boolean; media?: any; error?: string }> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { success: false, error: 'Invalid file format. Only JPEG, PNG, WEBP, SVG, and GIF images are allowed.' };
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    return { success: false, error: 'File size exceeds maximum allowed limit of 10MB.' };
  }

  const db = getDb();
  const ext = path.extname(originalName) || '.jpg';
  const cleanBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${Date.now()}_${cleanBase}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);
  const publicUrl = `/uploads/${uniqueName}`;

  try {
    fs.writeFileSync(filePath, buffer);

    const id = crypto.randomUUID();
    const insert = db.prepare(`
      INSERT INTO media_assets (id, original_name, filename, file_path, mime_type, size_bytes, alt_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(id, originalName, uniqueName, publicUrl, mimeType, buffer.length, altText || originalName, Date.now());

    return {
      success: true,
      media: {
        id,
        original_name: originalName,
        filename: uniqueName,
        file_path: publicUrl,
        mime_type: mimeType,
        size_bytes: buffer.length,
        alt_text: altText || originalName,
        created_at: Date.now(),
      },
    };
  } catch (err: any) {
    console.error('File write error:', err);
    return { success: false, error: 'Failed to write media asset to disk.' };
  }
}

export function deleteMedia(id: string): boolean {
  const db = getDb();
  const media = getMediaById(id);
  if (!media) return false;

  const diskPath = path.join(UPLOAD_DIR, media.filename);
  if (fs.existsSync(diskPath)) {
    try {
      fs.unlinkSync(diskPath);
    } catch (e) {
      console.warn('Could not remove file from disk:', e);
    }
  }

  db.prepare('DELETE FROM media_assets WHERE id = ?').run(id);
  return true;
}

export function updateMediaAlt(id: string, altText: string) {
  const db = getDb();
  db.prepare('UPDATE media_assets SET alt_text = ? WHERE id = ?').run(altText, id);
}
