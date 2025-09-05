import { IProject } from "./project.types";

export interface IContract {
  _id: string;
  projectId: IProject;
  clientId: IClient;
  freelancerId: IFreelancer;
  proposalId: IProposal;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  contractType: string;
  terms: string;
  milestones: IMilestone[];
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  startDate: string;
  endDate: string;
  client_digital_signed: boolean;
  freelancer_digital_signed: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IClient {
  _id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastLoginAt?: string;
}

export interface IFreelancer {
  _id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastLoginAt?: string;
}

export interface IProposal {
  _id: string;
  coverLetter: string;
  proposedBudget: {
    amount: number;
    currency: string;
    type: string;
  };
  proposedDuration: {
    value: number;
    unit: string;
  };
  attachments: IAttachment[];
  milestones: IProposalMilestone[];
  status: string;
  createdAt: string;
}

export interface IAttachment {
  filename: string;
  url: string;
  description: string;
}

export interface IProposalMilestone {
  title: string;
  description: string;
  amount: number;
  durationDays: number;
  deliveryDate: string;
}

export interface IMilestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
  deliverables: any[];
  createdAt: string;
}