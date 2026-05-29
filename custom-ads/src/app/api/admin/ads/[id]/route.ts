import { NextResponse } from "next/server";
import { adFromFormData } from "@/lib/form";
import { deleteAd, readAds, upsertAd } from "@/lib/store";
import { sendAdNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const ads = await readAds();
  const existing = ads.find((ad) => ad.id === id);

  if (!existing) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const ad = await adFromFormData(formData, existing);
  const savedAd = await upsertAd(ad);
  const notification = existing.status !== savedAd.status
    ? savedAd.status === "active"
      ? "activated"
      : "paused"
    : "updated";
  await sendAdNotification(notification, savedAd);

  return NextResponse.json({ ad: savedAd });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ads = await readAds();
  const existing = ads.find((ad) => ad.id === id);
  await deleteAd(id);
  if (existing) await sendAdNotification("deleted", existing);

  return NextResponse.json({ ok: true });
}
