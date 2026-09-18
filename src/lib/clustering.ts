import { RawPin, SanitizedSocialJob } from "./storage/schema";
import {
  sanitizeLocation,
  sanitizeAuthorName,
  getSocialSafeLandingUrl,
  calculateContentHash,
  calculatePhotosHash,
  detectPrivacyRisks,
} from "./sanitizer";
import { calculateOpportunityScore } from "./scoring";

// Helper to normalize dates for clustering
function parsePinDate(dateStr: string): number {
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

// Check if two pins belong to the same project cluster
function arePinsInSameCluster(a: RawPin, b: RawPin): boolean {
  // Same author and identical city
  const locA = sanitizeLocation(a.location).city.toLowerCase();
  const locB = sanitizeLocation(b.location).city.toLowerCase();
  if (locA !== locB) return false;

  // Matching or similar service
  const servA = a.service.toLowerCase();
  const servB = b.service.toLowerCase();
  const sameService = servA === servB || servA.includes(servB) || servB.includes(servA);
  if (!sameService) return false;

  // Date proximity (within 4 days / 96 hours)
  const timeA = parsePinDate(a.date);
  const timeB = parsePinDate(b.date);
  if (timeA > 0 && timeB > 0) {
    const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);
    if (diffHours <= 96) {
      return true;
    }
  }

  // Exact coordinates match (if raw latitude/longitude was present)
  if (a.latitude && b.latitude && a.longitude && b.longitude) {
    const latDiff = Math.abs(a.latitude - b.latitude);
    const lngDiff = Math.abs(a.longitude - b.longitude);
    if (latDiff < 0.001 && lngDiff < 0.001) {
      return true;
    }
  }

  return false;
}

export function clusterAndSanitizePins(rawPins: RawPin[], recentCities: string[] = [], recentServices: string[] = []): SanitizedSocialJob[] {
  const clusters: RawPin[][] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < rawPins.length; i++) {
    const pin = rawPins[i];
    if (assigned.has(pin.id)) continue;

    const currentCluster: RawPin[] = [pin];
    assigned.add(pin.id);

    for (let j = i + 1; j < rawPins.length; j++) {
      const candidate = rawPins[j];
      if (assigned.has(candidate.id)) continue;

      if (arePinsInSameCluster(pin, candidate)) {
        currentCluster.push(candidate);
        assigned.add(candidate.id);
      }
    }

    clusters.push(currentCluster);
  }

  // Convert each cluster into a SanitizedSocialJob
  const socialJobs: SanitizedSocialJob[] = clusters.map((cluster) => {
    // Primary pin is usually the newest or one with longest description
    cluster.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
    const primary = cluster[0];

    const loc = sanitizeLocation(primary.location);
    const authorName = sanitizeAuthorName(primary.author);
    const safeUrl = getSocialSafeLandingUrl(primary.service, loc.city);

    // Merge and deduplicate all photos from the cluster
    const allImages: string[] = [];
    for (const p of cluster) {
      if (p.images && Array.isArray(p.images)) {
        for (const img of p.images) {
          if (img && !allImages.includes(img)) {
            allImages.push(img);
          }
        }
      }
    }

    // Combine descriptions if distinct
    const descriptions = cluster
      .map((p) => p.description?.trim())
      .filter(Boolean);
    const uniqueDesc = Array.from(new Set(descriptions)).join(" ");

    const clusterId = `proj_${loc.city.toLowerCase().replace(/\s+/g, "")}_${primary.id}_${allImages.length}`;
    const contentHash = calculateContentHash(uniqueDesc);
    const photosHash = calculatePhotosHash(allImages);
    const privacyFlags = detectPrivacyRisks(uniqueDesc, allImages);

    // Calculate Opportunity Score (COS)
    const { totalScore, breakdown } = calculateOpportunityScore({
      photoCount: allImages.length,
      description: uniqueDesc,
      service: primary.service,
      city: loc.city,
      date: primary.date,
      recentCities,
      recentServices,
    });

    return {
      sourcePinId: primary.id,
      projectClusterId: clusterId,
      city: loc.city,
      state: loc.state,
      service: primary.service,
      date: primary.date,
      authorName,
      description: uniqueDesc,
      cleanImages: allImages,
      photoCount: allImages.length,
      socialSafeUrl: safeUrl,
      contentHash,
      photosHash,
      opportunityScore: totalScore,
      scoreBreakdown: breakdown,
      privacyFlags,
      clusteredPinCount: cluster.length,
    };
  });

  // Sort by highest opportunity score first
  return socialJobs.sort((a, b) => b.opportunityScore - a.opportunityScore);
}
