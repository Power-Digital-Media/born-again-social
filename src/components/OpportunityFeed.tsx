"use client";

import React, { useState } from "react";
import { SanitizedSocialJob } from "@/lib/storage/schema";
import { Sparkles, MapPin, Wrench, User, Image as ImageIcon, CheckCircle, Flame, Filter, Eye } from "lucide-react";
import { JobPhotoViewerModal } from "./JobPhotoViewerModal";

interface OpportunityFeedProps {
  jobs: SanitizedSocialJob[];
  onBuildCampaign: (job: SanitizedSocialJob) => void;
  isGeneratingId: string | null;
}

export function OpportunityFeed({ jobs, onBuildCampaign, isGeneratingId }: OpportunityFeedProps) {
  const [filterType, setFilterType] = useState<"all" | "high_score" | "multi_photo" | "roofing" | "remodeling">("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingJobPhotos, setViewingJobPhotos] = useState<{ job: SanitizedSocialJob; index: number } | null>(null);

  // Extract unique cities
  const cities = Array.from(new Set(jobs.map((j) => j.city))).filter(Boolean);

  const filteredJobs = jobs.filter((job) => {
    // Filter Type
    if (filterType === "high_score" && job.opportunityScore < 70) return false;
    if (filterType === "multi_photo" && job.photoCount < 2) return false;
    if (filterType === "roofing" && !job.service.toLowerCase().includes("roof")) return false;
    if (filterType === "remodeling" && !job.service.toLowerCase().includes("remodel") && !job.service.toLowerCase().includes("kitchen") && !job.service.toLowerCase().includes("bath")) return false;

    // City
    if (selectedCity !== "all" && job.city !== selectedCity) return false;

    // Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const match =
        job.city.toLowerCase().includes(query) ||
        job.service.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.authorName.toLowerCase().includes(query);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Controls Bar */}
      <div style={{
        background: "#12141c",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Search */}
        <div style={{ flex: "1 1 260px" }}>
          <input
            type="text"
            placeholder="Search city, materials (GAF, HDZ), service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "#0b0c10",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f1f3f5",
              padding: "0.6rem 0.95rem",
              borderRadius: "8px",
              fontSize: "0.88rem",
              outline: "none"
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
          <button
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
          >
            All Opportunities ({jobs.length})
          </button>
          <button
            onClick={() => setFilterType("high_score")}
            className={filterType === "high_score" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
          >
            🔥 High COS Score (70+)
          </button>
          <button
            onClick={() => setFilterType("multi_photo")}
            className={filterType === "multi_photo" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
          >
            📸 Multi-Photo (2+)
          </button>
          <button
            onClick={() => setFilterType("roofing")}
            className={filterType === "roofing" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
          >
            🏠 Roofing
          </button>
          <button
            onClick={() => setFilterType("remodeling")}
            className={filterType === "remodeling" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
          >
            🔨 Remodeling
          </button>
        </div>

        {/* City Filter */}
        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: "#0b0c10",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f1f3f5",
              padding: "0.6rem 0.95rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all">📍 All Cities ({cities.length})</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filteredJobs.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "#12141c",
          borderRadius: "14px",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <p style={{ color: "#9ea4b0", fontSize: "1rem" }}>No job check-ins match your active filters.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "1.25rem"
        }}>
          {filteredJobs.map((job) => {
            const isGenerating = isGeneratingId === job.projectClusterId;
            const scoreColor =
              job.opportunityScore >= 75
                ? "#34d399"
                : job.opportunityScore >= 50
                ? "#fbbf24"
                : "#9ea4b0";

            return (
              <div
                key={job.projectClusterId}
                className="studio-card"
                style={{
                  background: "#12141c",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "1.25rem",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Card Top: COS Score & Clustered Tag */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{
                      background: job.opportunityScore >= 75 ? "rgba(52, 211, 153, 0.12)" : "rgba(251, 191, 36, 0.12)",
                      border: `1px solid ${job.opportunityScore >= 75 ? "rgba(52, 211, 153, 0.3)" : "rgba(251, 191, 36, 0.3)"}`,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: scoreColor
                    }}>
                      <Flame size={14} />
                      COS {job.opportunityScore}
                    </div>

                    {job.clusteredPinCount > 1 && (
                      <span style={{
                        fontSize: "0.72rem",
                        background: "rgba(56, 189, 248, 0.12)",
                        color: "#38bdf8",
                        padding: "0.2rem 0.45rem",
                        borderRadius: "4px",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                        fontWeight: 600
                      }}>
                        ⚡ {job.clusteredPinCount} Pins Clustered
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: "0.75rem", color: "#9ea4b0" }}>
                    {job.date}
                  </span>
                </div>

                {/* Service & City */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                    <span className="badge-gold">
                      {job.service}
                    </span>
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontSize: "0.75rem",
                      color: "#f1f3f5",
                      background: "rgba(255, 255, 255, 0.06)",
                      padding: "0.2rem 0.45rem",
                      borderRadius: "4px",
                      border: "1px solid rgba(255, 255, 255, 0.08)"
                    }}>
                      <MapPin size={12} color="#f3c973" />
                      {job.city}, MS
                    </span>
                  </div>
                </div>

                {/* Photos Thumbnail Strip */}
                {job.cleanImages && job.cleanImages.length > 0 && (
                  <div style={{ marginBottom: "0.85rem" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem"
                    }}>
                      <span style={{ fontSize: "0.72rem", color: "#9ea4b0", fontWeight: 600 }}>
                        Job Photos ({job.cleanImages.length})
                      </span>
                      <button
                        onClick={() => setViewingJobPhotos({ job, index: 0 })}
                        style={{
                          background: "rgba(243, 201, 115, 0.1)",
                          border: "1px solid rgba(243, 201, 115, 0.25)",
                          color: "#f3c973",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        <Eye size={11} />
                        View All {job.cleanImages.length} Photos
                      </button>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(job.cleanImages.length, 3)}, 1fr)`,
                      gap: "0.4rem",
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}>
                      {job.cleanImages.slice(0, 3).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setViewingJobPhotos({ job, index: idx })}
                          title="Click to view all photos in full size"
                          style={{
                            height: "90px",
                            position: "relative",
                            background: "#1e293b",
                            backgroundImage: `url(${imgUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "transform 0.15s ease, opacity 0.15s ease",
                            border: "1px solid rgba(255, 255, 255, 0.08)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {idx === 2 && job.cleanImages.length > 3 && (
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,0.65)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "0.85rem"
                            }}>
                              +{job.cleanImages.length - 3} more
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Text */}
                <p style={{
                  fontSize: "0.83rem",
                  color: "#9ea4b0",
                  lineHeight: "1.5",
                  marginBottom: "1rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  flex: "1 1 auto"
                }}>
                  {job.description}
                </p>

                {/* Technician & Action Footer */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "0.85rem",
                  marginTop: "auto"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#9ea4b0" }}>
                    <User size={13} />
                    <span>Tech: {job.authorName}</span>
                  </div>

                  <button
                    onClick={() => onBuildCampaign(job)}
                    disabled={isGenerating}
                    className="btn-gold"
                  >
                    <Sparkles size={14} />
                    {isGenerating ? "Building..." : "✨ BUILD CAMPAIGN"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Photo Lightbox Inspector Modal */}
      {viewingJobPhotos && (
        <JobPhotoViewerModal
          job={viewingJobPhotos.job}
          initialIndex={viewingJobPhotos.index}
          onClose={() => setViewingJobPhotos(null)}
          onBuildCampaign={(job) => {
            setViewingJobPhotos(null);
            onBuildCampaign(job);
          }}
          isGenerating={isGeneratingId === viewingJobPhotos.job.projectClusterId}
        />
      )}
    </div>
  );
}
