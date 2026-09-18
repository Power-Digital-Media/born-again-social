import JSZip from "jszip";

export interface ZipCreativePackageOptions {
  projectName?: string;
  city: string;
  service: string;
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

export async function downloadCreativeZip({
  projectName,
  city,
  service,
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

  // 4. Brand Logo
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

  // Trigger browser download
  const safeCity = city.replace(/[^a-zA-Z0-9]/g, "_");
  const safeService = service.replace(/[^a-zA-Z0-9]/g, "_");
  const defaultFilename = `ChatGPT_Creative_Set_${safeCity}_${safeService}.zip`;
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
