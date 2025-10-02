// Milestone Types for Fund Release

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under-review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: MilestoneStatus;
  contractId: string;
  freelancerId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  clientId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dueDate: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  deliverables?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateMilestoneRequest {
  contractId: string;
  title: string;
  description: string;
  amount: number;
  currency?: string;
  dueDate: string;
  deliverables?: string[];
}

export interface SubmitMilestoneRequest {
  deliverables: string[];
  attachments?: File[];
  notes?: string;
}

export interface ApproveMilestoneRequest {
  feedback?: string;
}

export interface RejectMilestoneRequest {
  reason: string;
  requestRevision?: boolean;
}

// Response Types
export interface MilestoneResponse {
  milestone: Milestone;
}

export interface MilestonesResponse {
  milestones: Milestone[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Parameters
export interface GetMilestonesQuery {
  contractId?: string;
  freelancerId?: string;
  clientId?: string;
  status?: MilestoneStatus;
  page?: number;
  limit?: number;
}

// Milestone Summary for Contract
export interface MilestoneSummary {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
