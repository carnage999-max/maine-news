import { customAdsAssetUrl, proxyCustomAdsRequest } from "@/lib/customAdsProxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return proxyCustomAdsRequest(request, "/widget.js");
}

export async function HEAD() {
  const response = await fetch(customAdsAssetUrl("/widget.js"), { method: "HEAD" });
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
