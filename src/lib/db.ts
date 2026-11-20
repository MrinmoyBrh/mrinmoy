import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

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

// Parse PostgreSQL INT8 / BIGINT as JavaScript numbers
pg.types.setTypeParser(20, (val: string | null) => (val === null ? null : parseInt(val, 10)));

let globalClient: DatabaseClient | null = null;
let pgPoolInstance: pg.Pool | null = null;

function resolveDatabaseUrl(): string {
  const envVar =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (envVar && envVar.trim().length > 0) {
    return envVar.trim().replace(/^["']|["']$/g, '');
  }

  // Fallback to reading .env.local for local development if running outside Astro Vite runner
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const match = content.match(/^(?:DATABASE_URL|POSTGRES_URL)=(.+)$/m);
      if (match && match[1]) {
        const url = match[1].trim().replace(/^["']|["']$/g, '');
        if (url) return url;
      }
    }
  } catch {}

  throw new Error(
    '[Database Configuration Error] Neither DATABASE_URL nor POSTGRES_URL was found in environment variables. ' +
    'Please configure DATABASE_URL in your Vercel Project Settings (Settings -> Environment Variables) ' +
    'with your Neon PostgreSQL connection string.'
  );
}

export function getDb(): DatabaseClient {
  if (globalClient) {
    return globalClient;
  }

  const databaseUrl = resolveDatabaseUrl();

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
