import { RawPin, SanitizedSocialJob } from "./storage/schema";
import {
  sanitizeLocation,
  sanitizeAuthorName,
  getSocialSafeLandingUrl,
  calculateContentHash,
  calculatePhotosHash,
  detectPrivacyRisks,
  normalizeImageUrl,
} from "./sanitizer";
import { calculateOpportunityScore } from "./scoring";

export function clusterAndSanitizePins(rawPins: RawPin[], recentCities: string[] = [], recentServices: string[] = []): SanitizedSocialJob[] {
  // 1 Pin = 1 Job (Every field check-in is kept distinct with its own photos, location, and description)
  const socialJobs: SanitizedSocialJob[] = rawPins.map((pin) => {
    const loc = sanitizeLocation(pin.location);
    const authorName = sanitizeAuthorName(pin.author);
    const safeUrl = getSocialSafeLandingUrl(pin.service, loc.city);

    // Normalize images: resolve any relative paths like /images/job_XXXXXX.jpg to absolute live URLs
    const rawImages = pin.images && Array.isArray(pin.images) ? pin.images : [];
    const allImages: string[] = rawImages
      .filter(Boolean)
      .map((img) => normalizeImageUrl(img));

    const desc = pin.description?.trim() || "";
    const detailed = pin.detailedExplanation?.trim() || "";

    const jobId = `job_${pin.id}`;
    const contentHash = calculateContentHash(desc);
    const photosHash = calculatePhotosHash(allImages);
    const privacyFlags = detectPrivacyRisks(desc, allImages);

    // Calculate Opportunity Score (COS)
    const { totalScore, breakdown } = calculateOpportunityScore({
      photoCount: allImages.length,
      description: desc,
      service: pin.service,
      city: loc.city,
      date: pin.date,
      recentCities,
      recentServices,
    });

    return {
      sourcePinId: pin.id,
      projectClusterId: jobId,
      city: loc.city,
      state: loc.state,
      service: pin.service,
      date: pin.date,
      authorName,
      description: desc,
      detailedExplanation: detailed || undefined,
      cleanImages: allImages,
      photoCount: allImages.length,
      socialSafeUrl: safeUrl,
      contentHash,
      photosHash,
      opportunityScore: totalScore,
      scoreBreakdown: breakdown,
      privacyFlags,
      clusteredPinCount: 1,
    };
  });

  // Sort by highest opportunity score first
  return socialJobs.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

