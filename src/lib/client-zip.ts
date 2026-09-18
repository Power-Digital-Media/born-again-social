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

  // 3. Social Copy Text Files
  if (copy?.facebook) {
    zip.file("facebook_post.txt", copy.facebook);
  }
  if (copy?.instagram) {
    zip.file("instagram_post.txt", copy.instagram);
  }
  if (copy?.gbp) {
    zip.file("google_business_profile.txt", copy.gbp);
  }

  // 4. Job Description & Field Check-In Notes Text File
  const descContent = jobDescription || `Completed custom ${service} project in ${city}, MS.`;
  const formattedJobDesc = `PROJECT: ${city}, MS — ${service}\n` +
    `DATE: ${jobDate || "Recent"}\n` +
    `TECHNICIAN: ${technician || "Born Again Remodeling & Roofing Team"}\n` +
    `LOCATION: ${city}, Mississippi\n\n` +
    `FIELD CHECK-IN NOTES / FULL JOB DESCRIPTION:\n` +
    `${descContent}\n`;
  zip.file("job_description.txt", formattedJobDesc);

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
