import { proxyCustomAdsRequest } from "@/lib/customAdsProxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyCustomAdsRequest(request, `/api/delivery${url.search}`, {
    headers: {
      origin: url.origin,
      referer: request.headers.get("referer") || url.origin,
      "user-agent": request.headers.get("user-agent") || ""
    }
  });
}

export async function OPTIONS(request: Request) {
  const url = new URL(request.url);
  return proxyCustomAdsRequest(request, `/api/delivery${url.search}`, {
    method: "OPTIONS",
    headers: {
      origin: url.origin,
      referer: request.headers.get("referer") || url.origin,
      "user-agent": request.headers.get("user-agent") || ""
    }
  });
}
