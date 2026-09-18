import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { RawPin } from "@/lib/storage/schema";
import { clusterAndSanitizePins } from "@/lib/clustering";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

async function fetchWithTimeout(url: string, timeoutMs = 7000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BornAgainSocialEngine/1.0",
        "Accept": "application/json",
      },
      next: { revalidate: 0 },
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadFallbackPins(): Promise<RawPin[]> {
  const fallbackPath = "E:\\AntiGravity\\born-again-roofing\\src\\data\\pins.json";
  try {
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf-8");
      return JSON.parse(content) as RawPin[];
    }
  } catch (err) {
    console.warn("Could not load local pins.json fallback:", err);
  }
  return [];
}

export async function GET() {
  try {
    let rawPins: RawPin[] = [];
    let source = "live_api";

    // 1. Try resilient live fetch from bornagainroofing.com
    try {
      const res = await fetchWithTimeout("https://www.bornagainroofing.com/api/pins", 8000);
      if (res.ok) {
        rawPins = await res.json();
      } else {
        console.warn(`Live API returned status ${res.status}. Using fallback archive.`);
      }
    } catch (err) {
      console.warn("Live API fetch timed out or failed. Switching to resilient local archive:", err);
    }

    // 2. Resilient fallback if live fetch didn't yield pins
    if (!rawPins || rawPins.length === 0) {
      source = "local_archive";
      rawPins = await loadFallbackPins();
    }

    if (rawPins.length === 0) {
      return NextResponse.json({ error: "No pin data available from live API or local cache" }, { status: 500 });
    }

    // 3. Get rotation context from storage
    const recentCities = await storage.getRecentPostedCities(3);
    const recentServices = await storage.getRecentPostedServices(3);

    // 4. Run Clustering, Privacy Sanitization, and Opportunity Scoring (COS)
    const sanitizedJobs = clusterAndSanitizePins(rawPins, recentCities, recentServices);

    // 5. Persist sanitized jobs to storage
    await storage.saveJobs(sanitizedJobs);

    return NextResponse.json({
      success: true,
      source,
      totalRawPins: rawPins.length,
      totalClusteredJobs: sanitizedJobs.length,
      highOpportunityJobsCount: sanitizedJobs.filter((j) => j.opportunityScore >= 70).length,
      jobs: sanitizedJobs,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}
