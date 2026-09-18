"use client";

import React, { useState } from "react";
import {
  Download,
  CheckSquare,
  Square,
  ExternalLink,
  ImageIcon,
  Sparkles,
  Check,
  Loader2
} from "lucide-react";
import { downloadCreativeZip } from "@/lib/client-zip";

interface SharePhotoGalleryProps {
  photos: string[];
  city: string;
  service: string;
  briefJson: string;
  copy?: {
    facebook?: string;
    instagram?: string;
    gbp?: string;
  };
}

export default function SharePhotoGallery({
  photos,
  city,
  service,
  briefJson,
  copy
}: SharePhotoGalleryProps) {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>(
    photos.map((_, i) => i) // All selected by default
  );
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string | null>(null);

  const toggleIndex = (idx: number) => {
    if (selectedIndexes.includes(idx)) {
      setSelectedIndexes(selectedIndexes.filter((i) => i !== idx));
    } else {
      setSelectedIndexes([...selectedIndexes, idx].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (selectedIndexes.length === photos.length) {
      setSelectedIndexes([]);
    } else {
      setSelectedIndexes(photos.map((_, i) => i));
    }
  };

  const handleDownloadZip = async () => {
    const indexesToPack = selectedIndexes.length > 0 ? selectedIndexes : photos.map((_, i) => i);
    const photosToPack = indexesToPack.map((i) => ({
      url: photos[i],
      index: i,
      name: `photo_${i + 1}.jpg`,
    }));

    setIsZipping(true);
    setZipProgress("Starting creative package bundle...");

    try {
      await downloadCreativeZip({
        city,
        service,
        briefJson,
        photos: photosToPack,
        copy,
        onProgress: (msg) => setZipProgress(msg),
      });
    } catch (err) {
      console.error("ZIP download failed:", err);
      alert("Failed to bundle ZIP package. Please try again.");
    } finally {
      setIsZipping(false);
      setTimeout(() => setZipProgress(null), 3000);
    }
  };

  const selectedCount = selectedIndexes.length;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      {/* Header & Controls Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
        flexWrap: "wrap",
        gap: "0.75rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ImageIcon size={20} color="#f3c973" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#f1f3f5" }}>
            Approved Job Photography ({photos.length} High-Res Assets)
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            onClick={handleSelectAll}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#9ea4b0",
              padding: "0.45rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {selectedCount === photos.length ? "Deselect All" : "Select All"}
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            style={{
              background: "linear-gradient(135deg, #f3c973 0%, #d1a453 50%, #b88630 100%)",
              border: "none",
              color: "#0c0f16",
              padding: "0.48rem 1.1rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: isZipping ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 0 16px rgba(243, 201, 115, 0.3)"
            }}
          >
            {isZipping ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isZipping
              ? (zipProgress || "Creating ZIP...")
              : `⬇ Download Creative Set (${selectedCount || photos.length} Photos + Logo .ZIP)`}
          </button>
        </div>
      </div>

      {/* Helper Banner */}
      <div style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "8px",
        padding: "0.6rem 0.9rem",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
        fontSize: "0.78rem",
        color: "#9ea4b0"
      }}>
        <span>
          💡 Click any photo card to toggle selection for the downloaded ZIP package. All {photos.length} photos are included by default.
        </span>
        <span style={{ color: "#34d399", fontWeight: 700 }}>
          {selectedCount} of {photos.length} selected
        </span>
      </div>

      {/* Grid of Photo Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1rem"
      }}>
        {photos.map((imgUrl, idx) => {
          const isSelected = selectedIndexes.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleIndex(idx)}
              style={{
                background: "#12141c",
                border: `2px solid ${isSelected ? "#f3c973" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: isSelected ? "0 10px 25px -5px rgba(243, 201, 115, 0.25)" : "0 10px 25px -5px rgba(0,0,0,0.5)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                transform: isSelected ? "scale(1.01)" : "none"
              }}
            >
              <div style={{
                height: "220px",
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
              }}>
                {/* Top Badge: Selection & Photo Number */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  background: isSelected ? "#f3c973" : "rgba(12, 15, 22, 0.85)",
                  color: isSelected ? "#0c0f16" : "#f1f3f5",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "0.25rem 0.55rem",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  border: isSelected ? "none" : "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                  {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                  Photo #{idx + 1}
                </div>

                {isSelected && (
                  <span style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "rgba(12, 15, 22, 0.85)",
                    border: "1px solid rgba(243, 201, 115, 0.4)",
                    color: "#f3c973",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px"
                  }}>
                    ⭐ Selected for ZIP
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#12141c"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: "0.75rem", color: "#9ea4b0" }}>Photo #{idx + 1}</span>
                <a
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#38bdf8",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  Open High-Res <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
