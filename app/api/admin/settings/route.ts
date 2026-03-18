import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateCampaignAndSettings } from "@/lib/repository";

export async function PATCH(req: Request) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    await updateCampaignAndSettings(body, "admin");
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "تعذر حفظ الإعدادات" }, { status: 400 });
  }
}
