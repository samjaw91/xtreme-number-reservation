import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.json();
  if (body?.username !== env.adminUsername || body?.password !== env.adminPassword) {
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }
  const token = createAdminToken(body.username);
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ ok: true });
}
