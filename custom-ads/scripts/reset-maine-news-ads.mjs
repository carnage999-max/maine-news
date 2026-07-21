import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const adRows = [
  {
    id: "42dbe6f4-04cf-4b61-b2ef-d39df1c69011",
    advertiserName: "Liberty Social",
    title: "Connect Freely. Express Boldly.",
    description:
      "Liberty Social is a premium, human-first social space where your voice looks and feels as powerful as it sounds.",
    ctaLabel: "Visit site",
    destinationUrl: "https://mylibertysocial.com",
    altText: "Liberty Social logo",
    mediaPath: "../maine-news/public/temp/liberty-social.png",
    mediaContentType: "image/png",
    placements: ["home-header-left"],
  },
  {
    id: "54f9090a-f7e4-4f54-a0f2-9b74d2ef7282",
    advertiserName: "No Limit Flix",
    title: "Premium Content",
    description: "Hand-picked, permanent library.",
    ctaLabel: "Visit site",
    destinationUrl: "https://nolimitflix.com",
    altText: "No Limit Flix logo",
    mediaPath: "../maine-news/public/temp/nolimitfix.png",
    mediaContentType: "image/png",
    placements: ["home-header-right"],
  },
  {
    id: "f4198929-1521-4c5d-b26f-8383dac3660d",
    advertiserName: "Right Jobs",
    title: "The Right Job, Right Now.",
    description: "Trust-first hiring for verified talent and serious employers.",
    ctaLabel: "Visit site",
    destinationUrl: "https://www.rightjob.net/",
    altText: "Right Jobs logo",
    mediaPath: "../maine-news/public/temp/right-job.png",
    mediaContentType: "image/png",
    placements: ["home-featured"],
  },
  {
    id: "e9695788-17aa-4546-b3a6-7e6cb1d5a94f",
    advertiserName: "Work History Registry",
    title: "Verified employment events. Nothing more.",
    description: "The Single Source of Truth for Professional History.",
    ctaLabel: "Visit site",
    destinationUrl: "https://www.workhistoryregistry.com/",
    altText: "Work History Registry logo",
    mediaPath: "../maine-news/public/temp/work-history-registry.png",
    mediaContentType: "image/png",
    placements: ["home-feed-inline"],
  },
  {
    id: "a37a74df-7d4f-4bcf-a246-53bc463a94af",
    advertiserName: "Legal Connect",
    title: "Access to justice.",
    description: "Legal help when you need it.",
    ctaLabel: "Visit site",
    destinationUrl: "https://www.legalconnectapp.com/",
    altText: "Legal Connect logo",
    mediaPath: "../maine-news/public/temp/legal-connect.png",
    mediaContentType: "image/png",
    placements: ["home-footer-feature"],
  },
  {
    id: "cb3e79d9-f84d-4b5e-bd2b-4f3548d43354",
    advertiserName: "Charleston Church",
    title: "Community rooted.",
    description: "A welcoming church family in Charleston, Maine.",
    ctaLabel: "Visit site",
    destinationUrl: "https://charlestonchurch.net",
    altText: "Charleston Church logo",
    mediaPath: "../maine-news/public/charleston-church.png",
    mediaContentType: "image/png",
    placements: ["home-partner-block"],
  },
];

async function loadEnv() {
  const candidates = [".env.local", ".env"];

  for (const fileName of candidates) {
    const filePath = path.join(process.cwd(), fileName);

    try {
      const raw = await readFile(filePath, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const separator = trimmed.indexOf("=");
        if (separator === -1) continue;
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();
        value = value.replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      continue;
    }
  }
}

await loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to reset ads.");
}

const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 15,
});
const now = new Date().toISOString();

for (const row of adRows) {
  const filePath = path.resolve(process.cwd(), row.mediaPath);
  const mediaBase64 = await readFile(filePath, { encoding: "base64" });

  row.mediaBase64 = mediaBase64;
}

await sql`DELETE FROM custom_ads_ads`;

for (const row of adRows) {
  await sql`
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
      ${row.id},
      ${row.advertiserName},
      ${row.title},
      ${row.description},
      ${row.ctaLabel},
      ${row.destinationUrl},
      ${row.mediaBase64},
      ${row.mediaContentType},
      ${path.basename(row.mediaPath)},
      ${row.altText},
      ${"active"},
      ${1},
      ${JSON.stringify([])}::jsonb,
      ${JSON.stringify(row.placements)}::jsonb,
      ${JSON.stringify([])}::jsonb,
      ${JSON.stringify([])}::jsonb,
      ${null},
      ${null},
      ${null},
      ${0},
      ${0},
      ${now},
      ${now}
    )
  `;
}

console.log(`Reset complete. Inserted ${adRows.length} ads.`);
await sql.end();
