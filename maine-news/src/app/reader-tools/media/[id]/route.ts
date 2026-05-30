import { proxyCustomAdsRequest } from "@/lib/customAdsProxy";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyCustomAdsRequest(request, `/api/media/${id}`);
}

export async function HEAD(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyCustomAdsRequest(request, `/api/media/${id}`, { method: "HEAD" });
}
