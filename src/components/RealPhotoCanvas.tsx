"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download, Sparkles, Image as ImageIcon } from "lucide-react";

interface RealPhotoCanvasProps {
  images: string[];
  city: string;
  service: string;
  technician: string;
  layout: "before_after" | "multi_carousel" | "single_hero" | "detail_showcase";
}

export function RealPhotoCanvas({
  images,
  city,
  service,
  technician,
  layout,
}: RealPhotoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"4_5" | "before_after">("4_5");

  useEffect(() => {
    drawBrandedCard();
  }, [images, city, service, technician, selectedFormat]);

  const drawBrandedCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsRendering(true);

    const width = 1080;
    const height = selectedFormat === "4_5" ? 1350 : 1080; // 4:5 vs 1:1

    canvas.width = width;
    canvas.height = height;

    // 1. Dark Navy Background
    ctx.fillStyle = "#0a0d14";
    ctx.fillRect(0, 0, width, height);

    try {
      // Helper to load image with CORS
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = url;
        });
      };

      if (selectedFormat === "before_after" && images.length >= 2) {
        // Draw Before / After Split
        const img1 = await loadImage(images[0]);
        const img2 = await loadImage(images[1]);

        const splitW = width / 2;
        const photoH = height - 160;

        // Left photo
        ctx.drawImage(img1, 0, 0, splitW - 4, photoH);
        // Right photo
        ctx.drawImage(img2, splitW + 4, 0, splitW - 4, photoH);

        // Badges
        ctx.fillStyle = "rgba(12, 15, 22, 0.85)";
        ctx.fillRect(20, 20, 140, 44);
        ctx.fillStyle = "#f3c973";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("PROGRESS", 36, 49);

        ctx.fillStyle = "rgba(12, 15, 22, 0.85)";
        ctx.fillRect(splitW + 24, 20, 160, 44);
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("COMPLETED", splitW + 40, 49);
      } else {
        // Draw Hero Photo
        const primaryImg = await loadImage(images[0]);
        const photoH = height - 180;
        ctx.drawImage(primaryImg, 0, 0, width, photoH);
      }

      // Bottom Branding Bar
      const barY = height - 180;
      const gradient = ctx.createLinearGradient(0, barY, 0, height);
      gradient.addColorStop(0, "rgba(10, 13, 20, 0.95)");
      gradient.addColorStop(1, "#0a0d14");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, barY, width, 180);

      // Top edge gold line
      ctx.fillStyle = "#f3c973";
      ctx.fillRect(0, barY, width, 4);

      // Brand Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("BORN AGAIN REMODELING & ROOFING", 40, barY + 60);

      // Service & Location Subtitle
      ctx.fillStyle = "#f3c973";
      ctx.font = "600 24px sans-serif";
      ctx.fillText(`📍 ${city}, MS  •  ${service}`, 40, barY + 105);

      // Verified Phone CTA Badge
      ctx.fillStyle = "rgba(243, 201, 115, 0.15)";
      ctx.fillRect(width - 360, barY + 35, 320, 90);
      ctx.strokeStyle = "#f3c973";
      ctx.lineWidth = 2;
      ctx.strokeRect(width - 360, barY + 35, 320, 90);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("FREE INSPECTION", width - 335, barY + 70);

      ctx.fillStyle = "#f3c973";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("(601) 573-6178", width - 335, barY + 106);

    } catch (err) {
      console.warn("Canvas photo render warning (fallback to preview mode):", err);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `BornAgain_${city.replace(/\s+/g, "")}_${service.replace(/\s+/g, "")}_Card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{
      background: "var(--bg-card-subtle)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "10px",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Format Controls */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.85rem", width: "100%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => setSelectedFormat("4_5")}
            className={selectedFormat === "4_5" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
          >
            4:5 Feed Frame
          </button>
          {images.length >= 2 && (
            <button
              onClick={() => setSelectedFormat("before_after")}
              className={selectedFormat === "before_after" ? "btn-gold" : "btn-outline"}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            >
              Before / After Split
            </button>
          )}
        </div>

        <button
          onClick={handleDownload}
          className="btn-outline"
          style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", color: "var(--gold-primary)" }}
        >
          <Download size={13} />
          Download PNG
        </button>
      </div>

      {/* Canvas preview */}
      <div style={{ maxWidth: "100%", overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", maxHeight: "420px", objectFit: "contain", display: "block" }}
        />
      </div>
    </div>
  );
}
