import fs from "fs";
import path from "path";
import os from "os";
import { SanitizedSocialJob, SocialCampaign } from "./schema";

export interface IStorageAdapter {
  init(): Promise<void>;
  saveJobs(jobs: SanitizedSocialJob[]): Promise<void>;
  getJobs(): Promise<SanitizedSocialJob[]>;
  getJobByClusterId(clusterId: string): Promise<SanitizedSocialJob | null>;
  saveCampaign(campaign: SocialCampaign): Promise<SocialCampaign>;
  getCampaigns(): Promise<SocialCampaign[]>;
  getCampaignById(id: string): Promise<SocialCampaign | null>;
  getCampaignByShareToken(token: string): Promise<SocialCampaign | null>;
  updateCampaignStatus(id: string, status: SocialCampaign["status"]): Promise<boolean>;
  getRecentPostedCities(daysLimit?: number): Promise<string[]>;
  getRecentPostedServices(daysLimit?: number): Promise<string[]>;
}

// In-memory fallback caches for serverless
let memoryJobs: SanitizedSocialJob[] = [];
let memoryCampaigns: SocialCampaign[] = [];

class ServerlessResilientStorageAdapter implements IStorageAdapter {
  private dataDir: string;
  private jobsPath: string;
  private campaignsPath: string;

  constructor() {
    // If running in cloud/Netlify where process.cwd() is read-only, use os.tmpdir()
    const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
    this.dataDir = isServerless
      ? path.join(os.tmpdir(), "bornagain_data")
      : path.join(process.cwd(), "data");
    this.jobsPath = path.join(this.dataDir, "jobs.json");
    this.campaignsPath = path.join(this.dataDir, "campaigns.json");
  }

  async init(): Promise<void> {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (!fs.existsSync(this.jobsPath)) {
        fs.writeFileSync(this.jobsPath, JSON.stringify([], null, 2), "utf-8");
      }
      if (!fs.existsSync(this.campaignsPath)) {
        fs.writeFileSync(this.campaignsPath, JSON.stringify([], null, 2), "utf-8");
      }
    } catch (err) {
      console.warn("Storage init warning (using memory storage):", err);
    }
  }

  async saveJobs(jobs: SanitizedSocialJob[]): Promise<void> {
    memoryJobs = jobs;
    try {
      await this.init();
      const existing = await this.getJobs();
      const map = new Map<string, SanitizedSocialJob>();
      for (const j of existing) {
        map.set(j.projectClusterId, j);
      }
      for (const j of jobs) {
        map.set(j.projectClusterId, j);
      }
      const combined = Array.from(map.values());
      memoryJobs = combined;
      fs.writeFileSync(this.jobsPath, JSON.stringify(combined, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write jobs.json to disk:", err);
    }
  }

  async getJobs(): Promise<SanitizedSocialJob[]> {
    if (memoryJobs.length > 0) return memoryJobs;
    try {
      await this.init();
      const content = fs.readFileSync(this.jobsPath, "utf-8");
      const parsed = JSON.parse(content) as SanitizedSocialJob[];
      memoryJobs = parsed;
      return parsed;
    } catch {
      return memoryJobs;
    }
  }

  async getJobByClusterId(clusterId: string): Promise<SanitizedSocialJob | null> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.projectClusterId === clusterId) || null;
  }

  async saveCampaign(campaign: SocialCampaign): Promise<SocialCampaign> {
    const idx = memoryCampaigns.findIndex((c) => c.id === campaign.id);
    const updated = { ...campaign, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      memoryCampaigns[idx] = updated;
    } else {
      memoryCampaigns.unshift(updated);
    }

    try {
      await this.init();
      const campaigns = await this.getCampaigns();
      const cIdx = campaigns.findIndex((c) => c.id === campaign.id);
      if (cIdx >= 0) {
        campaigns[cIdx] = updated;
      } else {
        campaigns.unshift(updated);
      }
      fs.writeFileSync(this.campaignsPath, JSON.stringify(campaigns, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not save campaign to disk:", err);
    }
    return updated;
  }

  async getCampaigns(): Promise<SocialCampaign[]> {
    try {
      await this.init();
      const content = fs.readFileSync(this.campaignsPath, "utf-8");
      const parsed = JSON.parse(content) as SocialCampaign[];
      // Merge memory and disk
      const map = new Map<string, SocialCampaign>();
      for (const c of parsed) map.set(c.id, c);
      for (const c of memoryCampaigns) map.set(c.id, c);
      const combined = Array.from(map.values());
      memoryCampaigns = combined;
      return combined;
    } catch {
      return memoryCampaigns;
    }
  }

  async getCampaignById(id: string): Promise<SocialCampaign | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find((c) => c.id === id) || null;
  }

  async getCampaignByShareToken(token: string): Promise<SocialCampaign | null> {
    if (!token) return null;
    const campaigns = await this.getCampaigns();
    return campaigns.find((c) => c.shareToken === token) || null;
  }

  async updateCampaignStatus(id: string, status: SocialCampaign["status"]): Promise<boolean> {
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return false;
    campaign.status = status;
    campaign.updatedAt = new Date().toISOString();
    if (status === "approved") campaign.approvedAt = new Date().toISOString();
    if (status === "published") campaign.publishedAt = new Date().toISOString();

    const memIdx = memoryCampaigns.findIndex((c) => c.id === id);
    if (memIdx >= 0) memoryCampaigns[memIdx] = campaign;

    try {
      fs.writeFileSync(this.campaignsPath, JSON.stringify(campaigns, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write updated campaign to disk:", err);
    }
    return true;
  }

  async getRecentPostedCities(daysLimit = 3): Promise<string[]> {
    const campaigns = await this.getCampaigns();
    const cutoff = new Date(Date.now() - daysLimit * 24 * 60 * 60 * 1000).toISOString();
    return campaigns
      .filter((c) => c.status === "published" && (c.publishedAt || c.updatedAt) > cutoff)
      .map((c) => c.city);
  }

  async getRecentPostedServices(daysLimit = 3): Promise<string[]> {
    const campaigns = await this.getCampaigns();
    const cutoff = new Date(Date.now() - daysLimit * 24 * 60 * 60 * 1000).toISOString();
    return campaigns
      .filter((c) => c.status === "published" && (c.publishedAt || c.updatedAt) > cutoff)
      .map((c) => c.service);
  }
}

export const storage: IStorageAdapter = new ServerlessResilientStorageAdapter();
