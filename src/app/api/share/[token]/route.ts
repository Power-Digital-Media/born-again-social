import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const campaign = await storage.getCampaignByShareToken(token);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found or link expired" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      brief: campaign.creativeBrief,
      campaign: {
        id: campaign.id,
        city: campaign.city,
        service: campaign.service,
        technician: campaign.technician,
        jobDate: campaign.jobDate,
        photos: campaign.selectedImages,
        facebookCopy: campaign.facebookCopy,
        instagramCopy: campaign.instagramCopy,
        gbpCopy: campaign.gbpCopy,
        hashtags: campaign.hashtags,
        landingPageUrl: campaign.landingPageUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch shared brief" }, { status: 500 });
  }
}
