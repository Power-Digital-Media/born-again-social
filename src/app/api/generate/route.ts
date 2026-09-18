import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { buildCampaignPackage } from "@/lib/ai-generator";
import { SanitizedSocialJob } from "@/lib/storage/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectClusterId, jobData } = body;

    let targetJob: SanitizedSocialJob | null = null;

    if (jobData) {
      targetJob = jobData;
    } else if (projectClusterId) {
      targetJob = await storage.getJobByClusterId(projectClusterId);
    }

    if (!targetJob) {
      return NextResponse.json({ error: "Project or job not found" }, { status: 404 });
    }

    // Generate Campaign Package with Fact-Checker & Multi-Platform Copy
    const campaign = await buildCampaignPackage(targetJob);

    // Save to storage
    await storage.saveCampaign(campaign);

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    console.error("Generate Campaign error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate campaign" }, { status: 500 });
  }
}
