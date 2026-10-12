import JSZip from "jszip";

export interface ZipCreativePackageOptions {
  projectName?: string;
  city: string;
  service: string;
  jobDate?: string;
  technician?: string;
  jobDescription?: string;
  briefJson: string;
  photos: { url: string; index: number; name?: string }[];
  copy?: {
    facebook?: string;
    instagram?: string;
    gbp?: string;
  };
  summaryJson?: string;
  zipFilename?: string;
  onProgress?: (progressText: string) => void;
}

function formatFileDate(rawDate?: string): string {
  if (!rawDate) {
    return new Date().toISOString().split("T")[0];
  }
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return rawDate.replace(/[^a-zA-Z0-9]/g, "_");
}

export async function downloadCreativeZip({
  projectName,
  city,
  service,
  jobDate,
  technician,
  jobDescription,
  briefJson,
  photos,
  copy,
  summaryJson,
  zipFilename,
  onProgress,
}: ZipCreativePackageOptions): Promise<void> {
  const zip = new JSZip();

  onProgress?.("Packaging creative brief & texts...");

  // 1. Brief JSON
  zip.file("chatgpt_creative_brief.json", briefJson);

  // 2. Summary JSON
  if (summaryJson) {
    zip.file("campaign_summary.json", summaryJson);
  }

  // Helper for post files
  const descContent = jobDescription || `Completed custom ${service} project in ${city}, MS.`;
  const formatPostFile = (platformName: string, text: string) => {
    return `================================================================================\n` +
      `PROJECT: ${service} in ${city}, MS (${jobDate || "Recent"})\n` +
      `TECHNICIAN: ${technician || "Born Again Team"}\n` +
      `================================================================================\n` +
      `ACTUAL WORK DONE & FIELD CHECK-IN NOTES:\n` +
      `--------------------------------------------------------------------------------\n` +
      `${descContent}\n\n` +
      `================================================================================\n` +
      `READY-TO-USE ${platformName.toUpperCase()} POST COPY:\n` +
      `================================================================================\n` +
      `${text}\n`;
  };

  // 3. Social Copy Text Files (with Actual Work Description included)
  if (copy?.facebook) {
    zip.file("facebook_post.txt", formatPostFile("Facebook", copy.facebook));
  }
  if (copy?.instagram) {
    zip.file("instagram_post.txt", formatPostFile("Instagram", copy.instagram));
  }
  if (copy?.gbp) {
    zip.file("google_business_profile.txt", formatPostFile("Google Business Profile", copy.gbp));
  }

  // 4. Job Description & Field Check-In Notes Text File
  const formattedJobDesc = `================================================================================\n` +
    `BORN AGAIN REMODELING & ROOFING — WORK DESCRIPTION & FIELD NOTES\n` +
    `================================================================================\n` +
    `PROJECT:        ${service} in ${city}, MS\n` +
    `LOCATION:       ${city}, Mississippi (Central MS Metro)\n` +
    `DATE:           ${jobDate || "Recent"}\n` +
    `TECHNICIAN:     ${technician || "Born Again Remodeling & Roofing Team"}\n` +
    `PHONE:          (601) 573-6178\n` +
    `WEBSITE:        https://www.bornagainroofing.com\n\n` +
    `--------------------------------------------------------------------------------\n` +
    `SCOPE OF WORK DONE & FIELD CHECK-IN NOTES:\n` +
    `--------------------------------------------------------------------------------\n` +
    `${descContent}\n\n` +
    `--------------------------------------------------------------------------------\n` +
    `HOW TO CREATE SOCIAL POSTS AROUND THIS WORK:\n` +
    `--------------------------------------------------------------------------------\n` +
    `1. FOCUS ON ACTUAL WORK DONE: Highlight the exact repair, replacement, or remodeling tasks completed above.\n` +
    `2. LOCAL RELEVANCE: Emphasize ${city}, MS to boost local SEO and neighbor trust.\n` +
    `3. REAL PHOTOS: Pair this copy with the real project photos included in this ZIP.\n` +
    `4. CALL TO ACTION: Remind clients to call (601) 573-6178 for free estimates or visit bornagainroofing.com.\n` +
    `================================================================================\n`;

  const createPostPromptText = `PROMPT TO GENERATE SOCIAL POSTS AROUND THIS WORK:\n\n` +
    `"You are an expert social media manager for Born Again Remodeling & Roofing, a premier, faith-centered contracting company in Central Mississippi.\n\n` +
    `Here is the work description for a recently completed job:\n\n` +
    `Location: ${city}, MS\n` +
    `Service: ${service}\n` +
    `Technician: ${technician || "Born Again Team"}\n` +
    `Date: ${jobDate || "Recent"}\n` +
    `Work Completed: ${descContent}\n` +
    `Company Phone: (601) 573-6178\n` +
    `Website: bornagainroofing.com\n\n` +
    `Please create 3 custom social media posts centered around the specific work that was done:\n` +
    `1. Facebook Post: Engaging storytelling focusing on the craftsmanship, problem solved, and customer peace of mind.\n` +
    `2. Instagram Caption: Punchy, visual-focused caption with bulleted project highlights and hashtags for Mississippi home improvement.\n` +
    `3. Google Business Profile Post: High-SEO local update (under 1500 chars, no phone number in text per Google policy) detailing the service and area served."\n`;

  zip.file("work_description.txt", formattedJobDesc);
  zip.file("WORK_DESCRIPTION.txt", formattedJobDesc);
  zip.file("job_description.txt", formattedJobDesc);
  zip.file("CREATE_POST_PROMPT.txt", createPostPromptText);

  // 5. Brand Logo
  try {
    onProgress?.("Fetching brand logo...");
    const logoRes = await fetch("/brand_logo.png");
    if (logoRes.ok) {
      const logoBlob = await logoRes.blob();
      zip.file("brand_logo.png", logoBlob);
    }
  } catch (err) {
    console.warn("Could not bundle brand_logo.png into ZIP:", err);
  }

  // 5. Fetch and attach selected photos
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const photoName = p.name || `photo_${p.index + 1}.jpg`;
    onProgress?.(`Downloading ${photoName} (${i + 1}/${photos.length})...`);

    try {
      // Try direct fetch first, fallback to download-proxy
      let imgRes: Response;
      try {
        imgRes = await fetch(p.url, { mode: "cors" });
        if (!imgRes.ok) throw new Error("Direct fetch failed");
      } catch {
        imgRes = await fetch(`/api/download-proxy?url=${encodeURIComponent(p.url)}&filename=${photoName}`);
      }

      if (imgRes.ok) {
        const imgBlob = await imgRes.blob();
        zip.file(photoName, imgBlob);
      }
    } catch (photoErr) {
      console.error(`Failed to download photo ${photoName}:`, photoErr);
    }
  }

  onProgress?.("Generating ZIP bundle...");
  const content = await zip.generateAsync({ type: "blob" });

  // Trigger browser download with clean date prefix
  const dateStr = formatFileDate(jobDate);
  const safeCity = city.replace(/[^a-zA-Z0-9]/g, "_");
  const safeService = service.replace(/[^a-zA-Z0-9]/g, "_");
  const defaultFilename = `${dateStr}_${safeCity}_${safeService}_ChatGPT_Creative_Set.zip`;
  const finalFilename = zipFilename || defaultFilename;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  onProgress?.("Done!");
}
