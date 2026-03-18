import { NextResponse } from "next/server";
import { findReservationStatus } from "@/lib/repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestCode = searchParams.get("requestCode") || undefined;
    const phone = searchParams.get("phone") || undefined;
    if (!requestCode && !phone) {
      return NextResponse.json({ error: "أدخل رقم الطلب أو رقم الهاتف" }, { status: 400 });
    }
    const data = await findReservationStatus({ requestCode, phone });
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "تعذر جلب الحالة" }, { status: 500 });
  }
}
