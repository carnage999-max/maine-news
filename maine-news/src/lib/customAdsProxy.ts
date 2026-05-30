function customAdsServiceUrl() {
  const value = process.env.CUSTOM_ADS_SERVICE_URL || process.env.NEXT_PUBLIC_CUSTOM_ADS_URL;

  if (!value) {
    throw new Error("CUSTOM_ADS_SERVICE_URL or NEXT_PUBLIC_CUSTOM_ADS_URL is required for custom ads proxying.");
  }

  return value.replace(/\/$/, "");
}

export function customAdsAssetUrl(path: string) {
  return `${customAdsServiceUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function proxyCustomAdsRequest(
  request: Request,
  targetPath: string,
  init?: RequestInit
) {
  const upstream = customAdsAssetUrl(targetPath);
  const upstreamResponse = await fetch(upstream, init);
  const headers = new Headers(upstreamResponse.headers);

  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers
  });
}
