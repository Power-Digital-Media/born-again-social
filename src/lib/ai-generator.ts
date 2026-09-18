import { SanitizedSocialJob, SocialCampaign } from "./storage/schema";
import { BRAND_CONFIG, getRandomBrandPillar } from "./brand-library";
import { generateControlledHashtags } from "./hashtag-taxonomy";
import { validateSocialCopy } from "./fact-validator";

export async function buildCampaignPackage(job: SanitizedSocialJob): Promise<SocialCampaign> {
  const serviceTitle = job.service || "Roofing & Remodeling";
  const pillar = getRandomBrandPillar(serviceTitle, 0.6);
  const hashtags = generateControlledHashtags({
    city: job.city,
    service: job.service,
    maxTags: 7,
  });

  const city = job.city;
  const techName = job.authorName;
  const safeLandingUrl = job.socialSafeUrl;
  const verifiedPhone = BRAND_CONFIG.verifiedPhone;

  // Determine service specialty
  const isRemodeling = /remodel|kitchen|bath|renovat|floor|cabinet|deck|fence|paint|sheetrock|carpentry|drywall/i.test(serviceTitle);
  const isRoofing = /roof|shingle|leak|gutter|tarp|storm/i.test(serviceTitle);

  const defaultDesc = isRemodeling
    ? `Completed custom ${serviceTitle.toLowerCase()} renovation in ${city}, MS with premium craftsmanship.`
    : `Completed professional ${serviceTitle.toLowerCase()} project in ${city}, MS with durable weather protection.`;
  const desc = job.description || defaultDesc;

  const scriptureBlock = pillar.scripture
    ? `\n\n“${pillar.scripture.text}” — ${pillar.scripture.verse}`
    : "";

  // 1. Facebook Copy (Storytelling, Craftsmanship, Community, Verified Phone & Link)
  let facebookCopy = "";
  if (isRemodeling) {
    facebookCopy = `🔨 Fresh Remodeling Project Completed in ${city}, MS! 🏡✨\n\n` +
      `Our crew just wrapped up this custom ${serviceTitle.toLowerCase()} project for local Mississippi homeowners. ` +
      `${desc}\n\n` +
      `At Born Again Remodeling & Roofing, we believe in honest stewardship, transparent pricing, and master craftsmanship that transforms living spaces and stands the test of time.${scriptureBlock}\n\n` +
      `👷 Crafted with care by ${techName} & the Born Again team.\n\n` +
      `📞 Ready to elevate or renovate your home? Call us directly at ${verifiedPhone} for your free consultation and honest estimate.\n` +
      `🌐 Learn more: ${safeLandingUrl}\n\n` +
      hashtags.join(" ");
  } else {
    facebookCopy = `🔨 Fresh Roofing Project Completed in ${city}, MS! 🏡✨\n\n` +
      `Our crew just wrapped up this ${serviceTitle.toLowerCase()} project for local Mississippi homeowners. ` +
      `${desc}\n\n` +
      `At Born Again Remodeling & Roofing, we believe in honest stewardship, transparent pricing, and quality craftsmanship built to weather any Mississippi storm.${scriptureBlock}\n\n` +
      `👷 Crafted with care by ${techName} & the Born Again team.\n\n` +
      `📞 Ready to protect or inspect your roof? Call us directly at ${verifiedPhone} for your free inspection and honest estimate.\n` +
      `🌐 Learn more: ${safeLandingUrl}\n\n` +
      hashtags.join(" ");
  }

  // 2. Instagram Copy (Visual Hook, Punchy Bullets, Carousel Cue, Controlled Hashtags)
  const carouselPrompt = job.photoCount > 1 ? `📸 Swipe through to see the progress & final craftsmanship 👉\n\n` : ``;
  let instagramCopy = "";
  if (isRemodeling) {
    instagramCopy = `Another beautiful ${serviceTitle.toLowerCase()} transformation in ${city}, MS! 🏠🔨\n\n` +
      carouselPrompt +
      `📍 Location: ${city}, Mississippi\n` +
      `📂 Project: ${serviceTitle}\n` +
      `👷 Technician: ${techName}\n\n` +
      `Project Highlights:\n${desc}\n\n` +
      `Elevating Central Mississippi homes with faith, integrity, and custom craftsmanship.${scriptureBlock}\n\n` +
      `📲 Tap the link in our bio or call ${verifiedPhone} for a free estimate on your next home remodeling or renovation project!\n\n` +
      hashtags.join(" ");
  } else {
    instagramCopy = `Another beautiful ${serviceTitle.toLowerCase()} project in ${city}, MS! 🏠🔨\n\n` +
      carouselPrompt +
      `📍 Location: ${city}, Mississippi\n` +
      `📂 Project: ${serviceTitle}\n` +
      `👷 Technician: ${techName}\n\n` +
      `Project Highlights:\n${desc}\n\n` +
      `Protecting Central Mississippi homes with faith, integrity, and durable craftsmanship.${scriptureBlock}\n\n` +
      `📲 Tap the link in our bio or call ${verifiedPhone} for a free estimate on your next roofing project!\n\n` +
      hashtags.join(" ");
  }

  // 3. Google Business Profile (GBP) Copy (High-SEO, STRICTLY NO PHONE NUMBERS in text)
  let gbpCopy = "";
  if (isRemodeling) {
    gbpCopy = `🛠️ New ${serviceTitle} Completed in ${city}, MS\n\n` +
      `Born Again Remodeling and Roofing recently completed a custom ${serviceTitle.toLowerCase()} project in ${city}, MS.\n\n` +
      `Scope of Work:\n${desc}\n\n` +
      `Serving Jackson, Pearl, Brandon, Madison, Flowood, Byram, and surrounding Central Mississippi communities with premium home remodeling, renovations, and dependable craftsmanship.\n\n` +
      `👉 Click 'Learn More' or 'Call Now' to speak with our local team and schedule an in-home remodeling consultation or estimate.`;
  } else {
    gbpCopy = `🛠️ New ${serviceTitle} Completed in ${city}, MS\n\n` +
      `Born Again Remodeling and Roofing recently completed a ${serviceTitle.toLowerCase()} project in ${city}, MS.\n\n` +
      `Scope of Work:\n${desc}\n\n` +
      `Serving Jackson, Pearl, Brandon, Madison, Flowood, Byram, and surrounding Central Mississippi communities with durable roofing and premium home exterior protection.\n\n` +
      `👉 Click 'Learn More' or 'Call Now' to speak with our local team and schedule a comprehensive roof inspection or consultation.`;
  }

  // Determine Recommended Visual Layout
  let recommendedLayout: SocialCampaign["recommendedLayout"] = "single_hero";
  if (job.photoCount >= 3) {
    recommendedLayout = "multi_carousel";
  } else if (job.photoCount === 2) {
    recommendedLayout = "before_after";
  }

  // 4. Two-Stage Fact Validation Check
  const fbVal = validateSocialCopy(facebookCopy, job, "facebook");
  const igVal = validateSocialCopy(instagramCopy, job, "instagram");
  const gbpVal = validateSocialCopy(gbpCopy, job, "gbp");

  const allUnsupported = [
    ...fbVal.unsupportedClaims,
    ...igVal.unsupportedClaims,
    ...gbpVal.unsupportedClaims,
  ];

  const campaignId = `camp_${Date.now()}_${job.sourcePinId}`;

  return {
    id: campaignId,
    projectClusterId: job.projectClusterId,
    sourcePinIds: [job.sourcePinId],
    city: job.city,
    service: job.service,
    jobDate: job.date,
    technician: job.authorName,
    description: desc,
    status: "generated",
    opportunityScore: job.opportunityScore,
    facebookCopy,
    instagramCopy,
    gbpCopy,
    selectedImages: job.cleanImages,
    recommendedLayout,
    hashtags,
    landingPageUrl: safeLandingUrl,
    callToAction: `Call ${verifiedPhone} or Visit ${safeLandingUrl}`,
    factValidation: {
      isValid: allUnsupported.length === 0,
      extractedClaims: Array.from(new Set([...fbVal.extractedClaims, ...igVal.extractedClaims])),
      unsupportedClaims: Array.from(new Set(allUnsupported)),
      confidence: Math.min(fbVal.confidence, igVal.confidence, gbpVal.confidence),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
