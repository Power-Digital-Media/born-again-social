"use client";

import React from "react";
import { RefreshCw, Sparkles, Layers, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onSync: () => void;
  isSyncing: boolean;
  totalJobs: number;
  highScoreCount: number;
  activeCampaignCount: number;
  activeTab: "opportunities" | "campaigns" | "history";
  setActiveTab: (tab: "opportunities" | "campaigns" | "history") => void;
}

export function Navbar({
  onSync,
  isSyncing,
  totalJobs,
  highScoreCount,
  activeCampaignCount,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(10, 13, 20, 0.92)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 40,
      padding: "0.85rem 1.5rem"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Brand & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            background: "var(--gold-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0c0f16",
            fontWeight: 900,
            fontSize: "1.15rem",
            boxShadow: "0 0 16px rgba(243, 201, 115, 0.4)"
          }}>
            ✝
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
                BORN AGAIN
              </span>
              <span style={{
                fontSize: "0.65rem",
                textTransform: "uppercase",
                background: "rgba(243, 201, 115, 0.15)",
                color: "var(--gold-primary)",
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                fontWeight: 700,
                border: "1px solid var(--border-gold)"
              }}>
                Social Studio
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Content Operating System • Central Mississippi
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          background: "var(--bg-card-subtle)",
          padding: "0.25rem",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle)"
        }}>
          <button
            onClick={() => setActiveTab("opportunities")}
            style={{
              background: activeTab === "opportunities" ? "var(--bg-card-hover)" : "transparent",
              color: activeTab === "opportunities" ? "var(--gold-primary)" : "var(--text-muted)",
              border: "none",
              padding: "0.45rem 0.9rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Sparkles size={15} />
            Job Opportunities ({totalJobs})
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            style={{
              background: activeTab === "campaigns" ? "var(--bg-card-hover)" : "transparent",
              color: activeTab === "campaigns" ? "var(--gold-primary)" : "var(--text-muted)",
              border: "none",
              padding: "0.45rem 0.9rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Layers size={15} />
            Generated Campaigns ({activeCampaignCount})
          </button>
        </div>

        {/* Action Controls & Sync */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.75rem",
            color: "var(--accent-green)",
            background: "rgba(52, 211, 153, 0.1)",
            padding: "0.35rem 0.65rem",
            borderRadius: "6px",
            border: "1px solid rgba(52, 211, 153, 0.2)"
          }}>
            <ShieldCheck size={14} />
            Privacy & Fact Guard Active
          </div>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="btn-outline"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing Feed..." : "Sync Daily Jobs"}
          </button>
        </div>
      </div>
    </header>
  );
}
