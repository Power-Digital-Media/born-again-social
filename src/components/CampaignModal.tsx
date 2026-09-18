"use client";

import React, { useState, useEffect } from "react";
import { SocialCampaign } from "@/lib/storage/schema";
import { RealPhotoCanvas } from "./RealPhotoCanvas";
import { AiImageStudio } from "./AiImageStudio";
import {
  X,
  Copy,
  Check,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Share2,
  Calendar,
  Layers,
  Phone,
  FolderDown,
  FolderOpen,
  Download,
  Wand2,
  Package,
  CheckSquare,
  Square,
  Image as ImageIcon
} from "lucide-react";

interface CampaignModalProps {
  campaign: SocialCampaign;
  onClose: () => void;
  onSaveStatus: (id: string, status: SocialCampaign["status"]) => void;
}

const CREATIVE_TYPES = [
  "Auto — let ChatGPT decide",
  "Born Again Project Showcase",
  "Before and After Showcase",
  "Commercial Case Study",
  "Residential Project Spotlight",
  "Detail / Craftsmanship",
  "Custom",
];

export function CampaignModal({ campaign, onClose, onSaveStatus }: CampaignModalProps) {
  const [activePlatform, setActivePlatform] = useState<"facebook" | "instagram" | "gbp" | "creative" | "chatgpt_ai">("facebook");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessPath, setExportSuccessPath] = useState<string | null>(null);

  // Creative Brief Controls
  const [projectName, setProjectName] = useState(
    campaign.city && campaign.service ? `${campaign.city} ${campaign.service}` : ""
  );
  const [creativeType, setCreativeType] = useState("Auto — let ChatGPT decide");
  const [selectedPhotoIndexes, setSelectedPhotoIndexes] = useState<number[]>(
    campaign.selectedImages ? campaign.selectedImages.map((_, i) => i) : []
  );

  // Editable copy states
  const [fbText, setFbText] = useState(campaign.facebookCopy);
  const [igText, setIgText] = useState(campaign.instagramCopy);
  const [gbpText, setGbpText] = useState(campaign.gbpCopy);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePhotoIndex = (index: number) => {
    setSelectedPhotoIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAllPhotos = () => {
    if (selectedPhotoIndexes.length === campaign.selectedImages.length) {
      setSelectedPhotoIndexes([]);
    } else {
      setSelectedPhotoIndexes(campaign.selectedImages.map((_, i) => i));
    }
  };

  const handleExportForChatGPT = async (autoOpen = true) => {
    setIsExporting(true);
    try {
      const updatedCampaign = {
        ...campaign,
        facebookCopy: fbText,
        instagramCopy: igText,
        gbpCopy: gbpText,
      };

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign: updatedCampaign,
          projectName,
          creativeType,
          selectedPhotoIndexes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.folderPath) {
        setExportSuccessPath(data.folderPath);
        if (autoOpen) {
          // Open the chatgpt_creative subdirectory directly
          handleOpenFolder(data.chatgptCreativeDir || data.folderPath);
        }
      } else {
        alert("Export failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Export exception: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenFolder = async (folderPath: string) => {
    try {
      await fetch("/api/open-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath }),
      });
    } catch (err) {
      console.warn("Could not open folder:", err);
    }
  };

  const currentCopy = activePlatform === "facebook" ? fbText : activePlatform === "instagram" ? igText : gbpText;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "#12141c",
        border: "1px solid rgba(243, 201, 115, 0.35)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "1100px",
        maxHeight: "94vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)"
      }}>
        {/* Header */}
        <div style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0b0c10",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge-gold">
                {campaign.service}
              </span>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f1f3f5" }}>
                {campaign.city}, MS — Campaign Studio
              </h2>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#9ea4b0", marginTop: "0.2rem" }}>
              Technician: {campaign.technician} • Date: {campaign.jobDate} • Photos: {campaign.selectedImages.length}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* 📦 Export for ChatGPT Creative */}
            <button
              onClick={() => handleExportForChatGPT(true)}
              disabled={isExporting}
              className="btn-gold"
              style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}
              title="Exports creative brief, logo, post texts, and approved high-res photos for ChatGPT"
            >
              <Package size={15} className={isExporting ? "animate-spin" : ""} />
              {isExporting ? "Bundling for ChatGPT..." : "📦 Export for ChatGPT Creative"}
            </button>

            {exportSuccessPath && (
              <button
                onClick={() => handleOpenFolder(exportSuccessPath + "\\chatgpt_creative")}
                className="btn-outline"
                style={{ fontSize: "0.82rem", padding: "0.45rem 0.8rem", color: "#34d399" }}
              >
                <FolderOpen size={14} />
                Open Creative Folder
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: "transparent",
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

        {/* Fact Validator Alert Strip */}
        <div style={{
          padding: "0.6rem 1.5rem",
          background: campaign.factValidation.isValid ? "rgba(52, 211, 153, 0.08)" : "rgba(251, 191, 36, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.78rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {campaign.factValidation.isValid ? (
              <CheckCircle size={15} color="#34d399" />
            ) : (
              <AlertTriangle size={15} color="#fbbf24" />
            )}
            <span style={{ fontWeight: 600, color: "#f1f3f5" }}>
              Fact Verifier: {campaign.factValidation.isValid ? "100% Fact-Grounded & Policy Compliant" : "Review Claim Warnings"}
            </span>
          </div>

          {campaign.factValidation.unsupportedClaims.length > 0 && (
            <div style={{ color: "#fbbf24", fontSize: "0.74rem" }}>
              {campaign.factValidation.unsupportedClaims.join(" | ")}
            </div>
          )}
        </div>

        {/* Platform Tab Switcher */}
        <div style={{
          padding: "0.65rem 1.5rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          gap: "0.4rem",
          background: "#0b0c10",
          overflowX: "auto"
        }}>
          <button
            onClick={() => setActivePlatform("facebook")}
            className={activePlatform === "facebook" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
          >
            📘 Facebook Post
          </button>
          <button
            onClick={() => setActivePlatform("instagram")}
            className={activePlatform === "instagram" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
          >
            📷 Instagram Caption
          </button>
          <button
            onClick={() => setActivePlatform("gbp")}
            className={activePlatform === "gbp" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
          >
            📍 Google Business Profile
          </button>
          <button
            onClick={() => setActivePlatform("creative")}
            className={activePlatform === "creative" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
          >
            🎨 Branded Real-Photo Card
          </button>
          <button
            onClick={() => setActivePlatform("chatgpt_ai")}
            className={activePlatform === "chatgpt_ai" ? "btn-gold" : "btn-outline"}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem", color: activePlatform === "chatgpt_ai" ? "#0c0f16" : "#38bdf8" }}
          >
            🤖 ChatGPT Art Studio
          </button>
        </div>

        {/* Body Content */}
        <div style={{
          padding: "1.25rem 1.5rem",
          overflowY: "auto",
          flex: 1,
          display: "grid",
          gridTemplateColumns: activePlatform === "creative" || activePlatform === "chatgpt_ai" ? "1fr" : "1.2fr 0.8fr",
          gap: "1.25rem"
        }}>
          {activePlatform === "creative" ? (
            <RealPhotoCanvas
              images={campaign.selectedImages}
              city={campaign.city}
              service={campaign.service}
              technician={campaign.technician}
              layout={campaign.recommendedLayout}
            />
          ) : activePlatform === "chatgpt_ai" ? (
            <AiImageStudio
              city={campaign.city}
              service={campaign.service}
              technician={campaign.technician}
              description={campaign.facebookCopy}
              folderPath={exportSuccessPath || undefined}
              onExportBrief={() => handleExportForChatGPT(true)}
            />
          ) : (
            <>
              {/* Left Column: Editable Copy */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f3c973" }}>
                    {activePlatform === "facebook" ? "Facebook Post Copy" : activePlatform === "instagram" ? "Instagram Caption & Hashtags" : "Google Business Profile Post"}
                  </label>
                  <button
                    onClick={() => handleCopy(currentCopy, activePlatform)}
                    className="btn-outline"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", color: "#f3c973" }}
                  >
                    {copiedKey === activePlatform ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                    {copiedKey === activePlatform ? "Copied!" : "Copy Text"}
                  </button>
                </div>

                <textarea
                  value={
                    activePlatform === "facebook" ? fbText : activePlatform === "instagram" ? igText : gbpText
                  }
                  onChange={(e) => {
                    if (activePlatform === "facebook") setFbText(e.target.value);
                    else if (activePlatform === "instagram") setIgText(e.target.value);
                    else setGbpText(e.target.value);
                  }}
                  style={{
                    width: "100%",
                    height: "300px",
                    background: "#0b0c10",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#f1f3f5",
                    padding: "0.9rem",
                    fontSize: "0.86rem",
                    lineHeight: "1.5",
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none"
                  }}
                />

                {activePlatform === "gbp" && (
                  <p style={{ fontSize: "0.72rem", color: "#9ea4b0", marginTop: "0.35rem" }}>
                    ✓ Google Business Profile Policy: Text contains zero phone numbers. Customers click the native "Call Now" or "Learn More" button.
                  </p>
                )}
              </div>

              {/* Right Column: Creative Brief Controls & Photo Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* ChatGPT Brief Controls Card */}
                <div style={{
                  background: "#0b0c10",
                  padding: "0.85rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(243, 201, 115, 0.2)"
                }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f3c973", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Package size={13} />
                    ChatGPT Creative Brief Settings
                  </div>

                  {/* Project / Business Name */}
                  <div style={{ marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "0.72rem", color: "#9ea4b0", display: "block", marginBottom: "0.2rem" }}>
                      Project / Business Name (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fun Time Skateland or Luxury Remodel"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#12141c",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#f1f3f5",
                        padding: "0.35rem 0.65rem",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Creative Type Selector */}
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#9ea4b0", display: "block", marginBottom: "0.2rem" }}>
                      Creative Style Target:
                    </label>
                    <select
                      value={creativeType}
                      onChange={(e) => setCreativeType(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#12141c",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#f1f3f5",
                        padding: "0.35rem 0.65rem",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      {CREATIVE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photos Selector for Creative */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ea4b0" }}>
                      Photos for ChatGPT ({selectedPhotoIndexes.length}/{campaign.selectedImages.length} approved)
                    </label>
                    <button
                      onClick={toggleSelectAllPhotos}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#f3c973",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      {selectedPhotoIndexes.length === campaign.selectedImages.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.45rem" }}>
                    {campaign.selectedImages.slice(0, 6).map((url, idx) => {
                      const isSelected = selectedPhotoIndexes.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => togglePhotoIndex(idx)}
                          style={{
                            height: "90px",
                            borderRadius: "6px",
                            backgroundImage: `url(${url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: `2px solid ${isSelected ? "#f3c973" : "rgba(255, 255, 255, 0.08)"}`,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {/* Checkbox overlay badge */}
                          <div style={{
                            position: "absolute",
                            top: "4px",
                            left: "4px",
                            background: isSelected ? "#f3c973" : "rgba(0, 0, 0, 0.7)",
                            color: isSelected ? "#0c0f16" : "#fff",
                            borderRadius: "4px",
                            padding: "0.15rem 0.35rem",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem"
                          }}>
                            {isSelected ? <CheckSquare size={11} /> : <Square size={11} />}
                            Photo #{idx + 1}
                          </div>

                          <a
                            href={`/api/download-proxy?url=${encodeURIComponent(url)}&filename=job_photo_${idx + 1}.jpg`}
                            title="Download high-res original"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(0,0,0,0.75)",
                              color: "#f3c973",
                              padding: "0.25rem",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none"
                            }}
                          >
                            <Download size={11} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Safe Landing Link */}
                <div style={{
                  background: "#0b0c10",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                  <div style={{ fontSize: "0.7rem", color: "#9ea4b0", marginBottom: "0.15rem" }}>
                    Social-Safe Landing Page:
                  </div>
                  <a
                    href={campaign.landingPageUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#38bdf8",
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      wordBreak: "break-all"
                    }}
                  >
                    {campaign.landingPageUrl}
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "0.85rem 1.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "#0b0c10",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#9ea4b0" }}>
            <span>Status:</span>
            <span style={{
              fontWeight: 700,
              textTransform: "uppercase",
              color: campaign.status === "published" ? "#34d399" : "#f3c973"
            }}>
              {campaign.status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              onClick={() => handleExportForChatGPT(true)}
              className="btn-gold"
              style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}
            >
              <Package size={14} />
              📦 Export for ChatGPT Creative
            </button>
            <button
              onClick={() => onSaveStatus(campaign.id, "approved")}
              className="btn-outline"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              <CheckCircle size={14} color="#34d399" />
              Approve Campaign
            </button>
            <button
              onClick={() => onSaveStatus(campaign.id, "published")}
              className="btn-outline"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              <Share2 size={14} />
              Mark Published
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
