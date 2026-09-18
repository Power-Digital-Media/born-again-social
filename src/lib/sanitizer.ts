import crypto from "crypto";

export interface SanitizedLocation {
  city: string;
  state: string;
  displayLocation: string;
}

export function sanitizeLocation(rawLocation: string): SanitizedLocation {
  if (!rawLocation) {
    return { city: "Central Mississippi", state: "MS", displayLocation: "Central Mississippi" };
  }

  // Remove exact street addresses if present (e.g. "1234 Main St, Jackson, MS" -> "Jackson, MS")
  const parts = rawLocation.split(",").map((p) => p.trim());
  let city = parts[0];
  let state = "MS";

  if (parts.length >= 2) {
    // Check if the first part looks like a street address (starts with digits)
    if (/^\d+\s+/.test(parts[0]) && parts.length >= 3) {
      city = parts[1];
      state = parts[2].split(" ")[0] || "MS";
    } else if (/^\d+\s+/.test(parts[0]) && parts.length === 2) {
      city = parts[1];
      state = "MS";
    } else {
      city = parts[0];
      state = parts[1].split(" ")[0] || "MS";
    }
  }

  return {
    city: city || "Central Mississippi",
    state: state || "MS",
    displayLocation: `${city}, ${state}`,
  };
}

export function sanitizeAuthorName(rawAuthor: string): string {
  if (!rawAuthor || rawAuthor.toLowerCase() === "unknown") {
    return "Our Certified Crew";
  }
  const parts = rawAuthor.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  // Return First Name + Last Initial (e.g., "Christopher H." or "Christopher")
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function getSocialSafeLandingUrl(service: string, city: string): string {
  const baseUrl = "https://www.bornagainroofing.com";
  const s = service.toLowerCase();
  const c = city.toLowerCase().replace(/[^a-z0-9]/g, "-");

  if (s.includes("metal")) {
    return `${baseUrl}/metal-roofing-repair-and-installation`;
  }
  if (s.includes("remodel") || s.includes("kitchen") || s.includes("bath")) {
    return `${baseUrl}/residential-roofing`; // Core remodeling hub
  }
  if (s.includes("storm") || s.includes("tarp") || s.includes("inspect")) {
    return `${baseUrl}/residential-roofing`;
  }
  if (["byram", "brandon", "flowood", "jackson", "madison", "pearl", "clinton", "ridgeland"].includes(c)) {
    return `${baseUrl}/areas-we-service/${c}`;
  }
  return `${baseUrl}/residential-roofing`;
}

export function calculateContentHash(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
}

export function calculatePhotosHash(photoUrls: string[]): string {
  const sorted = [...photoUrls].sort().join("|");
  return crypto.createHash("sha256").update(sorted).digest("hex").slice(0, 16);
}

export function detectPrivacyRisks(description: string, photoUrls: string[]): string[] {
  const flags: string[] = [];

  // Check for house numbers in description (e.g. #123, 456 Oak)
  if (/\b\d{3,5}\s+[A-Za-z]+\s+(St|Street|Rd|Road|Ave|Avenue|Dr|Drive|Ln|Lane|Ct|Court|Blvd|Way)\b/i.test(description)) {
    flags.push("⚠️ Specific residential street address detected in description text");
  }

  // Check for customer phone numbers in description
  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(description)) {
    flags.push("⚠️ Phone number found in job description (verify it's not customer info)");
  }

  // Check for email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(description)) {
    flags.push("⚠️ Email address found in job description");
  }

  return flags;
}
