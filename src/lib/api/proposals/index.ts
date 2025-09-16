// Proposals API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Types for proposal API requests and responses
export interface ProposedRate {
  amount: number;
  type: 'fixed' | 'hourly';
  currency?: string;
}

export interface EstimatedDuration {
  value: number;
  unit: 'days' | 'weeks' | 'months';
}

export interface ProposalMilestone {
  title: string;
  description: string;
  amount: number;
  durationDays: number;
}

export interface ProposalAttachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface CreateProposalRequest {
  jobId: string;
  coverLetter: string;
  proposedRate: ProposedRate;
  estimatedDuration?: EstimatedDuration;
  proposedMilestones?: ProposalMilestone[];
  attachments?: ProposalAttachment[];
}

export interface ProposalResponse {
  _id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate: ProposedRate;
  estimatedDuration?: EstimatedDuration;
  proposedMilestones?: ProposalMilestone[];
  attachments?: ProposalAttachment[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  clientViewed: boolean;
  clientViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalListResponse {
  proposals: ProposalResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProposalFilters {
  status?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}

class ProposalService {
  // Create a new proposal
  async createProposal(data: CreateProposalRequest): Promise<ProposalResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PROPOSALS.CREATE, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create proposal');
    }
  }

  // Get proposal details by ID
  async getProposal(id: string): Promise<ProposalResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROPOSALS.DETAIL(id));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch proposal details');
    }
  }

  // Get list of proposals with filters
  async getProposals(filters?: ProposalFilters): Promise<ProposalListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.jobId) params.append('jobId', filters.jobId);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.PROPOSALS.LIST}?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch proposals');
    }
  }

  // Update proposal
  async updateProposal(id: string, data: Partial<CreateProposalRequest>): Promise<ProposalResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.UPDATE(id), data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update proposal');
    }
  }

  // Withdraw proposal
  async withdrawProposal(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.PROPOSALS.WITHDRAW(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to withdraw proposal');
    }
  }
}

// Export singleton instance
export const proposalService = new ProposalService();