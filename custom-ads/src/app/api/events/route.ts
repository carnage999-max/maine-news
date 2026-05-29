import { NextResponse } from "next/server";
import { incrementAdMetric, recordSiteActivity } from "@/lib/store";
import { sendAdNotification } from "@/lib/notifications";

function corsHeaders(request: Request) {
  return {
    "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const adId = typeof body?.adId === "string" ? body.adId : "";
  const eventMetric = body?.event === "click" ? "clicks" : "impressions";
  const analyticsEvent = body?.event === "click" ? "click" : "impression";
  const siteKey = typeof body?.site === "string" ? body.site : "default";
  const page = typeof body?.page === "string" ? body.page : "/";
  const origin = request.headers.get("origin") || "";
  const referrer = request.headers.get("referer") || "";
  const userAgent = request.headers.get("user-agent") || "";

  if (!adId) {
    return NextResponse.json({ error: "Missing adId" }, { status: 400, headers: corsHeaders(request) });
  }

  await recordSiteActivity({
    siteKey,
    origin,
    page,
    referrer,
    userAgent,
    allowedPaths: [],
    blockedPaths: [],
    maxSlots: 1,
    event: analyticsEvent
  });

  const ad = await incrementAdMetric(adId, eventMetric);
  if (eventMetric === "impressions" && ad?.maxImpressions && ad.impressions === ad.maxImpressions) {
    await sendAdNotification("limit-reached", ad);
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
}
