import { NextResponse } from "next/server";
import { getActiveCampaign, getCampaignNumbers } from "@/lib/repository";

export async function GET() {
  try {
    const campaign = await getActiveCampaign();
    if (!campaign) return NextResponse.json({ campaign: null, numbers: [] });
    const numbers = await getCampaignNumbers(campaign.id);
    return NextResponse.json({ campaign, numbers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
