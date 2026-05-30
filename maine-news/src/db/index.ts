import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const databaseUrl: string = process.env.DATABASE_URL;
type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __maineNewsDb: DbInstance | undefined;
}

function createDb(): DbInstance {
  // Use a single shared postgres-js client so app renders and builds do not
  // create a fresh session pool per module evaluation.
  const sql = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
  } as any);

  return drizzle(sql, { schema });
}

export const db = globalThis.__maineNewsDb ?? (globalThis.__maineNewsDb = createDb());
