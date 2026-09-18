export interface BrandPillar {
  title: string;
  theme: string;
  scripture?: {
    verse: string;
    text: string;
  };
  samplePhrases: string[];
}

export const BRAND_CONFIG = {
  name: "Born Again Remodeling & Roofing",
  shortName: "Born Again Roofing",
  verifiedPhone: "(601) 573-6178",
  websiteUrl: "https://www.bornagainroofing.com",
  brandColors: {
    navyDark: "#0c0f16",
    navyCard: "#131826",
    goldMetallic: "#f3c973",
    goldDeep: "#b88630",
    textMuted: "#94a3b8",
  },
  
  // Platform-Specific CTA Rules
  platformRules: {
    facebook: {
      includePhone: true,
      includeWebsiteLink: true,
      ctaStyle: "conversational_call",
    },
    instagram: {
      includePhone: true,
      includeWebsiteLink: false, // IG captions are not hyperlinked; directs to bio/call
      ctaStyle: "profile_or_call",
    },
    gbp: {
      includePhone: false, // STRICT GOOGLE POLICY: Do not put phone numbers in GBP post text
      includeWebsiteLink: true, // Tied to "Learn More" or "Call Now" native action button
      ctaStyle: "gbp_native_action",
    },
  },
};

export const BRAND_PILLARS: BrandPillar[] = [
  {
    title: "Honest Stewardship & Transparent Pricing",
    theme: "Integrity, honesty, and fair estimates without cutting corners.",
    scripture: {
      verse: "Proverbs 11:1",
      text: "The Lord detests dishonest scales, but accurate weights find favor with him.",
    },
    samplePhrases: [
      "Honest estimates, transparent pricing, and quality you can stand on.",
      "We treat every roof like it's protecting our own family.",
      "No hidden surprises—just faithful work done right the first time.",
    ],
  },
  {
    title: "Master Craftsmanship & Quality That Lasts",
    theme: "High standard of workmanship, durable materials, and storm resilience.",
    scripture: {
      verse: "Colossians 3:23",
      text: "Whatever you do, work at it with all your heart, as working for the Lord.",
    },
    samplePhrases: [
      "Built with high-grade materials to withstand Mississippi storms.",
      "Precision installation down to every nail, flashing, and ridge vent.",
      "Dedicated craftsmanship that restores peace of mind to homeowners.",
    ],
  },
  {
    title: "Rebuilding & Home Transformation",
    theme: "Restoring homes, fresh starts, whole-house remodels and roof replacements.",
    scripture: {
      verse: "Ezra 5:11",
      text: "We are the servants of the God of heaven and earth, and we are rebuilding the house.",
    },
    samplePhrases: [
      "Giving homes across Central Mississippi a fresh start and strong defense.",
      "Transforming worn-out roofs into durable, beautiful architectural assets.",
      "Proudly serving our Central Mississippi neighbors with hands and hearts ready to build.",
    ],
  },
  {
    title: "Central Mississippi Community Roots",
    theme: "Local pride, prompt response, and serving neighbors across the Jackson metro.",
    samplePhrases: [
      "Proudly serving homeowners throughout Madison, Brandon, Pearl, Flowood, Jackson, and beyond.",
      "Local Mississippi crews who know our climate, storms, and building standards.",
      "Your local neighbors for all roofing and remodeling needs.",
    ],
  },
];

export function getRandomBrandPillar(includeScriptureProbability = 0.5): BrandPillar {
  const eligible = includeScriptureProbability > 0.5
    ? BRAND_PILLARS
    : BRAND_PILLARS.filter((p) => p.title.includes("Community") || p.title.includes("Craftsmanship"));
  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx];
}
