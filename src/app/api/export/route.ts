import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SocialCampaign } from "@/lib/storage/schema";
import { BRAND_CONFIG } from "@/lib/brand-library";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      campaign,
      projectName,
      selectedPhotoIndexes,
      creativeType = "Auto — let ChatGPT decide",
      customDir,
    }: {
      campaign: SocialCampaign;
      projectName?: string;
      selectedPhotoIndexes?: number[];
      creativeType?: string;
      customDir?: string;
    } = body;

    if (!campaign) {
      return NextResponse.json({ error: "Missing campaign payload" }, { status: 400 });
    }

    // Determine target folder
    const baseDir = customDir || process.env.EXPORTS_DIR || path.join(process.cwd(), "exports");
    const safeCity = campaign.city.replace(/[^a-zA-Z0-9]/g, "_");
    const safeService = campaign.service.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStr = new Date().toISOString().split("T")[0];
    const folderName = `${dateStr}_${safeCity}_${safeService}_${campaign.id.slice(-6)}`;
    const targetFolder = path.join(baseDir, folderName);

    // Subdirectories requested by ChatGPT
    const originalMediaDir = path.join(targetFolder, "original_media");
    const socialCopyDir = path.join(targetFolder, "social_copy");
    const chatgptCreativeDir = path.join(targetFolder, "chatgpt_creative");
    const aiCreativesDir = path.join(targetFolder, "ai_creatives");

    [originalMediaDir, socialCopyDir, chatgptCreativeDir, aiCreativesDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // 1. Write Text Post Files to social_copy/
    const fbFilePath = path.join(socialCopyDir, "facebook_post.txt");
    const igFilePath = path.join(socialCopyDir, "instagram_post.txt");
    const gbpFilePath = path.join(socialCopyDir, "google_business_profile.txt");

    fs.writeFileSync(fbFilePath, campaign.facebookCopy, "utf-8");
    fs.writeFileSync(igFilePath, campaign.instagramCopy, "utf-8");
    fs.writeFileSync(gbpFilePath, campaign.gbpCopy, "utf-8");

    // Also mirror text posts inside chatgpt_creative/ for convenience
    fs.writeFileSync(path.join(chatgptCreativeDir, "facebook_post.txt"), campaign.facebookCopy, "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "instagram_post.txt"), campaign.instagramCopy, "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "google_business_profile.txt"), campaign.gbpCopy, "utf-8");

    // 2. Filter & Download Selected Photos
    const allImages = campaign.selectedImages || [];
    const indexesToDownload =
      selectedPhotoIndexes && selectedPhotoIndexes.length > 0
        ? selectedPhotoIndexes
        : allImages.map((_, i) => i);

    const approvedPhotoNames: string[] = [];

    for (let i = 0; i < allImages.length; i++) {
      if (!indexesToDownload.includes(i)) continue;
      const imgUrl = allImages[i];
      if (!imgUrl) continue;

      const photoName = `photo_${i + 1}.jpg`;
      const origPhotoPath = path.join(originalMediaDir, photoName);
      const chatgptPhotoPath = path.join(chatgptCreativeDir, photoName);

      try {
        const photoRes = await fetch(imgUrl);
        if (photoRes.ok) {
          const buffer = Buffer.from(await photoRes.arrayBuffer());
          fs.writeFileSync(origPhotoPath, buffer);
          fs.writeFileSync(chatgptPhotoPath, buffer);
          approvedPhotoNames.push(photoName);
        }
      } catch (imgErr) {
        console.error(`Failed to download image ${i + 1}:`, imgErr);
      }
    }

    // 3. Copy Brand Logo to chatgpt_creative/ and root
    const sourceLogoPath = path.join(process.cwd(), "public", "brand_logo.png");
    if (fs.existsSync(sourceLogoPath)) {
      fs.copyFileSync(sourceLogoPath, path.join(chatgptCreativeDir, "brand_logo.png"));
      fs.copyFileSync(sourceLogoPath, path.join(targetFolder, "brand_logo.png"));
    }

    // 4. Generate the exact chatgpt_creative_brief.json Schema
    const verifiedFacts = [
      `${campaign.service} completed in ${campaign.city}, MS`,
      ...campaign.factValidation.extractedClaims,
    ];

    const chatgptBrief = {
      client: "Born Again Remodeling & Roofing",
      project_name: projectName || `${campaign.city} ${campaign.service}`,
      city: `${campaign.city}, MS`,
      service: campaign.service,
      verified_facts: verifiedFacts,
      technician: campaign.technician,
      approved_photos: approvedPhotoNames,
      privacy_review: campaign.factValidation.isValid ? "passed" : "needs_review",
      brand: {
        primary_style: "dark navy and gold",
        tone: "premium, trustworthy, faith-centered, professional",
        company_name: "Born Again Remodeling & Roofing",
        phone: BRAND_CONFIG.verifiedPhone,
        website: "bornagainroofing.com",
        official_logo_url: BRAND_CONFIG.officialLogoUrl,
        brand_colors: {
          primary_navy: "#0c0f16",
          card_navy: "#131826",
          accent_gold: "#f3c973",
          deep_gold: "#b88630",
        },
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

    const briefJsonStr = JSON.stringify(chatgptBrief, null, 2);
    fs.writeFileSync(path.join(chatgptCreativeDir, "chatgpt_creative_brief.json"), briefJsonStr, "utf-8");
    fs.writeFileSync(path.join(targetFolder, "chatgpt_creative_brief.json"), briefJsonStr, "utf-8");

    // 5. Campaign Summary JSON
    const summaryData = {
      campaignId: campaign.id,
      city: campaign.city,
      service: campaign.service,
      technician: campaign.technician,
      jobDate: campaign.jobDate,
      opportunityScore: campaign.opportunityScore,
      creativeType,
      landingPageUrl: campaign.landingPageUrl,
      factValidation: campaign.factValidation,
      approvedPhotosCount: approvedPhotoNames.length,
      exportedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(targetFolder, "campaign_summary.json"), JSON.stringify(summaryData, null, 2), "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "campaign_summary.json"), JSON.stringify(summaryData, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      folderPath: targetFolder,
      chatgptCreativeDir,
      folderName,
      downloadedPhotosCount: approvedPhotoNames.length,
      approvedPhotos: approvedPhotoNames,
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message || "Failed to export campaign files" }, { status: 500 });
  }
}
