import fs from "fs";
import path from "path";
import { SanitizedSocialJob, SocialCampaign } from "./schema";

export interface IStorageAdapter {
  init(): Promise<void>;
  saveJobs(jobs: SanitizedSocialJob[]): Promise<void>;
  getJobs(): Promise<SanitizedSocialJob[]>;
  getJobByClusterId(clusterId: string): Promise<SanitizedSocialJob | null>;
  saveCampaign(campaign: SocialCampaign): Promise<SocialCampaign>;
  getCampaigns(): Promise<SocialCampaign[]>;
  getCampaignById(id: string): Promise<SocialCampaign | null>;
  updateCampaignStatus(id: string, status: SocialCampaign["status"]): Promise<boolean>;
  getRecentPostedCities(daysLimit?: number): Promise<string[]>;
  getRecentPostedServices(daysLimit?: number): Promise<string[]>;
}

class JsonFileStorageAdapter implements IStorageAdapter {
  private dataDir: string;
  private jobsPath: string;
  private campaignsPath: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), "data");
    this.jobsPath = path.join(this.dataDir, "jobs.json");
    this.campaignsPath = path.join(this.dataDir, "campaigns.json");
  }

  async init(): Promise<void> {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.jobsPath)) {
      fs.writeFileSync(this.jobsPath, JSON.stringify([], null, 2), "utf-8");
    }
    if (!fs.existsSync(this.campaignsPath)) {
      fs.writeFileSync(this.campaignsPath, JSON.stringify([], null, 2), "utf-8");
    }
  }

  async saveJobs(jobs: SanitizedSocialJob[]): Promise<void> {
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
    fs.writeFileSync(this.jobsPath, JSON.stringify(combined, null, 2), "utf-8");
  }

  async getJobs(): Promise<SanitizedSocialJob[]> {
    await this.init();
    try {
      const content = fs.readFileSync(this.jobsPath, "utf-8");
      return JSON.parse(content) as SanitizedSocialJob[];
    } catch {
      return [];
    }
  }

  async getJobByClusterId(clusterId: string): Promise<SanitizedSocialJob | null> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.projectClusterId === clusterId) || null;
  }

  async saveCampaign(campaign: SocialCampaign): Promise<SocialCampaign> {
    await this.init();
    const campaigns = await this.getCampaigns();
    const idx = campaigns.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) {
      campaigns[idx] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      campaigns.unshift({ ...campaign, updatedAt: new Date().toISOString() });
    }
    fs.writeFileSync(this.campaignsPath, JSON.stringify(campaigns, null, 2), "utf-8");
    return campaign;
  }

  async getCampaigns(): Promise<SocialCampaign[]> {
    await this.init();
    try {
      const content = fs.readFileSync(this.campaignsPath, "utf-8");
      return JSON.parse(content) as SocialCampaign[];
    } catch {
      return [];
    }
  }

  async getCampaignById(id: string): Promise<SocialCampaign | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find((c) => c.id === id) || null;
  }

  async updateCampaignStatus(id: string, status: SocialCampaign["status"]): Promise<boolean> {
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return false;
    campaign.status = status;
    campaign.updatedAt = new Date().toISOString();
    if (status === "approved") campaign.approvedAt = new Date().toISOString();
    if (status === "published") campaign.publishedAt = new Date().toISOString();
    fs.writeFileSync(this.campaignsPath, JSON.stringify(campaigns, null, 2), "utf-8");
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

export const storage: IStorageAdapter = new JsonFileStorageAdapter();
