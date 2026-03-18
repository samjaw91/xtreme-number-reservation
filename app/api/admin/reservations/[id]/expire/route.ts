import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateReservationStatus } from "@/lib/repository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = await params;
    await updateReservationStatus(id, "expired", "admin", body?.adminNotes);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "تعذرت العملية" }, { status: 400 });
  }
}
