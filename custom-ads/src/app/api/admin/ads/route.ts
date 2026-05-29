import { NextResponse } from "next/server";
import { adFromFormData } from "@/lib/form";
import { readAds, upsertAd } from "@/lib/store";
import { sendAdNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const ads = await readAds();
  return NextResponse.json({ ads });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const ad = await adFromFormData(formData);
  const savedAd = await upsertAd(ad);
  await sendAdNotification("created", savedAd);

  return NextResponse.json({ ad: savedAd }, { status: 201 });
}
