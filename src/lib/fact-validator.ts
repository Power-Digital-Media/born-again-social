import { SanitizedSocialJob } from "./storage/schema";
import { BRAND_CONFIG } from "./brand-library";

export interface ValidationResult {
  isValid: boolean;
  extractedClaims: string[];
  unsupportedClaims: string[];
  confidence: number;
}

// Key watchwords for risky claims
const RESTRICTED_CLAIM_PATTERNS = [
  { regex: /\b(\d+)\s*(year|yr)\s*warranty\b/i, type: "warranty" },
  { regex: /\blifetime\s*warranty\b/i, type: "warranty" },
  { regex: /\b(free|no[- ]cost)\s*(estimate|inspection|upgrade)\b/i, type: "pricing_claim" },
  { regex: /\b(\$\d+[\d,]*)\b/i, type: "price" },
  { regex: /\b(insurance\s*claim|deductible|covered\s*by\s*insurance)\b/i, type: "insurance" },
  { regex: /\b(master\s*elite|president['’]s\s*club|certified\s*contractor)\b/i, type: "certification" },
  { regex: /\b(completed\s*in\s*\d+\s*(day|hour|week)s?)\b/i, type: "duration" },
];

export function validateSocialCopy(
  generatedCopy: string,
  sourceJob: SanitizedSocialJob,
  platform: "facebook" | "instagram" | "gbp"
): ValidationResult {
  const extractedClaims: string[] = [];
  const unsupportedClaims: string[] = [];
  const sourceText = `${sourceJob.description} ${sourceJob.service} ${sourceJob.city}`.toLowerCase();

  // 1. GBP Phone Policy Check (Strict Compliance)
  if (platform === "gbp") {
    const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
    if (phoneRegex.test(generatedCopy)) {
      unsupportedClaims.push("🚨 GBP Policy Violation: Google prohibits phone numbers inside the post body text. Use native Call Now button.");
    }
  }

  // 2. Check for Phone Number on FB/IG (Must match verified brand phone)
  if (platform !== "gbp") {
    const phoneMatches = generatedCopy.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g);
    if (phoneMatches) {
      for (const phone of phoneMatches) {
        const cleanDigits = phone.replace(/\D/g, "");
        const verifiedDigits = BRAND_CONFIG.verifiedPhone.replace(/\D/g, "");
        if (cleanDigits !== verifiedDigits && cleanDigits !== "6018507164") {
          unsupportedClaims.push(`⚠️ Unrecognized phone number detected: ${phone}. Must match verified brand line ${BRAND_CONFIG.verifiedPhone}.`);
        }
      }
    }
  }

  // 3. Scan for Restricted / Hallucinated Claims
  for (const { regex, type } of RESTRICTED_CLAIM_PATTERNS) {
    const match = generatedCopy.match(regex);
    if (match) {
      const claimText = match[0];
      extractedClaims.push(`${type}: "${claimText}"`);
      // Check if source text mentioned it
      if (!sourceText.includes(claimText.toLowerCase()) && !sourceText.includes(type)) {
        // Allow standard company CTA offers: "free inspection" / "free estimate"
        const lowerClaim = claimText.toLowerCase();
        if (type === "pricing_claim" && (lowerClaim.includes("estimate") || lowerClaim.includes("inspection"))) {
          // Allowed standard offer
        } else {
          unsupportedClaims.push(`⚠️ Unsupported ${type} claim: "${claimText}" (not mentioned in field check-in)`);
        }
      }
    }
  }

  // 4. Material Brand Verification (e.g., GAF, Owens Corning, CertainTeed)
  const brandNames = ["gaf", "owens corning", "certainteed", "tamko", "iko", "atlas"];
  for (const brand of brandNames) {
    const brandRegex = new RegExp(`\\b${brand}\\b`, "i");
    if (brandRegex.test(generatedCopy)) {
      extractedClaims.push(`brand_material: "${brand.toUpperCase()}"`);
      if (!sourceText.includes(brand)) {
        unsupportedClaims.push(`⚠️ Brand material "${brand.toUpperCase()}" was claimed but is not in source check-in.`);
      }
    }
  }

  // 5. City Hallucination Check
  const cityRegex = new RegExp(`\\b${sourceJob.city}\\b`, "i");
  if (!cityRegex.test(generatedCopy)) {
    // If post mentions a different city not matching sourceJob.city
    const commonCities = ["Pearl", "Jackson", "Brandon", "Madison", "Flowood", "Byram", "Clinton", "Ridgeland", "Vicksburg"];
    for (const otherCity of commonCities) {
      if (otherCity.toLowerCase() !== sourceJob.city.toLowerCase()) {
        const otherRegex = new RegExp(`\\b${otherCity}\\b`, "i");
        if (otherRegex.test(generatedCopy)) {
          unsupportedClaims.push(`⚠️ Location mismatch: Post mentions "${otherCity}" but job occurred in "${sourceJob.city}".`);
        }
      }
    }
  }

  const isValid = unsupportedClaims.length === 0;
  const confidence = Math.max(50, Math.round(100 - unsupportedClaims.length * 20));

  return {
    isValid,
    extractedClaims,
    unsupportedClaims,
    confidence,
  };
}
