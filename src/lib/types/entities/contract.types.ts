import { IProject } from "./project.types";

export interface IContract {
  _id: string;
  projectId: IProject;
  clientId: IClient;
  freelancerId: IFreelancer;
  proposalId: IProposal;
  terms: ITerms;
  milestones: IMilestone[];
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  approvalWorkflow: IApprovalWorkflow;
  totalPaid: number;
  totalEscrow: number;
  createdAt: string;
  updatedAt: string;
}

export interface IClient {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  profilePicture: string;
  rating: number;
  reviewsCount: number;
}

export interface IFreelancer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  companyName?: string;
  rating: number;
  reviewsCount: number;
  skills: string[];
}

export interface IProposal {
  _id: string;
  proposedBudget: number;
  proposedDuration: {
    value: number;
    unit: string;
  };
  coverLetter: string;
  milestones: IMilestone[];
  attachments?: string[];
  status: string;
  createdAt: string;
}

export interface ITerms {
  budget: number;
  paymentType: 'fixed' | 'hourly';
  startDate: string;
  endDate: string;
  paymentSchedule: string;
}

export interface IMilestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
  submissions?: ISubmission[];
}

export interface IApprovalWorkflow {
  clientApproved: boolean;
  freelancerApproved: boolean;
  clientApprovedAt?: string;
  freelancerApprovedAt?: string;
  approvalOrder?: string;
}

export interface ISubmission {
  files: string[];
  description: string;
  submittedAt: string;
  feedback: string;
}