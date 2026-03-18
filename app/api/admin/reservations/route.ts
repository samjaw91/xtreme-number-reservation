import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listReservations } from "@/lib/repository";

export async function GET(req: Request) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const rows = await listReservations(status);
  return NextResponse.json({ rows });
}
