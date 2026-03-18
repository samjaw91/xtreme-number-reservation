import { NextResponse } from "next/server";
import { createReservation } from "@/lib/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.fullName || !body?.phone || !Array.isArray(body?.numbers)) {
      return NextResponse.json({ error: "البيانات المطلوبة غير مكتملة" }, { status: 400 });
    }
    const result = await createReservation(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "تعذر إنشاء الطلب" }, { status: 400 });
  }
}
