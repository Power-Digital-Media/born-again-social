export interface RawPin {
  id: string;
  author: string;
  date: string;
  location: string;
  service: string;
  description: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  detailedExplanation?: string;
  aeoAnswers?: { question: string; answer: string }[];
  clientId?: string;
}

export interface SanitizedSocialJob {
  sourcePinId: string;
  projectClusterId: string;
  city: string;
  state: string;
  service: string;
  date: string;
  authorName: string;
  description: string;
  cleanImages: string[];
  photoCount: number;
  socialSafeUrl: string;
  contentHash: string;
  photosHash: string;
  opportunityScore: number;
  scoreBreakdown: {
    photoScore: number;
    beforeAfterScore: number;
    completenessScore: number;
    descriptionScore: number;
    recencyScore: number;
    rotationPenalty: number;
  };
  privacyFlags: string[];
  clusteredPinCount: number;
}

export interface CreativeBriefData {
  client: string;
  project_name?: string;
  city: string;
  service: string;
  verified_facts: string[];
  technician: string;
  approved_photos: string[];
  privacy_review: string;
  brand: {
    primary_style: string;
    tone: string;
    company_name: string;
    phone: string;
    website: string;
    logo_url?: string;
    official_logo_url?: string;
    brand_colors?: Record<string, string>;
  };
  creative_goal: string;
  preferred_styles: string[];
  selected_style: string;
  target_formats: string[];
  instructions: string[];
  suggested_hook: string;
  hashtags: string[];
}

export interface SocialCampaign {
  id: string;
  projectClusterId: string;
  sourcePinIds: string[];
  city: string;
  service: string;
  jobDate: string;
  technician: string;
  status: "discovered" | "scored" | "generated" | "approved" | "scheduled" | "published" | "archived";
  opportunityScore: number;
  
  // Platform Copy Packages
  facebookCopy: string;
  instagramCopy: string;
  gbpCopy: string; // Strictly NO phone numbers in text (GBP Policy Compliance)
  
  // Visual Package & Creative
  selectedImages: string[];
  recommendedLayout: "before_after" | "multi_carousel" | "single_hero" | "detail_showcase";
  creativeAssetUrl?: string;
  
  // Taxonomy Hashtags & Safe Links
  hashtags: string[];
  landingPageUrl: string;
  callToAction: string;
  
  // Fact-Check Validation
  factValidation: {
    isValid: boolean;
    extractedClaims: string[];
    unsupportedClaims: string[];
    confidence: number;
  };
  
  // Secret Share Link Token for ChatGPT
  shareToken?: string;
  shareExpiresAt?: string;
  creativeBrief?: CreativeBriefData;

  // Timestamps & Meta
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  platformStatuses?: {
    facebook?: "pending" | "published" | "failed";
    instagram?: "pending" | "published" | "failed";
    gbp?: "pending" | "published" | "failed";
  };
}
