import { ProposalStatus, Money, FileUpload } from './common';
import { FreelancerInfo, ClientInfo } from './project';

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  clientId: string;
  coverLetter: string;
  pricing: Money;
  deliveryDays: number;
  status: ProposalStatus;
  submittedAt: string;
  updatedAt?: string;
  viewedByClient?: boolean;
  clientLastSeen?: string;
  attachments?: FileUpload[];
  milestones?: ProposalMilestone[];
  additionalNotes?: string;
}

export interface ProposalMilestone {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  deliverables?: string[];
}

export interface ProposalWithProject extends Proposal {
  project: {
    id: string;
    title: string;
    description?: string;
    budget: Money;
    client: ClientInfo;
  };
}

export interface ProposalWithFreelancer extends Proposal {
  freelancer: FreelancerInfo;
}

export interface CreateProposalData {
  projectId: string;
  coverLetter: string;
  pricing: Money;
  deliveryDays: number;
  attachments?: string[]; // File IDs
  milestones?: ProposalMilestone[];
  additionalNotes?: string;
}

export interface UpdateProposalData {
  coverLetter?: string;
  pricing?: Money;
  deliveryDays?: number;
  attachments?: string[];
  milestones?: ProposalMilestone[];
  additionalNotes?: string;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  projectId?: string;
  freelancerId?: string;
  minAmount?: number;
  maxAmount?: number;
  submittedAfter?: string;
  submittedBefore?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProposalStats {
  total: number;
  submitted: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  successRate: number;
  averageAmount: number;
  averageResponseTime: number; // in hours
}

export interface ProposalAnalytics {
  viewRate: number;
  responseRate: number;
  acceptanceRate: number;
  averageViewTime: number; // in minutes
  competitionLevel: 'low' | 'medium' | 'high';
  suggestedImprovements: string[];
}

// Client side proposal management
export interface ProposalReview {
  id: string;
  proposalId: string;
  rating?: number;
  notes?: string;
  decision: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  reviewedAt?: string;
  reviewedBy: string;
}

export interface ProposalComparison {
  proposals: ProposalWithFreelancer[];
  criteria: {
    budget: { weight: number; direction: 'asc' | 'desc' };
    experience: { weight: number; direction: 'desc' };
    rating: { weight: number; direction: 'desc' };
    deliveryTime: { weight: number; direction: 'asc' };
  };
  recommendations: {
    proposalId: string;
    score: number;
    reasons: string[];
  }[];
}

export interface ProposalTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  lastUsed?: string;
}

export interface CreateProposalTemplateData {
  name: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
}

// Bulk proposal operations
export interface BulkProposalAction {
  proposalIds: string[];
  action: 'shortlist' | 'reject' | 'archive' | 'delete';
  reason?: string;
  notes?: string;
}

export interface ProposalNotification {
  proposalId: string;
  type: 'viewed' | 'shortlisted' | 'accepted' | 'rejected' | 'message_received';
  timestamp: string;
  data?: any;
}
