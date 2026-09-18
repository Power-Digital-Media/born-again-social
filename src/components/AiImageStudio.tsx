"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Download, Wand2, Key, CheckCircle, AlertCircle, Package, FolderOpen, Image as ImageIcon } from "lucide-react";

interface AiImageStudioProps {
  city: string;
  service: string;
  technician: string;
  description: string;
  folderPath?: string;
  onExportBrief?: () => void;
}

export function AiImageStudio({ city, service, technician, description, folderPath, onExportBrief }: AiImageStudioProps) {
  const [apiKey, setApiKey] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1024x1024" | "1024x1792">("1024x1024");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load API key from localStorage if saved
  useEffect(() => {
    const savedKey = localStorage.getItem("bornagain_openai_key");
    if (savedKey) setApiKey(savedKey);
    // Set default prompt based on job
    setPrompt(
      `Professional architectural photography of a beautiful residential home in ${city}, Mississippi with a pristine, brand-new ${service.toLowerCase()} installed by Born Again Roofing. Warm golden hour lighting, lush green lawn, high-end craftsmanship, crisp detail, 8k resolution.`
    );
  }, [city, service]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("bornagain_openai_key", key);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setErrorMsg("Please enter your OpenAI API Key first.");
      return;
    }
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          apiKey,
          folderPath,
          aspectRatio,
          city,
          service,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setSavedFilePath(data.savedFilePath);
      } else {
        setErrorMsg(data.error || "Failed to generate image.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error generating image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const setPreset = (presetType: string) => {
    if (presetType === "gaf_roof") {
      setPrompt(
        `High-end architectural exterior photography of a Southern craftsman home in ${city}, MS featuring brand new GAF Timberline HDZ charcoal architectural shingles, immaculate copper flashing, clean ridge vents, surrounded by pines and blue sky. Professional real estate DSLR quality.`
      );
    } else if (presetType === "metal_roof") {
      setPrompt(
        `Stunning modern Mississippi home with a matte black standing-seam metal roof installed by Born Again Roofing, storm-resistant craftsmanship, clean modern gutters, sunny Mississippi afternoon.`
      );
    } else if (presetType === "remodel") {
      setPrompt(
        `Luxury interior design photography of a newly remodeled open-concept kitchen and living space in ${city}, Mississippi with quartz countertops, custom shaker cabinets, modern brass hardware, and warm natural lighting.`
      );
    } else if (presetType === "storm_defense") {
      setPrompt(
        `Dramatic architectural showcase of a storm-fortified residential roof in Mississippi with dark cloud drama transitioning into clear blue sky and golden sunlight, highlighting heavy-duty shingles and superior weather protection.`
      );
    }
  };

  return (
    <div style={{
      background: "var(--bg-card-subtle)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "12px",
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      {/* Top Banner: ChatGPT Creative Handoff */}
      <div style={{
        background: "rgba(56, 189, 248, 0.08)",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        borderRadius: "8px",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem"
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent-blue)" }}>
            🤝 ChatGPT Art Direction Handoff
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Export the structured brief (`chatgpt_creative_brief.json`), logo, and real job photos to hand off to ChatGPT for custom graphic design.
          </div>
        </div>

        {onExportBrief && (
          <button
            onClick={onExportBrief}
            className="btn-gold"
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}
          >
            <Package size={14} />
            📦 Export for ChatGPT
          </button>
        )}
      </div>

      {/* Direct In-App DALL-E 3 Generation */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* OpenAI Key */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Key size={15} color="var(--gold-primary)" />
          <input
            type="password"
            placeholder="Enter OpenAI API Key (sk-...)"
            value={apiKey}
            onChange={(e) => handleSaveApiKey(e.target.value)}
            style={{
              flex: 1,
              background: "var(--bg-main)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-main)",
              padding: "0.45rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.8rem",
              outline: "none"
            }}
          />
          {apiKey && (
            <span style={{ fontSize: "0.75rem", color: "var(--accent-green)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <CheckCircle size={13} /> Saved
            </span>
          )}
        </div>

        {/* Prompt Presets */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
            Select Style Preset:
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            <button
              onClick={() => setPreset("gaf_roof")}
              className="btn-outline"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
            >
              🏠 GAF HDZ Roof
            </button>
            <button
              onClick={() => setPreset("metal_roof")}
              className="btn-outline"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
            >
              ⚡ Standing-Seam Metal
            </button>
            <button
              onClick={() => setPreset("remodel")}
              className="btn-outline"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
            >
              🔨 Luxury Remodel
            </button>
            <button
              onClick={() => setPreset("storm_defense")}
              className="btn-outline"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
            >
              ⛈️ Storm Shield
            </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              background: "var(--bg-main)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-main)",
              padding: "0.75rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              lineHeight: "1.4",
              resize: "none",
              outline: "none"
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              onClick={() => setAspectRatio("1024x1024")}
              className={aspectRatio === "1024x1024" ? "btn-gold" : "btn-outline"}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            >
              1:1 Square
            </button>
            <button
              onClick={() => setAspectRatio("1024x1792")}
              className={aspectRatio === "1024x1792" ? "btn-gold" : "btn-outline"}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            >
              9:16 Story / Reel
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !apiKey}
            className="btn-gold"
            style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem" }}
          >
            <Wand2 size={14} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating with DALL-E 3..." : "Generate AI Graphic"}
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(248, 113, 113, 0.1)",
            border: "1px solid rgba(248, 113, 113, 0.3)",
            color: "var(--accent-red)",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.78rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <AlertCircle size={14} />
            {errorMsg}
          </div>
        )}
      </div>

      {/* Generated Image Preview & Auto-Save Banner */}
      {generatedImageUrl && (
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <div style={{
            width: "100%",
            maxHeight: "380px",
            overflow: "hidden",
            borderRadius: "8px",
            border: "1px solid var(--border-gold)"
          }}>
            <img
              src={generatedImageUrl}
              alt="AI Generated Social Graphic"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--accent-green)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle size={14} />
              {savedFilePath ? `Saved to disk: ${savedFilePath.split("\\").pop()}` : "AI Graphic Ready"}
            </span>

            <a
              href={`/api/download-proxy?url=${encodeURIComponent(generatedImageUrl)}&filename=chatgpt_ai_graphic.png`}
              className="btn-gold"
              style={{ padding: "0.35rem 0.85rem", fontSize: "0.78rem", textDecoration: "none" }}
            >
              <Download size={13} />
              Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
