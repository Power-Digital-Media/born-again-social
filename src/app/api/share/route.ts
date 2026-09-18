import { NextResponse } from "next/server";
import crypto from "crypto";
import { storage } from "@/lib/storage";
import { SocialCampaign, CreativeBriefData } from "@/lib/storage/schema";
import { BRAND_CONFIG } from "@/lib/brand-library";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      campaignId,
      projectName,
      creativeType = "Auto — let ChatGPT decide",
      selectedPhotoIndexes,
    }: {
      campaignId: string;
      projectName?: string;
      creativeType?: string;
      selectedPhotoIndexes?: number[];
    } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    const campaign = await storage.getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Generate or reuse 32-character hex token
    const token = campaign.shareToken || crypto.randomBytes(16).toString("hex");

    // Filter approved photos
    const allImages = campaign.selectedImages || [];
    const indexesToInclude =
      selectedPhotoIndexes && selectedPhotoIndexes.length > 0
        ? selectedPhotoIndexes
        : allImages.map((_, i) => i);
    const approvedPhotoUrls = allImages.filter((_, i) => indexesToInclude.includes(i));

    const verifiedFacts = [
      `${campaign.service} completed in ${campaign.city}, MS`,
      ...campaign.factValidation.extractedClaims,
    ];

    const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005";
    const logoUrl = `${host}/brand_logo.png`;

    const creativeBrief: CreativeBriefData = {
      client: "Born Again Remodeling & Roofing",
      project_name: projectName || `${campaign.city} ${campaign.service}`,
      city: `${campaign.city}, MS`,
      service: campaign.service,
      verified_facts: verifiedFacts,
      technician: campaign.technician,
      approved_photos: approvedPhotoUrls,
      privacy_review: campaign.factValidation.isValid ? "passed" : "needs_review",
      brand: {
        primary_style: "dark navy and gold",
        tone: "premium, trustworthy, faith-centered, professional",
        company_name: "Born Again Remodeling & Roofing",
        phone: BRAND_CONFIG.verifiedPhone,
        website: "bornagainroofing.com",
        logo_url: logoUrl,
      },
      creative_goal: "Create a custom social media project showcase using real job photos.",
      preferred_styles: [
        "Born Again Project Showcase",
        "Before and After Showcase",
        "Commercial Case Study",
        "Residential Project Spotlight",
      ],
      selected_style: creativeType,
      target_formats: [
        "4:5 Facebook/Instagram (1080x1350)",
        "1:1 Square (1080x1080)",
        "9:16 Story/Reel (1080x1920)",
      ],
      instructions: [
        "Use the real project photos.",
        "Do not invent project details.",
        "Do not generate fake roofing imagery unless explicitly requested.",
        "Keep design premium and clean.",
        "Avoid generic AI or Canva-style appearance.",
        "Use verified facts only.",
        "Allow custom layouts similar to the Fun Time Skateland showcase.",
      ],
      suggested_hook: `Fresh ${campaign.service} transformation completed in ${campaign.city}, MS by ${campaign.technician}`,
      hashtags: campaign.hashtags,
    };

    const updatedCampaign: SocialCampaign = {
      ...campaign,
      shareToken: token,
      creativeBrief,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveCampaign(updatedCampaign);

    const shareUrl = `/share/${token}`;

    return NextResponse.json({
      success: true,
      token,
      shareUrl,
      creativeBrief,
    });
  } catch (error: any) {
    console.error("Generate share token error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate share link" }, { status: 500 });
  }
}
