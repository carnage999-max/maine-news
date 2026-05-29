import { NextResponse } from "next/server";
import { readAd } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ad = await readAd(id);

  if (!ad?.mediaBase64) {
    return new NextResponse("Media not found", { status: 404 });
  }

  const body = Buffer.from(ad.mediaBase64, "base64");

  return new NextResponse(body, {
    headers: {
      "Content-Type": ad.mediaContentType,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${ad.mediaFileName || `${ad.id}.media`}"`
    }
  });
}
