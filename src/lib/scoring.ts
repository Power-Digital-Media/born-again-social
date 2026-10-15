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
  else if (photoCount === 1) photoScore = 12;

  // 2. Before/After & Transformation Potential (Max 20)
  let beforeAfterScore = 8;
  const lowerDesc = (description || "").toLowerCase();
  const lowerService = (service || "").toLowerCase();
  const combinedText = `${lowerService} ${lowerDesc}`;

  if (
    combinedText.includes("installed new") ||
    combinedText.includes("replacement") ||
    combinedText.includes("replaced") ||
    combinedText.includes("remodel") ||
    combinedText.includes("tear off") ||
    combinedText.includes("transformation") ||
    combinedText.includes("restoration") ||
    combinedText.includes("roof install") ||
    combinedText.includes("new construction") ||
    combinedText.includes("building") ||
    combinedText.includes("demo")
  ) {
    beforeAfterScore = 20;
  } else if (
    combinedText.includes("repair") ||
    combinedText.includes("repaired") ||
    combinedText.includes("inspect") ||
    combinedText.includes("damage") ||
    combinedText.includes("paint") ||
    combinedText.includes("stain") ||
    combinedText.includes("siding") ||
    combinedText.includes("framing") ||
    combinedText.includes("plumbing") ||
    combinedText.includes("maintenance")
  ) {
    beforeAfterScore = 16;
  }

  // 3. Project Completeness & Material Specificity (Max 15)
  let completenessScore = 0;
  const materialKeywords = [
    "gaf", "hdz", "timberline", "owens corning", "duration", "architectural", "shingle",
    "metal", "standing seam", "silicone", "tpo", "flashing",
    "ridge vent", "decking", "deck", "fencing", "tile", "sheetrock", "drywall",
    "cabinets", "gutters", "siding", "soffit", "fascia", "drip edge", "underlayment",
    "trim", "paint", "stain", "porch", "tarp", "plumbing", "trench", "framing", "shutter", "door"
  ];
  let matchedMaterials = 0;
  for (const m of materialKeywords) {
    if (combinedText.includes(m)) matchedMaterials++;
  }
  if (matchedMaterials >= 2) completenessScore = 15;
  else if (matchedMaterials === 1) completenessScore = 12;
  else completenessScore = 6;

  // 4. Description Depth (Max 10)
  let descriptionScore = 0;
  if (lowerDesc.length > 120) descriptionScore = 10;
  else if (lowerDesc.length > 45) descriptionScore = 8;
  else if (lowerDesc.length >= 10) descriptionScore = 6;

  // 5. Recency (Max 25 — prioritize fresh daily crew check-ins over year-old archive pins)
  let recencyScore = 0;
  const parsedDate = Date.parse(date);
  if (!isNaN(parsedDate)) {
    const daysAgo = (Date.now() - parsedDate) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 7) recencyScore = 25;
    else if (daysAgo <= 21) recencyScore = 22;
    else if (daysAgo <= 45) recencyScore = 16;
    else if (daysAgo <= 90) recencyScore = 8;
    else recencyScore = 0;
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
