import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { expireTimedOutReservations } from "@/lib/repository";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const count = await expireTimedOutReservations();
    return NextResponse.json({ ok: true, expiredCount: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cron failed" }, { status: 500 });
  }
}
