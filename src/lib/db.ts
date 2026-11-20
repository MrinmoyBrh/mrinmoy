import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';

export interface PreparedStatement {
  all(...params: any[]): Promise<any[]>;
  get(...params: any[]): Promise<any>;
  run(...params: any[]): Promise<{ changes: number }>;
}

export interface DatabaseClient {
  prepare(sql: string): PreparedStatement;
  exec(sql: string): Promise<void>;
  isPostgres: boolean;
}

// Convert SQLite '?' parameter placeholders to PostgreSQL '$1, $2, ...'
function toPgSql(sql: string): string {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
}

// Parse PostgreSQL INT8 / BIGINT as JavaScript numbers (matching SQLite behavior)
pg.types.setTypeParser(20, (val: string | null) => (val === null ? null : parseInt(val, 10)));

let globalClient: DatabaseClient | null = null;
let pgPoolInstance: pg.Pool | null = null;

function resolveDatabaseUrl(): string | null {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, '');
  }

  // Fallback to reading .env.local if running outside Astro Vite runner
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    try {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const match = content.match(/^DATABASE_URL=(.+)$/m);
      if (match && match[1]) {
        const url = match[1].trim().replace(/^["']|["']$/g, '');
        if (url) return url;
      }
    } catch {}
  }

  return null;
}

export function getDb(): DatabaseClient {
  if (globalClient) {
    return globalClient;
  }

  const databaseUrl = resolveDatabaseUrl();

  if (databaseUrl) {
    if (!pgPoolInstance) {
      pgPoolInstance = new pg.Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      pgPoolInstance.on('error', (err) => {
        console.error('[Neon Postgres] Unexpected client pool error:', err);
      });
    }

    const pool = pgPoolInstance;

    globalClient = {
      isPostgres: true,
      prepare(sql: string): PreparedStatement {
        const pgSql = toPgSql(sql);
        return {
          async all(...params: any[]) {
            const res = await pool.query(pgSql, params);
            return res.rows;
          },
          async get(...params: any[]) {
            const res = await pool.query(pgSql, params);
            return res.rows[0] || null;
          },
          async run(...params: any[]) {
            const res = await pool.query(pgSql, params);
            return { changes: res.rowCount ?? 0 };
          },
        };
      },
      async exec(sql: string) {
        let cleanSql = sql;
        if (/BEGIN(\s+IMMEDIATE)?\s+TRANSACTION;?/i.test(sql.trim())) {
          cleanSql = 'BEGIN;';
        }
        await pool.query(cleanSql);
      },
    };

    return globalClient;
  }

  // SQLite Fallback for offline local development
  const DATA_DIR = path.resolve(process.cwd(), 'data');
  const DB_PATH = path.resolve(DATA_DIR, 'portfolio.db');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const sqlite = new DatabaseSync(DB_PATH);
  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  sqlite.exec('PRAGMA busy_timeout = 5000;');

  globalClient = {
    isPostgres: false,
    prepare(sql: string): PreparedStatement {
      const stmt = sqlite.prepare(sql);
      return {
        async all(...params: any[]) {
          return stmt.all(...params) as any[];
        },
        async get(...params: any[]) {
          return (stmt.get(...params) as any) || null;
        },
        async run(...params: any[]) {
          const res = stmt.run(...params) as any;
          return { changes: res?.changes ?? 0 };
        },
      };
    },
    async exec(sql: string) {
      sqlite.exec(sql);
    },
  };

  return globalClient;
}
