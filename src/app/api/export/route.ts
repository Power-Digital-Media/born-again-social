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

    // 1. Write Text Post Files to social_copy/ and chatgpt_creative/ (with Actual Work Description included)
    const descContent = campaign.description || `Completed custom ${campaign.service} project in ${campaign.city}, MS.`;
    const detailedContent = campaign.detailedExplanation ? `\n\nDETAILED CRAFTSMANSHIP NOTES:\n${campaign.detailedExplanation}` : "";

    const formatPostFile = (platformName: string, postCopy: string) => {
      return `================================================================================\n` +
        `PROJECT: ${campaign.service} in ${campaign.city}, MS (${campaign.jobDate || dateStr})\n` +
        `TECHNICIAN: ${campaign.technician || "Born Again Team"}\n` +
        `================================================================================\n` +
        `ACTUAL WORK DONE & FIELD CHECK-IN NOTES:\n` +
        `--------------------------------------------------------------------------------\n` +
        `${descContent}${detailedContent}\n\n` +
        `================================================================================\n` +
        `READY-TO-USE ${platformName.toUpperCase()} POST COPY:\n` +
        `================================================================================\n` +
        `${postCopy}\n`;
    };

    const fbContent = formatPostFile("Facebook", campaign.facebookCopy);
    const igContent = formatPostFile("Instagram", campaign.instagramCopy);
    const gbpContent = formatPostFile("Google Business Profile", campaign.gbpCopy);

    const fbFilePath = path.join(socialCopyDir, "facebook_post.txt");
    const igFilePath = path.join(socialCopyDir, "instagram_post.txt");
    const gbpFilePath = path.join(socialCopyDir, "google_business_profile.txt");

    fs.writeFileSync(fbFilePath, fbContent, "utf-8");
    fs.writeFileSync(igFilePath, igContent, "utf-8");
    fs.writeFileSync(gbpFilePath, gbpContent, "utf-8");

    // Also mirror text posts inside chatgpt_creative/ for convenience
    fs.writeFileSync(path.join(chatgptCreativeDir, "facebook_post.txt"), fbContent, "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "instagram_post.txt"), igContent, "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "google_business_profile.txt"), gbpContent, "utf-8");

    // 1.5 Write Comprehensive Work Description Text Files to all relevant directories
    const verifiedFactsList = [
      `${campaign.service} completed in ${campaign.city}, MS`,
      ...(campaign.factValidation?.extractedClaims || []),
    ];

    const workDescText = `================================================================================\n` +
      `BORN AGAIN REMODELING & ROOFING — WORK DESCRIPTION & FIELD NOTES\n` +
      `================================================================================\n` +
      `PROJECT:        ${campaign.service} in ${campaign.city}, MS\n` +
      `LOCATION:       ${campaign.city}, Mississippi (Central MS)\n` +
      `DATE:           ${campaign.jobDate || dateStr}\n` +
      `TECHNICIAN:     ${campaign.technician || "Born Again Remodeling & Roofing Team"}\n` +
      `PHONE:          (601) 573-6178\n` +
      `WEBSITE:        https://www.bornagainroofing.com\n\n` +
      `--------------------------------------------------------------------------------\n` +
      `SCOPE OF WORK DONE & FIELD CHECK-IN NOTES:\n` +
      `--------------------------------------------------------------------------------\n` +
      `${descContent}\n` +
      `${detailedContent}\n` +
      `--------------------------------------------------------------------------------\n` +
      `VERIFIED PROJECT FACTS:\n` +
      `--------------------------------------------------------------------------------\n` +
      `${verifiedFactsList.map((f) => `• ${f}`).join("\n")}\n\n` +
      `--------------------------------------------------------------------------------\n` +
      `HOW TO CREATE SOCIAL POSTS AROUND THIS WORK:\n` +
      `--------------------------------------------------------------------------------\n` +
      `1. FOCUS ON ACTUAL WORK DONE: Highlight the exact repair, replacement, or remodeling tasks completed above.\n` +
      `2. LOCAL RELEVANCE: Emphasize ${campaign.city}, MS to boost local SEO and neighbor trust.\n` +
      `3. REAL PHOTOS: Pair this copy with the real project photos located in the 'original_media/' folder.\n` +
      `4. CALL TO ACTION: Remind clients to call (601) 573-6178 for free estimates or visit bornagainroofing.com.\n` +
      `================================================================================\n`;

    // Prompt specifically designed for ChatGPT / Claude to write posts around the work done
    const createPostPromptText = `PROMPT TO GENERATE SOCIAL POSTS AROUND THIS WORK:\n\n` +
      `"You are an expert social media manager for Born Again Remodeling & Roofing, a premier, faith-centered contracting company in Central Mississippi.\n\n` +
      `Here is the work description for a recently completed job:\n\n` +
      `Location: ${campaign.city}, MS\n` +
      `Service: ${campaign.service}\n` +
      `Technician: ${campaign.technician || "Born Again Team"}\n` +
      `Date: ${campaign.jobDate || dateStr}\n` +
      `Work Completed: ${descContent}\n` +
      `${campaign.detailedExplanation ? `Additional Notes: ${campaign.detailedExplanation}\n` : ""}\n` +
      `Company Phone: (601) 573-6178\n` +
      `Website: bornagainroofing.com\n\n` +
      `Please create 3 custom social media posts centered around the specific work that was done:\n` +
      `1. Facebook Post: Engaging storytelling focusing on the craftsmanship, problem solved, and customer peace of mind.\n` +
      `2. Instagram Caption: Punchy, visual-focused caption with bulleted project highlights and hashtags for Mississippi home improvement.\n` +
      `3. Google Business Profile Post: High-SEO local update (under 1500 chars, no phone number in text per Google policy) detailing the service and area served."\n`;

    // Write to root folder
    fs.writeFileSync(path.join(targetFolder, "work_description.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(targetFolder, "WORK_DESCRIPTION.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(targetFolder, "job_description.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(targetFolder, "CREATE_POST_PROMPT.txt"), createPostPromptText, "utf-8");

    // Write to social_copy/
    fs.writeFileSync(path.join(socialCopyDir, "work_description.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(socialCopyDir, "job_description.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(socialCopyDir, "CREATE_POST_PROMPT.txt"), createPostPromptText, "utf-8");

    // Write to chatgpt_creative/
    fs.writeFileSync(path.join(chatgptCreativeDir, "work_description.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "job_description.txt"), workDescText, "utf-8");
    fs.writeFileSync(path.join(chatgptCreativeDir, "CREATE_POST_PROMPT.txt"), createPostPromptText, "utf-8");

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
      job_description: campaign.description,
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
