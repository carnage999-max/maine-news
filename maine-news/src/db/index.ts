import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Disable prepared statements for Supabase transaction‑mode pooler
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(sql, { schema });
