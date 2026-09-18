"use client";

import React from "react";
import { SocialCampaign } from "@/lib/storage/schema";
import { CheckCircle, Clock, Eye, MapPin, Sparkles, ExternalLink } from "lucide-react";

interface PostHistoryTableProps {
  campaigns: SocialCampaign[];
  onOpenCampaign: (campaign: SocialCampaign) => void;
}

export function PostHistoryTable({ campaigns, onOpenCampaign }: PostHistoryTableProps) {
  if (campaigns.length === 0) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
          padding: "3rem",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <Sparkles size={36} color="var(--gold-primary)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Generated Campaigns Yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Click "✨ BUILD CAMPAIGN" on any job in the Job Opportunities tab to generate your first social package.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Campaign Library & History</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Track generated, approved, and published social packages.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-card-subtle)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "0.85rem 1.25rem" }}>City & Service</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Tech & Date</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Opportunity Score</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Status</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Fact Check</th>
                <th style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => {
                const statusColor =
                  camp.status === "published"
                    ? "var(--accent-green)"
                    : camp.status === "approved"
                    ? "var(--accent-blue)"
                    : "var(--gold-primary)";

                return (
                  <tr key={camp.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                        {camp.city}, MS
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--gold-primary)" }}>
                        {camp.service}
                      </div>
                    </td>

                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div>{camp.technician}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{camp.jobDate}</div>
                    </td>

                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span className="badge-score-high">
                        COS {camp.opportunityScore}
                      </span>
                    </td>

                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: `rgba(255, 255, 255, 0.05)`,
                        color: statusColor,
                        border: `1px solid ${statusColor}`
                      }}>
                        {camp.status}
                      </span>
                    </td>

                    <td style={{ padding: "1rem 1.25rem" }}>
                      {camp.factValidation.isValid ? (
                        <span style={{ color: "var(--accent-green)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <CheckCircle size={14} /> 100% Grounded
                        </span>
                      ) : (
                        <span style={{ color: "var(--accent-amber)" }}>
                          ⚠️ Flagged Claims
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <button
                        onClick={() => onOpenCampaign(camp)}
                        className="btn-outline"
                        style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem" }}
                      >
                        <Eye size={13} /> View Studio
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
