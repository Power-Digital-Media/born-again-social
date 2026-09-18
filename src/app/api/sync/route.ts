import { NextResponse } from "next/server";
import { RawPin } from "@/lib/storage/schema";
import { clusterAndSanitizePins } from "@/lib/clustering";
import { storage } from "@/lib/storage";
import bundledPins from "@/data/pins.json";

export const dynamic = "force-dynamic";

function parseFirestoreDocument(doc: any): RawPin {
  const actualDoc = doc.document ? doc.document : doc;
  const fields = actualDoc.fields || {};

  const parseValue = (val: any): any => {
    if (!val) return undefined;
    if ("stringValue" in val) return val.stringValue;
    if ("doubleValue" in val) return Number(val.doubleValue);
    if ("integerValue" in val) return Number(val.integerValue);
    if ("booleanValue" in val) return val.booleanValue;
    if ("arrayValue" in val) {
      const values = val.arrayValue.values || [];
      return values.map((v: any) => parseValue(v));
    }
    if ("mapValue" in val) {
      const mapFields = val.mapValue.fields || {};
      const obj: any = {};
      for (const [k, v] of Object.entries(mapFields)) {
        obj[k] = parseValue(v);
      }
      return obj;
    }
    return undefined;
  };

  return {
    id: parseValue(fields.id) || (actualDoc.name ? actualDoc.name.split("/").pop() : "") || Date.now().toString(),
    author: parseValue(fields.author) || "Our Certified Crew",
    date: parseValue(fields.date) || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    location: parseValue(fields.location) || "Central Mississippi, MS",
    service: parseValue(fields.service) || "Roofing & Remodeling",
    description: parseValue(fields.description) || "",
    images: parseValue(fields.images) || [],
    latitude: parseValue(fields.latitude),
    longitude: parseValue(fields.longitude),
    detailedExplanation: parseValue(fields.detailedExplanation) || "",
    aeoAnswers: parseValue(fields.aeoAnswers) || [],
    clientId: parseValue(fields.clientId) || "born-again-roofing",
  };
}

async function fetchLiveFirestorePins(): Promise<RawPin[]> {
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || "pdm-pindrop-central";
  const clientId = process.env.PDM_CLIENT_ID || "born-again-roofing";

  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "pins" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "clientId" },
          op: "EQUAL",
          value: { stringValue: clientId },
        },
      },
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryBody),
        signal: controller.signal,
        next: { revalidate: 30 },
      }
    );

    if (res.ok) {
      const results = await res.json();
      return results
        .filter((r: any) => r.document)
        .map((r: any) => parseFirestoreDocument(r));
    }
  } catch (err) {
    console.warn("Firestore query timed out or failed:", err);
  } finally {
    clearTimeout(timeoutId);
  }

  return [];
}

export async function GET() {
  try {
    // 1. Fetch live daily pins directly from Firebase Firestore REST API
    const liveDbPins = await fetchLiveFirestorePins();

    // 2. Merge live Firestore pins with the bundled historical archive
    const mergedRawPins: RawPin[] = [...liveDbPins, ...(bundledPins as RawPin[])];

    // Deduplicate pins by ID
    const seen = new Set<string>();
    const uniqueRawPins = mergedRawPins.filter((p) => {
      if (!p || !p.id) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // 3. Get rotation history
    const recentCities = await storage.getRecentPostedCities(3);
    const recentServices = await storage.getRecentPostedServices(3);

    // 4. Run Clustering, Privacy Sanitization, and Opportunity Scoring (COS)
    const sanitizedJobs = clusterAndSanitizePins(uniqueRawPins, recentCities, recentServices);

    // 5. Persist to storage
    await storage.saveJobs(sanitizedJobs);

    return NextResponse.json({
      success: true,
      livePinsFound: liveDbPins.length,
      totalRawPins: uniqueRawPins.length,
      totalClusteredJobs: sanitizedJobs.length,
      highOpportunityJobsCount: sanitizedJobs.filter((j) => j.opportunityScore >= 70).length,
      jobs: sanitizedJobs,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}
