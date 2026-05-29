import { NextResponse } from "next/server";
import { selectAdsForPlacements } from "@/lib/delivery";
import { readAds, recordSiteActivity } from "@/lib/store";
import { DeliveryResponse } from "@/lib/types";

function splitRules(value: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(request: Request) {
  return {
    "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
}

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { headers: corsHeaders(request) });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const site = url.searchParams.get("site") || "default";
  const page = url.searchParams.get("page") || "/";
  const placements = (url.searchParams.get("placements") || "auto-top,auto-inline,auto-bottom")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const excludedIds = (url.searchParams.get("exclude") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowedPaths = splitRules(url.searchParams.get("allowedPaths"));
  const blockedPaths = splitRules(url.searchParams.get("blockedPaths"));
  const maxSlots = Math.min(8, Math.max(1, Number(url.searchParams.get("maxSlots") || "4") || 4));
  const origin = request.headers.get("origin") || "";
  const referrer = request.headers.get("referer") || "";
  const userAgent = request.headers.get("user-agent") || "";

  await recordSiteActivity({
    siteKey: site,
    origin,
    page,
    referrer,
    userAgent,
    allowedPaths,
    blockedPaths,
    maxSlots,
    event: "delivery"
  });

  const ads = await readAds();
  const selected = selectAdsForPlacements(ads, site, page, placements, allowedPaths, blockedPaths, maxSlots, excludedIds);
  const body: DeliveryResponse = { site, page, ads: selected };

  return NextResponse.json(body, { headers: corsHeaders(request) });
}
