"use client";

import React, { useState, useEffect } from "react";
import { SanitizedSocialJob } from "@/lib/storage/schema";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  Grid,
  Maximize2
} from "lucide-react";

interface JobPhotoViewerModalProps {
  job: SanitizedSocialJob;
  initialIndex?: number;
  onClose: () => void;
  onBuildCampaign: (job: SanitizedSocialJob) => void;
  isGenerating?: boolean;
}

export function JobPhotoViewerModal({
  job,
  initialIndex = 0,
  onClose,
  onBuildCampaign,
  isGenerating = false,
}: JobPhotoViewerModalProps) {
  const photos = job.cleanImages || [];
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<"hero" | "grid">("hero");

  // Keyboard navigation (Esc to close, Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photos.length, onClose]);

  const activePhoto = photos[activeIndex] || photos[0];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.9)",
      backdropFilter: "blur(10px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    }}>
      <div style={{
        background: "#12141c",
        border: "1px solid rgba(243, 201, 115, 0.35)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "1100px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
      }}>
        {/* Header */}
        <div style={{
          padding: "1rem 1.5rem",
          background: "#0c0f16",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className="badge-gold">{job.service}</span>
              <span style={{
                fontSize: "0.85rem",
                color: "#f3c973",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem"
              }}>
                <MapPin size={13} />
                {job.city}, MS
              </span>
              <span style={{ fontSize: "0.8rem", color: "#9ea4b0" }}>
                • {photos.length} Total High-Res Photos
              </span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#9ea4b0", marginTop: "0.2rem", display: "flex", gap: "0.75rem" }}>
              <span>Tech: {job.authorName}</span>
              <span>Date: {job.date}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              onClick={() => setViewMode(viewMode === "hero" ? "grid" : "hero")}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f1f3f5",
                padding: "0.4rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              {viewMode === "hero" ? <Grid size={14} /> : <Maximize2 size={14} />}
              {viewMode === "hero" ? `View All (${photos.length}) Grid` : "Single Hero View"}
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                color: "#9ea4b0",
                cursor: "pointer",
                padding: "0.4rem",
                borderRadius: "6px"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          flex: "1 1 auto",
          overflowY: "auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          {viewMode === "hero" ? (
            <>
              {/* Main Photo Display */}
              <div style={{
                position: "relative",
                height: "440px",
                background: "#080a0f",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}>
                <img
                  src={activePhoto}
                  alt={`Job photo ${activeIndex + 1}`}
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain"
                  }}
                />

                {/* Left / Right Nav Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(12, 15, 22, 0.8)",
                        border: "1px solid rgba(243, 201, 115, 0.3)",
                        color: "#f3c973",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                      }}
                    >
                      <ChevronLeft size={22} />
                    </button>

                    <button
                      onClick={() => setActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(12, 15, 22, 0.8)",
                        border: "1px solid rgba(243, 201, 115, 0.3)",
                        color: "#f3c973",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                      }}
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Bottom Photo Count Badge */}
                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "12px",
                  background: "rgba(12, 15, 22, 0.85)",
                  border: "1px solid rgba(243, 201, 115, 0.3)",
                  color: "#f3c973",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700
                }}>
                  Photo {activeIndex + 1} of {photos.length}
                </div>

                {/* Open Original Full-Res Link */}
                <a
                  href={activePhoto}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "12px",
                    background: "rgba(12, 15, 22, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#38bdf8",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  Open Full Resolution <ExternalLink size={12} />
                </a>
              </div>

              {/* Scrollable Thumbnails Strip */}
              <div style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                padding: "0.4rem 0",
                scrollbarWidth: "thin"
              }}>
                {photos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      width: "80px",
                      height: "65px",
                      flexShrink: 0,
                      borderRadius: "6px",
                      backgroundImage: `url(${url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: `2px solid ${idx === activeIndex ? "#f3c973" : "rgba(255, 255, 255, 0.12)"}`,
                      cursor: "pointer",
                      position: "relative",
                      opacity: idx === activeIndex ? 1 : 0.65,
                      transition: "all 0.15s ease",
                      padding: 0
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      background: "rgba(0,0,0,0.8)",
                      color: "#fff",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      padding: "0.1rem 0.25rem",
                      borderRadius: "3px"
                    }}>
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Grid View of All Photos */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.75rem",
              maxHeight: "520px",
              overflowY: "auto",
              paddingRight: "0.25rem"
            }}>
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    setViewMode("hero");
                  }}
                  style={{
                    height: "140px",
                    borderRadius: "8px",
                    backgroundImage: `url(${url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    cursor: "pointer",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "transform 0.15s ease",
                    overflow: "hidden"
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: "6px",
                    left: "6px",
                    background: "rgba(12, 15, 22, 0.85)",
                    border: "1px solid rgba(243, 201, 115, 0.4)",
                    color: "#f3c973",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "0.15rem 0.4rem",
                    borderRadius: "4px"
                  }}>
                    Photo #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Job Description Summary */}
          {job.description && (
            <div style={{
              background: "#0c0f16",
              padding: "0.85rem 1.1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              <div style={{ fontSize: "0.72rem", color: "#9ea4b0", marginBottom: "0.25rem" }}>
                Field Check-in Notes:
              </div>
              <p style={{ fontSize: "0.83rem", color: "#e2e8f0", margin: 0, lineHeight: "1.5" }}>
                {job.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "0.85rem 1.5rem",
          background: "#0c0f16",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#9ea4b0",
              padding: "0.45rem 1rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Close Viewer
          </button>

          <button
            onClick={() => {
              onClose();
              onBuildCampaign(job);
            }}
            disabled={isGenerating}
            className="btn-gold"
            style={{
              fontSize: "0.85rem",
              padding: "0.5rem 1.25rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Sparkles size={15} />
            {isGenerating ? "Building Campaign..." : "✨ Build Campaign for This Job"}
          </button>
        </div>
      </div>
    </div>
  );
}
