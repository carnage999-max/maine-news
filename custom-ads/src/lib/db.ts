import { neon } from "@neondatabase/serverless";

let schemaReady = false;
let schemaPromise: Promise<void> | null = null;
let client: ReturnType<typeof neon> | null = null;

export function assertDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Set it to your Neon connection string.");
  }
}

export function getSql() {
  assertDatabaseUrl();
  client ||= neon(process.env.DATABASE_URL!);
  return client;
}

export async function ensureSchema() {
  if (schemaReady) return;
  schemaPromise ||= createSchema();

  await schemaPromise;
}

async function createSchema() {
  const sql = getSql();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS custom_ads_ads (
        id uuid PRIMARY KEY,
        advertiser_name text NOT NULL,
        title text NOT NULL,
        description text NOT NULL DEFAULT '',
        cta_label text NOT NULL DEFAULT 'Learn more',
        destination_url text NOT NULL,
        media_base64 text NOT NULL DEFAULT '',
        media_content_type text NOT NULL DEFAULT 'image/png',
        media_file_name text NOT NULL DEFAULT '',
        alt_text text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'paused',
        priority integer NOT NULL DEFAULT 5,
        sites jsonb NOT NULL DEFAULT '[]'::jsonb,
        placements jsonb NOT NULL DEFAULT '["auto"]'::jsonb,
        allowed_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
        blocked_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
        starts_at timestamptz,
        ends_at timestamptz,
        max_impressions integer,
        impressions integer NOT NULL DEFAULT 0,
        clicks integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS custom_ads_sites (
        site_key text PRIMARY KEY,
        display_name text NOT NULL DEFAULT '',
        allowed_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
        blocked_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
        max_slots integer NOT NULL DEFAULT 4,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        origin text NOT NULL DEFAULT '',
        referrer_host text NOT NULL DEFAULT '',
        last_page text NOT NULL DEFAULT '/',
        last_referrer text NOT NULL DEFAULT '',
        last_user_agent text NOT NULL DEFAULT '',
        last_allowed_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
        last_blocked_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
        last_max_slots integer NOT NULL DEFAULT 4,
        delivery_requests integer NOT NULL DEFAULT 0,
        impressions integer NOT NULL DEFAULT 0,
        clicks integer NOT NULL DEFAULT 0,
        first_seen_at timestamptz NOT NULL DEFAULT now(),
        last_seen_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS allowed_paths jsonb NOT NULL DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS blocked_paths jsonb NOT NULL DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS max_slots integer NOT NULL DEFAULT 4`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS referrer_host text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_page text NOT NULL DEFAULT '/'`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_referrer text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_user_agent text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_allowed_paths jsonb NOT NULL DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_blocked_paths jsonb NOT NULL DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_max_slots integer NOT NULL DEFAULT 4`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS delivery_requests integer NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS impressions integer NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS first_seen_at timestamptz NOT NULL DEFAULT now()`;
    await sql`ALTER TABLE custom_ads_sites ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now()`;
  } catch (error) {
    if (!isConcurrentCreateTableError(error) || !(await tableExists())) {
      schemaPromise = null;
      throw error;
    }
  }

  schemaReady = true;
}

async function tableExists() {
  const sql = getSql();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const rows = (await sql`
      SELECT
        to_regclass('public.custom_ads_ads') AS ads_table_name,
        to_regclass('public.custom_ads_sites') AS sites_table_name
    `) as Array<{ ads_table_name: string | null; sites_table_name: string | null }>;

    if (rows[0]?.ads_table_name && rows[0]?.sites_table_name) return true;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  return false;
}

function isConcurrentCreateTableError(error: unknown) {
  const err = error as { code?: string; message?: string; constraint?: string };

  return (
    err.code === "23505" ||
    err.code === "42710" ||
    err.constraint === "pg_type_typname_nsp_index" ||
    Boolean(err.message?.includes("pg_type_typname_nsp_index"))
  );
}
