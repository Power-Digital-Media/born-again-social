"use client";

import React, { useState, useEffect } from "react";
import { SanitizedSocialJob, SocialCampaign } from "@/lib/storage/schema";
import { Navbar } from "@/components/Navbar";
import { OpportunityFeed } from "@/components/OpportunityFeed";
import { CampaignModal } from "@/components/CampaignModal";
import { PostHistoryTable } from "@/components/PostHistoryTable";

export default function StudioDashboard() {
  const [jobs, setJobs] = useState<SanitizedSocialJob[]>([]);
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState<string | null>(null);
  const [activeModalCampaign, setActiveModalCampaign] = useState<SocialCampaign | null>(null);
  const [activeTab, setActiveTab] = useState<"opportunities" | "campaigns" | "history">("opportunities");

  const loadData = async () => {
    setIsSyncing(true);
    try {
      // 1. Sync Jobs
      const syncRes = await fetch("/api/sync");
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setJobs(syncData.jobs || []);
      }

      // 2. Fetch Campaigns
      const campRes = await fetch("/api/campaign");
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuildCampaign = async (job: SanitizedSocialJob) => {
    setIsGeneratingId(job.projectClusterId);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobData: job }),
      });

      if (res.ok) {
        const data = await res.json();
        const newCampaign: SocialCampaign = data.campaign;
        setCampaigns((prev) => [newCampaign, ...prev.filter((c) => c.id !== newCampaign.id)]);
        setActiveModalCampaign(newCampaign);
      } else {
        alert("Failed to build campaign package. Check API logs.");
      }
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setIsGeneratingId(null);
    }
  };

  const handleSaveStatus = async (id: string, status: SocialCampaign["status"]) => {
    try {
      const res = await fetch("/api/campaign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
        if (activeModalCampaign && activeModalCampaign.id === id) {
          setActiveModalCampaign({ ...activeModalCampaign, status });
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const highScoreCount = jobs.filter((j) => j.opportunityScore >= 70).length;

  return (
    <main style={{ minHeight: "100vh", paddingBottom: "4rem", backgroundColor: "#0b0c10", color: "#f1f3f5" }}>
      <Navbar
        onSync={loadData}
        isSyncing={isSyncing}
        totalJobs={jobs.length}
        highScoreCount={highScoreCount}
        activeCampaignCount={campaigns.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "opportunities" ? (
        <OpportunityFeed
          jobs={jobs}
          onBuildCampaign={handleBuildCampaign}
          isGeneratingId={isGeneratingId}
        />
      ) : (
        <PostHistoryTable
          campaigns={campaigns}
          onOpenCampaign={(c) => setActiveModalCampaign(c)}
        />
      )}

      {/* Full Campaign Studio Modal */}
      {activeModalCampaign && (
        <CampaignModal
          campaign={activeModalCampaign}
          onClose={() => setActiveModalCampaign(null)}
          onSaveStatus={handleSaveStatus}
        />
      )}
    </main>
  );
}
