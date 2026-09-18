import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { SocialCampaign } from "@/lib/storage/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await storage.getCampaigns();
    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const campaign: SocialCampaign = body.campaign;

    if (!campaign || !campaign.id) {
      return NextResponse.json({ error: "Invalid campaign payload" }, { status: 400 });
    }

    const saved = await storage.saveCampaign(campaign);
    return NextResponse.json({ success: true, campaign: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save campaign" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing campaign id or status" }, { status: 400 });
    }

    const success = await storage.updateCampaignStatus(id, status);
    if (!success) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update campaign status" }, { status: 500 });
  }
}
