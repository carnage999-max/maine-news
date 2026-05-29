import { NextResponse } from "next/server";
import { setSessionCookie, validCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  if (!validCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  await setSessionCookie(username);

  return NextResponse.json({ ok: true });
}
