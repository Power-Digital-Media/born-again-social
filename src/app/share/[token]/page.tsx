import React from "react";
import { notFound } from "next/navigation";
import { storage } from "@/lib/storage";
import {
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Palette,
  Phone,
  Globe
} from "lucide-react";
import SharePageClientTools from "@/components/SharePageClientTools";
import SharePhotoGallery from "@/components/SharePhotoGallery";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { token } = await params;
  const campaign = await storage.getCampaignByShareToken(token);
  if (!campaign) return { title: "Campaign Not Found" };

  return {
    title: `${campaign.city}, MS — ${campaign.service} | Creative Brief`,
    description: `Official creative package and verified job photography for Born Again Remodeling & Roofing in ${campaign.city}, MS.`,
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const campaign = await storage.getCampaignByShareToken(token);

  if (!campaign) {
    notFound();
  }

  const brief = campaign.creativeBrief;
  const photos = campaign.selectedImages || [];
  const briefJsonStr = JSON.stringify(brief || campaign, null, 2);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0c10",
      color: "#f1f3f5",
      padding: "2rem 1.5rem 5rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Top Branding Banner */}
        <header style={{
          background: "#12141c",
          border: "1px solid rgba(243, 201, 115, 0.35)",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f3c973 0%, #d1a453 50%, #b88630 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0c0f16",
              fontWeight: 900,
              fontSize: "1.6rem",
              boxShadow: "0 0 24px rgba(243, 201, 115, 0.4)"
            }}>
              ✝
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f3f5" }}>
                  BORN AGAIN REMODELING & ROOFING
                </h1>
                <span style={{
                  fontSize: "0.7rem",
                  background: "rgba(52, 211, 153, 0.15)",
                  color: "#34d399",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontWeight: 700,
                  border: "1px solid rgba(52, 211, 153, 0.3)"
                }}>
                  ✓ Privacy Verified (Zero Raw GPS/Addresses)
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#9ea4b0", marginTop: "0.2rem" }}>
                Creative Handoff Brief & Real Job Photography Package for ChatGPT Art Direction
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <SharePageClientTools briefJson={briefJsonStr} photoUrls={photos} />
            <a
              href={`/api/share/${token}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f3c973",
                padding: "0.55rem 0.9rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <ExternalLink size={14} />
              Raw JSON
            </a>
          </div>
        </header>

        {/* Instructions Callout for ChatGPT / User */}
        <div style={{
          background: "rgba(243, 201, 115, 0.06)",
          border: "1px solid rgba(243, 201, 115, 0.25)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.85rem",
          color: "#e2e8f0"
        }}>
          <Sparkles size={18} color="#f3c973" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: "#f3c973" }}>ChatGPT Creative Workflow:</strong> Provide this URL or copy the Creative Brief JSON below directly into ChatGPT with the prompt: <em>&ldquo;Create a custom 4:5 project showcase graphic for this job using the verified facts, brand colors, and approved photos.&rdquo;</em>
          </div>
        </div>

        {/* Project Facts Overview Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            background: "#12141c",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "1.25rem"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#9ea4b0", marginBottom: "0.3rem" }}>PROJECT LOCATION</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f3c973", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <MapPin size={16} />
              {campaign.city}, MS
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ea4b0", marginTop: "0.25rem" }}>Central Mississippi Metro</div>
          </div>

          <div style={{
            background: "#12141c",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "1.25rem"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#9ea4b0", marginBottom: "0.3rem" }}>SERVICE & CRAFTSMANSHIP</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f1f3f5" }}>
              {campaign.service}
            </div>
            <div style={{
              display: "inline-block",
              fontSize: "0.75rem",
              color: "#34d399",
              background: "rgba(52, 211, 153, 0.12)",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              marginTop: "0.35rem",
              fontWeight: 700
            }}>
              Style: {brief?.selected_style || "Project Showcase"}
            </div>
          </div>

          <div style={{
            background: "#12141c",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "1.25rem"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#9ea4b0", marginBottom: "0.3rem" }}>TECHNICIAN & DATE</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f1f3f5", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <User size={16} color="#38bdf8" />
              {campaign.technician}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ea4b0", marginTop: "0.25rem" }}>Completed: {campaign.jobDate}</div>
          </div>

          <div style={{
            background: "#12141c",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "1.25rem"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#9ea4b0", marginBottom: "0.3rem" }}>VERIFIED BRAND ASSETS</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f3c973", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Phone size={14} />
              (601) 573-6178
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ea4b0", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Globe size={13} />
              bornagainroofing.com
            </div>
          </div>
        </div>

        {/* Brand Tokens Card */}
        <div style={{
          background: "#12141c",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Palette size={18} color="#f3c973" />
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f3f5" }}>Brand Color Tokens & Creative Palette:</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#0c0f16", border: "1px solid #333", display: "inline-block" }}></span>
              <span style={{ fontSize: "0.78rem", color: "#9ea4b0" }}>Primary Navy (<code>#0c0f16</code>)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#131826", border: "1px solid #333", display: "inline-block" }}></span>
              <span style={{ fontSize: "0.78rem", color: "#9ea4b0" }}>Card Navy (<code>#131826</code>)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#f3c973", display: "inline-block" }}></span>
              <span style={{ fontSize: "0.78rem", color: "#f3c973" }}>Metallic Gold (<code>#f3c973</code>)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#b88630", display: "inline-block" }}></span>
              <span style={{ fontSize: "0.78rem", color: "#d1a453" }}>Deep Gold (<code>#b88630</code>)</span>
            </div>
          </div>
        </div>

        {/* Interactive Approved Real Job Photos Gallery & ZIP Bundler */}
        <SharePhotoGallery
          photos={photos}
          city={campaign.city}
          service={campaign.service}
          briefJson={briefJsonStr}
          copy={{
            facebook: campaign.facebookCopy,
            instagram: campaign.instagramCopy,
            gbp: campaign.gbpCopy,
          }}
        />

        {/* ChatGPT Creative Brief JSON Box */}
        <section style={{ marginBottom: "2.5rem" }}>
          <div style={{
            background: "#12141c",
            border: "1px solid rgba(243, 201, 115, 0.35)",
            borderRadius: "14px",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "1rem 1.5rem",
              background: "#0e1017",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={16} color="#f3c973" />
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f3c973" }}>
                  chatgpt_creative_brief.json
                </span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#9ea4b0" }}>
                Formatted for ChatGPT Art Direction & Custom Graphic Creation
              </span>
            </div>

            <pre style={{
              padding: "1.25rem 1.5rem",
              fontSize: "0.82rem",
              lineHeight: "1.5",
              color: "#e2e8f0",
              overflowX: "auto",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              maxHeight: "380px"
            }}>
              {briefJsonStr}
            </pre>
          </div>
        </section>

        {/* Approved Platform Post Copy */}
        <section>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "#f1f3f5" }}>
            Approved Social Copy Packages
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
            {/* Facebook */}
            <div style={{ background: "#12141c", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ fontWeight: 800, color: "#38bdf8", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                📘 Facebook Post Copy
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: "1.5", color: "#9ea4b0", whiteSpace: "pre-wrap" }}>
                {campaign.facebookCopy}
              </p>
            </div>

            {/* Instagram */}
            <div style={{ background: "#12141c", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ fontWeight: 800, color: "#f3c973", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                📷 Instagram Caption
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: "1.5", color: "#9ea4b0", whiteSpace: "pre-wrap" }}>
                {campaign.instagramCopy}
              </p>
            </div>

            {/* Google Business Profile */}
            <div style={{ background: "#12141c", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ fontWeight: 800, color: "#34d399", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                📍 Google Business Profile (Policy Compliant)
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: "1.5", color: "#9ea4b0", whiteSpace: "pre-wrap" }}>
                {campaign.gbpCopy}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

