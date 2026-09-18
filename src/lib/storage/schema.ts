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
  authorName: string; // e.g. "Christopher" or "Chris S."
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
  creativeAssetUrl?: string; // 4:5 or B/A rendered image data
  
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
