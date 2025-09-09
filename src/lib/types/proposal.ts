export interface Pricing {
  amount: number;
  currency: string;
  type: 'fixed' | 'hourly';
  estimatedHours?: number;
  breakdown?: string;
}

export interface Milestone {
  title: string;
  description: string;
  deliveryDate: string;
  amount: number;
}

export interface Timeline {
  deliveryTime: number;
  startDate: string;
  milestones: Milestone[];
}

export interface Attachment {
  url: string;
  fileType: string;
  fileSize: number;
  description: string;
}

export interface Proposal {
  coverLetter: string;
  pricing: Pricing;
  timeline: Timeline;
  portfolioLinks: string[];
  attachments: Attachment[];
  additionalInfo: string;
}