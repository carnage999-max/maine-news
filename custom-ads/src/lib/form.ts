import { AdPlacement, ManagedAd } from "./types";

const placements: AdPlacement[] = [
  "auto",
  "auto-top",
  "auto-inline",
  "auto-feed",
  "auto-bottom",
  "auto-sticky"
];

function splitList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function numberOrNull(formData: FormData, key: string) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function dateOrNull(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value).toISOString() : null;
}

function validPlacements(formData: FormData): AdPlacement[] {
  const requested = splitList(formData.get("placements"));
  const filtered = requested.filter((item): item is AdPlacement =>
    placements.includes(item as AdPlacement)
  );

  return filtered.length > 0 ? filtered : ["auto"];
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

type SavedMedia =
  | null
  | {
      mediaBase64: string;
      mediaContentType: string;
      mediaFileName: string;
      mediaType: ManagedAd["mediaType"];
    };

export async function saveMedia(file: File | null): Promise<SavedMedia> {
  if (!file || file.size === 0) return null;

  const type: ManagedAd["mediaType"] = file.type.startsWith("video/") ? "video" : "image";
  const bytes = Buffer.from(await file.arrayBuffer());

  return {
    mediaBase64: bytes.toString("base64"),
    mediaContentType: file.type || (type === "video" ? "video/mp4" : "image/png"),
    mediaFileName: safeFileName(file.name || "ad-media"),
    mediaType: type
  };
}

export async function adFromFormData(formData: FormData, existing?: ManagedAd): Promise<ManagedAd> {
  const now = new Date().toISOString();
  const id = existing?.id || crypto.randomUUID();
  const media = await saveMedia(formData.get("media") as File | null);
  const mediaBase64 = media?.mediaBase64 ?? existing?.mediaBase64 ?? "";
  const mediaContentType = media?.mediaContentType ?? existing?.mediaContentType ?? "image/png";
  const mediaFileName = media?.mediaFileName ?? existing?.mediaFileName ?? "";
  const mediaType: ManagedAd["mediaType"] = media?.mediaType ?? existing?.mediaType ?? (mediaContentType.startsWith("video/") ? "video" : "image");

  return {
    id,
    advertiserName: text(formData, "advertiserName", existing?.advertiserName || "Advertiser"),
    title: text(formData, "title", existing?.title || ""),
    description: text(formData, "description", existing?.description || ""),
    ctaLabel: text(formData, "ctaLabel", existing?.ctaLabel || "Learn more"),
    destinationUrl: text(formData, "destinationUrl", existing?.destinationUrl || "#"),
    mediaUrl: mediaBase64 ? `/api/media/${id}` : "",
    mediaType,
    mediaBase64,
    mediaContentType,
    mediaFileName,
  altText: text(formData, "altText", existing?.altText || text(formData, "title")),
  status: text(formData, "status", existing?.status || "paused") === "active" ? "active" : "paused",
  priority: Math.min(10, Math.max(1, Number(text(formData, "priority", String(existing?.priority || 5))) || 5)),
  placements: validPlacements(formData),
  startsAt: dateOrNull(formData, "startsAt") || existing?.startsAt || null,
    endsAt: dateOrNull(formData, "endsAt") || existing?.endsAt || null,
    maxImpressions: numberOrNull(formData, "maxImpressions") ?? existing?.maxImpressions ?? null,
    impressions: existing?.impressions || 0,
    clicks: existing?.clicks || 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
}
