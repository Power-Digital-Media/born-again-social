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

    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || (hostHeader.includes("localhost") ? "http" : "https");
    const origin = request.headers.get("origin") || (hostHeader ? `${proto}://${hostHeader}` : "");
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || "https://www.bornagainroofing.com";
    const logoUrl = `${baseUrl}/brand_logo.png`;

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
        official_logo_url: BRAND_CONFIG.officialLogoUrl,
      },
      creative_goal: "Create a custom social media project showcase using real job photos.",
      preferred_styles: [
        "Auto — let ChatGPT decide",
        "Project Showcase",
        "Before / After",
        "Commercial Case Study",
        "Residential Spotlight",
        "Detail / Craftsmanship",
        "Custom",
      ],
      selected_style: creativeType,
      target_formats: [
        "4:5 Facebook/Instagram (1080x1350)",
        "1:1 Square (1080x1080)",
        "9:16 Story/Reel (1080x1920)",
      ],
      instructions: [
        "If selected_style is 'Auto — let ChatGPT decide', analyze the approved project photography to select the optimal graphic composition:",
        "  • If there is a strong transformation -> Before / After Showcase",
        "  • If there is one standout hero image -> Premium Project Spotlight",
        "  • If there are multiple useful angles -> Multi-photo Case Study",
        "  • If there are detail shots showing fine workmanship -> Detail / Craftsmanship focus",
        "  • If it is a commercial property -> Commercial Case Study",
        "  • If it is general residential work -> Clean homeowner-focused promo",
        "Use the real project photos only (no fake AI roofs).",
        "Preserve verified brand identity: Dark Navy (#0c0f16) & Metallic Gold (#f3c973) palette, Born Again Remodeling & Roofing, (601) 573-6178, bornagainroofing.com.",
        "Do not invent project details or customer information.",
        "Output high-impact 4:5 social creative graphic (1080x1350).",
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
