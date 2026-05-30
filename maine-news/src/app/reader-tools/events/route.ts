import { customAdsAssetUrl, sanitizeProxyHeaders } from "@/lib/customAdsProxy";

export const dynamic = "force-dynamic";

function eventHeaders(request: Request) {
  const url = new URL(request.url);

  return {
    origin: url.origin,
    referer: request.headers.get("referer") || url.origin,
    "user-agent": request.headers.get("user-agent") || "",
    "content-type": request.headers.get("content-type") || "application/json"
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(customAdsAssetUrl("/api/events"), {
    method: "POST",
    headers: eventHeaders(request),
    body
  });

  const headers = sanitizeProxyHeaders(response.headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export async function OPTIONS(request: Request) {
  const response = await fetch(customAdsAssetUrl("/api/events"), {
    method: "OPTIONS",
    headers: eventHeaders(request)
  });

  const headers = sanitizeProxyHeaders(response.headers);

  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
