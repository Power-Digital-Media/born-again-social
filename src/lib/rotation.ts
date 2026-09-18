import { SanitizedSocialJob } from "./storage/schema";
import { storage } from "./storage";

export const SERVICE_ROTATION_ORDER = [
  "Residential Roofing",
  "Kitchen Remodeling",
  "Metal Roofing",
  "Bathroom Remodeling",
  "Roof install",
  "General Remodeling",
  "Siding & Gutters",
  "Whole House Remodeling",
];

export const CITY_ROTATION_ORDER = [
  "Madison",
  "Brandon",
  "Pearl",
  "Jackson",
  "Flowood",
  "Byram",
  "Clinton",
  "Ridgeland",
];

export async function pickNextOpportunity(jobs: SanitizedSocialJob[]): Promise<SanitizedSocialJob | null> {
  if (jobs.length === 0) return null;

  const recentCities = await storage.getRecentPostedCities(3);
  const recentServices = await storage.getRecentPostedServices(3);

  // Filter out jobs already published
  const campaigns = await storage.getCampaigns();
  const publishedClusterIds = new Set(
    campaigns.filter((c) => c.status === "published" || c.status === "approved").map((c) => c.projectClusterId)
  );

  const available = jobs.filter((j) => !publishedClusterIds.has(j.projectClusterId));
  if (available.length === 0) return jobs[0]; // fallback if all touched

  // Score available jobs considering live rotation penalties
  const candidates = available.map((job) => {
    let rotationBonus = 0;
    if (!recentCities.includes(job.city)) rotationBonus += 10;
    if (!recentServices.includes(job.service)) rotationBonus += 10;
    return {
      job,
      adjustedScore: job.opportunityScore + rotationBonus,
    };
  });

  candidates.sort((a, b) => b.adjustedScore - a.adjustedScore);
  return candidates[0].job;
}
