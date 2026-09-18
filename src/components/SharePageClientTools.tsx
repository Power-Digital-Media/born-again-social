"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Layers } from "lucide-react";

interface SharePageClientToolsProps {
  briefJson: string;
  photoUrls: string[];
}

export default function SharePageClientTools({ briefJson, photoUrls }: SharePageClientToolsProps) {
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPhotos, setCopiedPhotos] = useState(false);

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefJson);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyPhotoLinks = async () => {
    try {
      await navigator.clipboard.writeText(photoUrls.join("\n"));
      setCopiedPhotos(true);
      setTimeout(() => setCopiedPhotos(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
      <button
        onClick={handleCopyLink}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: copiedLink ? "#34d399" : "#f1f3f5",
          padding: "0.55rem 0.9rem",
          borderRadius: "8px",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          transition: "all 0.15s ease"
        }}
      >
        {copiedLink ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
        {copiedLink ? "Link Copied!" : "Copy Share Link"}
      </button>

      <button
        onClick={handleCopyBrief}
        style={{
          background: "linear-gradient(135deg, rgba(243, 201, 115, 0.2) 0%, rgba(209, 164, 83, 0.25) 100%)",
          border: "1px solid rgba(243, 201, 115, 0.4)",
          color: copiedBrief ? "#34d399" : "#f3c973",
          padding: "0.55rem 1rem",
          borderRadius: "8px",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          transition: "all 0.15s ease"
        }}
      >
        {copiedBrief ? <Check size={14} color="#34d399" /> : <Sparkles size={14} />}
        {copiedBrief ? "Brief JSON Copied!" : "Copy ChatGPT Brief JSON"}
      </button>

      {photoUrls.length > 0 && (
        <button
          onClick={handleCopyPhotoLinks}
          style={{
            background: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            color: copiedPhotos ? "#34d399" : "#38bdf8",
            padding: "0.55rem 0.9rem",
            borderRadius: "8px",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.15s ease"
          }}
        >
          {copiedPhotos ? <Check size={14} color="#34d399" /> : <Layers size={14} />}
          {copiedPhotos ? "URLs Copied!" : "Copy Photo URLs"}
        </button>
      )}
    </div>
  );
}
