export interface ScoringParams {
  photoCount: number;
  description: string;
  service: string;
  city: string;
  date: string;
  recentCities?: string[];
  recentServices?: string[];
}

export interface ScoreBreakdown {
  photoScore: number;
  beforeAfterScore: number;
  completenessScore: number;
  descriptionScore: number;
  recencyScore: number;
  rotationPenalty: number;
}

export function calculateOpportunityScore({
  photoCount,
  description,
  service,
  city,
  date,
  recentCities = [],
  recentServices = [],
}: ScoringParams): { totalScore: number; breakdown: ScoreBreakdown } {
  // 1. Photo Score (Max 35)
  let photoScore = 0;
  if (photoCount >= 4) photoScore = 35;
  else if (photoCount === 3) photoScore = 30;
  else if (photoCount === 2) photoScore = 22;
  else if (photoCount === 1) photoScore = 10;

  // 2. Before/After & Transformation Potential (Max 20)
  let beforeAfterScore = 5;
  const lowerDesc = (description || "").toLowerCase();
  const lowerService = (service || "").toLowerCase();
  
  if (
    lowerDesc.includes("installed new") ||
    lowerDesc.includes("replaced") ||
    lowerDesc.includes("remodel") ||
    lowerDesc.includes("tear off") ||
    lowerDesc.includes("transformation") ||
    lowerDesc.includes("restoration") ||
    lowerService.includes("remodel") ||
    lowerService.includes("roof install")
  ) {
    beforeAfterScore = 20;
  } else if (lowerDesc.includes("repaired") || lowerDesc.includes("maintenance")) {
    beforeAfterScore = 12;
  }

  // 3. Project Completeness & Material Specificity (Max 15)
  let completenessScore = 0;
  const materialKeywords = [
    "gaf", "hdz", "timberline", "architectural", "shingle",
    "metal", "standing seam", "silicone", "tpo", "flashing",
    "ridge vent", "decking", "fencing", "tile", "sheetrock",
    "cabinets", "gutters", "drip edge", "underlayment"
  ];
  let matchedMaterials = 0;
  for (const m of materialKeywords) {
    if (lowerDesc.includes(m)) matchedMaterials++;
  }
  if (matchedMaterials >= 2) completenessScore = 15;
  else if (matchedMaterials === 1) completenessScore = 10;
  else completenessScore = 5;

  // 4. Description Depth (Max 15)
  let descriptionScore = 0;
  if (lowerDesc.length > 150) descriptionScore = 15;
  else if (lowerDesc.length > 75) descriptionScore = 10;
  else if (lowerDesc.length > 30) descriptionScore = 5;

  // 5. Recency (Max 15)
  let recencyScore = 5;
  const parsedDate = Date.parse(date);
  if (!isNaN(parsedDate)) {
    const daysAgo = (Date.now() - parsedDate) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 14) recencyScore = 15;
    else if (daysAgo <= 60) recencyScore = 10;
    else recencyScore = 5;
  }

  // 6. Rotation Cooldown Penalty (Up to -30)
  let rotationPenalty = 0;
  if (recentCities.includes(city)) {
    rotationPenalty += 15;
  }
  if (recentServices.includes(service)) {
    rotationPenalty += 15;
  }

  const rawTotal = photoScore + beforeAfterScore + completenessScore + descriptionScore + recencyScore - rotationPenalty;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  return {
    totalScore,
    breakdown: {
      photoScore,
      beforeAfterScore,
      completenessScore,
      descriptionScore,
      recencyScore,
      rotationPenalty,
    },
  };
}
