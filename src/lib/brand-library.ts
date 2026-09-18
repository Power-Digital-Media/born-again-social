export interface BrandPillar {
  title: string;
  category?: "roofing" | "remodeling" | "all";
  theme: string;
  scripture?: {
    verse: string;
    text: string;
  };
  samplePhrases: string[];
}

export const BRAND_CONFIG = {
  name: "Born Again Remodeling & Roofing",
  shortName: "Born Again Remodeling & Roofing",
  verifiedPhone: "(601) 573-6178",
  websiteUrl: "https://www.bornagainroofing.com",
  officialLogoUrl: "https://www.bornagainroofing.com/images/logo.png",
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
    category: "all",
    theme: "Integrity, honesty, and fair estimates without cutting corners.",
    scripture: {
      verse: "Proverbs 11:1",
      text: "The Lord detests dishonest scales, but accurate weights find favor with him.",
    },
    samplePhrases: [
      "Honest estimates, transparent pricing, and quality you can stand on.",
      "We treat every home and project like it's for our own family.",
      "No hidden surprises—just faithful work done right the first time.",
    ],
  },
  {
    title: "Master Craftsmanship & Remodeling Excellence",
    category: "remodeling",
    theme: "High standard of workmanship, beautiful design, and custom home transformations.",
    scripture: {
      verse: "Colossians 3:23",
      text: "Whatever you do, work at it with all your heart, as working for the Lord.",
    },
    samplePhrases: [
      "Transforming living spaces with precision craftsmanship and timeless design.",
      "Custom renovations and upgrades built to elevate your everyday living.",
      "Dedicated craftsmanship that restores beauty and functionality to your home.",
    ],
  },
  {
    title: "Master Roofing & Mississippi Storm Resilience",
    category: "roofing",
    theme: "High standard of workmanship, durable materials, and storm defense.",
    scripture: {
      verse: "1 Corinthians 3:10",
      text: "By the grace God has given me, I laid a foundation as a wise builder.",
    },
    samplePhrases: [
      "Built with high-grade materials to withstand Mississippi storms.",
      "Precision installation down to every shingle, nail, flashing, and ridge vent.",
      "Dedicated craftsmanship that protects what matters most under your roof.",
    ],
  },
  {
    title: "Rebuilding & Home Transformation",
    category: "all",
    theme: "Restoring homes, fresh starts, whole-house remodels and roof replacements.",
    scripture: {
      verse: "Ezra 5:11",
      text: "We are the servants of the God of heaven and earth, and we are rebuilding the house.",
    },
    samplePhrases: [
      "Giving homes across Central Mississippi a fresh start and elevated beauty.",
      "Transforming spaces into durable, comfortable, and beautiful assets for your family.",
      "Proudly serving our Central Mississippi neighbors with hands and hearts ready to build.",
    ],
  },
  {
    title: "Central Mississippi Community Roots",
    category: "all",
    theme: "Local pride, prompt response, and serving neighbors across the Jackson metro.",
    samplePhrases: [
      "Proudly serving homeowners throughout Madison, Brandon, Pearl, Flowood, Jackson, and beyond.",
      "Local Mississippi crews who know our climate, architecture, and building standards.",
      "Your local neighbors for all roofing and remodeling needs.",
    ],
  },
];

export function getRandomBrandPillar(service?: string, includeScriptureProbability = 0.5): BrandPillar {
  const isRemodel = service && /remodel|kitchen|bath|renovat|floor|cabinet|deck|fence|paint|sheetrock/i.test(service);
  const isRoof = service && /roof|shingle|leak|gutter|tarp|storm/i.test(service);

  let eligible = BRAND_PILLARS.filter((p) => {
    if (isRemodel && p.category === "roofing") return false;
    if (isRoof && p.category === "remodeling") return false;
    return true;
  });

  if (includeScriptureProbability <= 0.5) {
    const withoutScripture = eligible.filter((p) => !p.scripture || p.title.includes("Community"));
    if (withoutScripture.length > 0) eligible = withoutScripture;
  }

  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx] || BRAND_PILLARS[0];
}

