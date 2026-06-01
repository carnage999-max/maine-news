import { ensureSchema, getSql } from "./db";
import { AdPlacement, AdStatus, ManagedAd, SiteAnalytics } from "./types";

type DbAd = {
  id: string;
  advertiser_name: string;
  title: string;
  description: string;
  cta_label: string;
  destination_url: string;
  media_base64: string;
  media_content_type: string;
  media_file_name: string;
  alt_text: string;
  status: string;
  priority: number;
  sites: unknown;
  placements: unknown;
  starts_at: string | Date | null;
  ends_at: string | Date | null;
  max_impressions: number | null;
  impressions: number;
  clicks: number;
  created_at: string | Date;
  updated_at: string | Date;
};

type DbSite = {
  site_key: string;
  origin: string;
  referrer_host: string;
  last_page: string;
  last_referrer: string;
  last_user_agent: string;
  last_allowed_paths: unknown;
  last_blocked_paths: unknown;
  last_max_slots: number;
  delivery_requests: number;
  impressions: number;
  clicks: number;
  first_seen_at: string | Date;
  last_seen_at: string | Date;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asPlacements(value: unknown): AdPlacement[] {
  const items = asStringArray(value).filter((item): item is AdPlacement =>
    [
      "auto",
      "auto-top",
      "auto-inline",
      "auto-feed",
      "auto-bottom",
      "auto-sticky",
      "home-header-left",
      "home-header-right",
      "home-featured",
      "home-feed-inline",
      "home-footer-feature"
    ].includes(item)
  );

  return items.length > 0 ? items : ["auto"];
}

function toIso(value: string | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapAd(row: DbAd): ManagedAd {
  const mediaContentType = row.media_content_type || "image/png";

  return {
    id: row.id,
    advertiserName: row.advertiser_name,
    title: row.title,
    description: row.description,
    ctaLabel: row.cta_label,
    destinationUrl: row.destination_url,
    mediaUrl: row.media_base64 ? `/api/media/${row.id}` : "",
    mediaType: mediaContentType.startsWith("video/") ? "video" : "image",
    mediaBase64: row.media_base64 || "",
    mediaContentType,
    mediaFileName: row.media_file_name || "",
    altText: row.alt_text,
    status: row.status === "active" ? "active" : "paused",
    priority: row.priority,
    placements: asPlacements(row.placements),
    startsAt: toIso(row.starts_at),
    endsAt: toIso(row.ends_at),
    maxImpressions: row.max_impressions,
    impressions: row.impressions,
    clicks: row.clicks,
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || new Date().toISOString()
  };
}

function mapSite(row: DbSite): SiteAnalytics {
  return {
    siteKey: row.site_key,
    origin: row.origin,
    referrerHost: row.referrer_host,
    lastPage: row.last_page,
    lastReferrer: row.last_referrer,
    lastUserAgent: row.last_user_agent,
    lastAllowedPaths: asStringArray(row.last_allowed_paths),
    lastBlockedPaths: asStringArray(row.last_blocked_paths),
    lastMaxSlots: row.last_max_slots || 4,
    deliveryRequests: row.delivery_requests || 0,
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    firstSeenAt: toIso(row.first_seen_at) || new Date().toISOString(),
    lastSeenAt: toIso(row.last_seen_at) || new Date().toISOString()
  };
}

export async function readAds(): Promise<ManagedAd[]> {
  await ensureSchema();
  const sql = getSql();

  const rows = (await sql`
    SELECT *
    FROM custom_ads_ads
    ORDER BY created_at DESC
  `) as DbAd[];

  return (rows as DbAd[]).map(mapAd);
}

export async function readAd(id: string): Promise<ManagedAd | null> {
  await ensureSchema();
  const sql = getSql();

  const rows = (await sql`
    SELECT *
    FROM custom_ads_ads
    WHERE id = ${id}
    LIMIT 1
  `) as DbAd[];

  return rows[0] ? mapAd(rows[0]) : null;
}

export async function upsertAd(ad: ManagedAd) {
  await ensureSchema();
  const sql = getSql();

  const rows = (await sql`
    INSERT INTO custom_ads_ads (
      id,
      advertiser_name,
      title,
      description,
      cta_label,
      destination_url,
      media_base64,
      media_content_type,
      media_file_name,
      alt_text,
      status,
      priority,
      sites,
      placements,
      allowed_paths,
      blocked_paths,
      starts_at,
      ends_at,
      max_impressions,
      impressions,
      clicks,
      created_at,
      updated_at
    )
    VALUES (
      ${ad.id},
      ${ad.advertiserName},
      ${ad.title},
      ${ad.description},
      ${ad.ctaLabel},
      ${ad.destinationUrl},
      ${ad.mediaBase64},
      ${ad.mediaContentType},
      ${ad.mediaFileName},
      ${ad.altText},
      ${ad.status},
      ${ad.priority},
      ${JSON.stringify([])}::jsonb,
      ${JSON.stringify(ad.placements)}::jsonb,
      ${JSON.stringify([])}::jsonb,
      ${JSON.stringify([])}::jsonb,
      ${ad.startsAt},
      ${ad.endsAt},
      ${ad.maxImpressions},
      ${ad.impressions},
      ${ad.clicks},
      ${ad.createdAt},
      ${ad.updatedAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      advertiser_name = excluded.advertiser_name,
      title = excluded.title,
      description = excluded.description,
      cta_label = excluded.cta_label,
      destination_url = excluded.destination_url,
      media_base64 = excluded.media_base64,
      media_content_type = excluded.media_content_type,
      media_file_name = excluded.media_file_name,
      alt_text = excluded.alt_text,
      status = excluded.status,
      priority = excluded.priority,
      sites = '[]'::jsonb,
      placements = excluded.placements,
      allowed_paths = '[]'::jsonb,
      blocked_paths = '[]'::jsonb,
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      max_impressions = excluded.max_impressions,
      impressions = excluded.impressions,
      clicks = excluded.clicks,
      updated_at = excluded.updated_at
    RETURNING *
  `) as DbAd[];

  return mapAd(rows[0]);
}

export async function deleteAd(id: string) {
  await ensureSchema();
  const sql = getSql();

  await sql`
    DELETE FROM custom_ads_ads
    WHERE id = ${id}
  `;
}

export async function incrementAdMetric(id: string, metric: "impressions" | "clicks") {
  await ensureSchema();
  const sql = getSql();

  const rows = (metric === "impressions"
    ? await sql`
        UPDATE custom_ads_ads
        SET impressions = impressions + 1, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `
    : await sql`
        UPDATE custom_ads_ads
        SET clicks = clicks + 1, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `) as DbAd[];

  return rows[0] ? mapAd(rows[0]) : null;
}

export async function readSiteAnalytics(): Promise<SiteAnalytics[]> {
  await ensureSchema();
  const sql = getSql();

  const rows = (await sql`
    SELECT *
    FROM custom_ads_sites
    ORDER BY last_seen_at DESC, site_key ASC, origin ASC
  `) as DbSite[];

  return rows.map(mapSite);
}

export async function recordSiteActivity({
  siteKey,
  origin,
  page,
  referrer,
  userAgent,
  allowedPaths,
  blockedPaths,
  maxSlots,
  event
}: {
  siteKey: string;
  origin: string;
  page: string;
  referrer: string;
  userAgent: string;
  allowedPaths: string[];
  blockedPaths: string[];
  maxSlots: number;
  event: "delivery" | "impression" | "click";
}) {
  await ensureSchema();
  const sql = getSql();
  const normalizedSiteKey = siteKey.trim() || "default";
  const normalizedOrigin = origin.trim();
  const normalizedReferrer = referrer.trim();
  const referrerHost = safeHost(normalizedReferrer);

  await sql`
    INSERT INTO custom_ads_sites (
      site_key,
      display_name,
      allowed_paths,
      blocked_paths,
      max_slots,
      created_at,
      updated_at,
      origin,
      referrer_host,
      last_page,
      last_referrer,
      last_user_agent,
      last_allowed_paths,
      last_blocked_paths,
      last_max_slots,
      delivery_requests,
      impressions,
      clicks,
      first_seen_at,
      last_seen_at
    )
    VALUES (
      ${normalizedSiteKey},
      ${normalizedSiteKey},
      ${JSON.stringify(allowedPaths)}::jsonb,
      ${JSON.stringify(blockedPaths)}::jsonb,
      ${Math.max(1, maxSlots || 1)},
      now(),
      now(),
      ${normalizedOrigin},
      ${referrerHost},
      ${page},
      ${normalizedReferrer},
      ${userAgent.trim()},
      ${JSON.stringify(allowedPaths)}::jsonb,
      ${JSON.stringify(blockedPaths)}::jsonb,
      ${Math.max(1, maxSlots || 1)},
      ${event === "delivery" ? 1 : 0},
      ${event === "impression" ? 1 : 0},
      ${event === "click" ? 1 : 0},
      now(),
      now()
    )
    ON CONFLICT (site_key) DO UPDATE SET
      display_name = excluded.display_name,
      allowed_paths = excluded.allowed_paths,
      blocked_paths = excluded.blocked_paths,
      max_slots = excluded.max_slots,
      updated_at = now(),
      referrer_host = excluded.referrer_host,
      origin = excluded.origin,
      last_page = excluded.last_page,
      last_referrer = excluded.last_referrer,
      last_user_agent = excluded.last_user_agent,
      last_allowed_paths = excluded.last_allowed_paths,
      last_blocked_paths = excluded.last_blocked_paths,
      last_max_slots = excluded.last_max_slots,
      delivery_requests = custom_ads_sites.delivery_requests + excluded.delivery_requests,
      impressions = custom_ads_sites.impressions + excluded.impressions,
      clicks = custom_ads_sites.clicks + excluded.clicks,
      last_seen_at = now()
  `;
}

function safeHost(value: string) {
  if (!value) return "";

  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

export function isStatus(value: string): value is AdStatus {
  return value === "active" || value === "paused";
}
