import { ManagedAd, PublicAd } from "./types";

function pathMatches(pathname: string, rules: string[]) {
  if (rules.length === 0) return true;

  return rules.some((rule) => {
    if (rule.endsWith("*")) {
      return pathname.startsWith(rule.slice(0, -1));
    }

    return pathname === rule || pathname.includes(rule);
  });
}

function isAutoPlacement(placement: string) {
  return placement === "auto" || placement.startsWith("auto-");
}

function isEligible(ad: ManagedAd, site: string, _page: string, placement: string) {
  const now = Date.now();
  const startsAt = ad.startsAt ? Date.parse(ad.startsAt) : null;
  const endsAt = ad.endsAt ? Date.parse(ad.endsAt) : null;

  if (ad.status !== "active") return false;
  if (!ad.mediaUrl || !ad.destinationUrl || !ad.title) return false;
  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;
  if (ad.maxImpressions && ad.impressions >= ad.maxImpressions) return false;
  if (
    !ad.placements.includes(placement as never) &&
    !(isAutoPlacement(placement) && ad.placements.includes("auto"))
  ) {
    return false;
  }

  return true;
}

export function pageAllowedByRules(page: string, allowedPaths: string[], blockedPaths: string[]) {
  if (allowedPaths.length > 0 && !pathMatches(page, allowedPaths)) return false;
  if (blockedPaths.length > 0 && pathMatches(page, blockedPaths)) return false;
  return true;
}

function publicAd(ad: ManagedAd): PublicAd {
  return {
    id: ad.id,
    advertiserName: ad.advertiserName,
    title: ad.title,
    description: ad.description,
    ctaLabel: ad.ctaLabel,
    destinationUrl: ad.destinationUrl,
    mediaUrl: ad.mediaUrl,
    mediaType: ad.mediaType,
    altText: ad.altText
  };
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function weightOf(ad: ManagedAd) {
  return Math.max(1, ad.priority) * Math.max(1, ad.priority);
}

function chooseWeightedIndex(ads: ManagedAd[]) {
  const total = ads.reduce((sum, ad) => sum + weightOf(ad), 0);
  let cursor = Math.random() * total;

  for (let index = 0; index < ads.length; index += 1) {
    cursor -= weightOf(ads[index]);
    if (cursor <= 0) return index;
  }

  return ads.length - 1;
}

function weightedShuffle(ads: ManagedAd[]) {
  const pool = [...ads];
  const ordered: ManagedAd[] = [];

  while (pool.length > 0) {
    const index = chooseWeightedIndex(pool);
    ordered.push(pool[index]);
    pool.splice(index, 1);
  }

  return ordered;
}

function stableOrder(ads: ManagedAd[], seed: string) {
  return [...ads].sort((left, right) => {
    const leftHash = hashString(`${seed}:${left.id}`);
    const rightHash = hashString(`${seed}:${right.id}`);

    if (leftHash !== rightHash) return leftHash - rightHash;
    return left.id.localeCompare(right.id);
  });
}

export function selectAdsForPlacements(
  allAds: ManagedAd[],
  site: string,
  page: string,
  placements: string[],
  allowedPaths: string[],
  blockedPaths: string[],
  maxSlots: number,
  excludedIds: string[] = []
) {
  if (!pageAllowedByRules(page, allowedPaths, blockedPaths)) return [];

  const chosen = new Set(excludedIds);
  const limitedPlacements = placements.slice(0, Math.max(1, maxSlots || placements.length));
  const responses: Array<{ placement: string; ad: PublicAd }> = [];

  for (const placement of limitedPlacements) {
    const eligible = allAds.filter((ad) => !chosen.has(ad.id) && isEligible(ad, "", page, placement));
    const stableEligible = eligible.filter((ad) => ad.priority === 1);
    const selected =
      stableEligible.length > 0
        ? stableOrder(stableEligible, `${site}:${page}:${placement}`)[0]
        : weightedShuffle(eligible)[0];

    if (!selected) continue;

    chosen.add(selected.id);
    responses.push({ placement, ad: publicAd(selected) });
  }

  return responses;
}
