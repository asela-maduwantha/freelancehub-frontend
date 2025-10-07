// Proposals API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { store } from '../../../store';
import { proposalsActions } from '../../../store/slices/proposals/proposalsSlice';

// Types for proposal API requests and responses
export interface ProposedRate {
  amount: number;
  type: 'fixed';
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
  estimatedDuration: EstimatedDuration;
  proposedMilestones?: ProposalMilestone[];
  attachments?: ProposalAttachment[];
}

export interface ProposalResponse {
  _id: string;
  job: {
    id: string;
    title: string;
    category: string;
    subcategory?: string;
    projectType: 'fixed-price';
    budget: {
      type: 'fixed' | 'range';
      min: number;
      max?: number;
      currency: string;
    };
    client: {
      id: string;
      email: string;
      fullName: string;
    };
  };
  freelancer: {
    id: string;
    email: string;
    fullName: string;
  };
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
      store.dispatch(proposalsActions.createProposalStart());
      const response = await apiClient.post(API_ENDPOINTS.PROPOSALS.CREATE, data);
      store.dispatch(proposalsActions.createProposalSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create proposal';
      store.dispatch(proposalsActions.createProposalFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get proposal details by ID
  async getProposal(id: string): Promise<ProposalResponse> {
    try {
      store.dispatch(proposalsActions.fetchProposalDetailStart());
      const response = await apiClient.get(API_ENDPOINTS.PROPOSALS.DETAIL(id));
      store.dispatch(proposalsActions.fetchProposalDetailSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch proposal details';
      store.dispatch(proposalsActions.fetchProposalDetailFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get list of proposals with filters
  async getProposals(filters?: ProposalFilters): Promise<ProposalListResponse> {
    try {
      store.dispatch(proposalsActions.fetchProposalsStart());
      const params = new URLSearchParams();

      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.jobId) params.append('jobId', filters.jobId);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.PROPOSALS.LIST}?${params}`);
      store.dispatch(proposalsActions.fetchProposalsSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch proposals';
      store.dispatch(proposalsActions.fetchProposalsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get user's own proposals
  async getMyProposals(filters?: ProposalFilters): Promise<ProposalListResponse> {
    try {
      store.dispatch(proposalsActions.fetchMyProposalsStart());
      const params = new URLSearchParams();

      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.jobId) params.append('jobId', filters.jobId);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.PROPOSALS.MY_PROPOSALS}?${params}`);
      store.dispatch(proposalsActions.fetchMyProposalsSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch your proposals';
      store.dispatch(proposalsActions.fetchMyProposalsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get proposals for a specific job
  async getProposalsByJob(jobId: string, page = 1, limit = 10): Promise<ProposalListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`${API_ENDPOINTS.PROPOSALS.BY_JOB(jobId)}?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job proposals');
    }
  }

  // Update proposal
  async updateProposal(id: string, data: Partial<CreateProposalRequest>): Promise<ProposalResponse> {
    try {
      store.dispatch(proposalsActions.updateProposalStart());
      const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.UPDATE(id), data);
      store.dispatch(proposalsActions.updateProposalSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update proposal';
      store.dispatch(proposalsActions.updateProposalFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Withdraw proposal
  async withdrawProposal(id: string): Promise<void> {
    try {
      store.dispatch(proposalsActions.withdrawProposalStart());
      await apiClient.delete(API_ENDPOINTS.PROPOSALS.DELETE(id));
      store.dispatch(proposalsActions.withdrawProposalSuccess(id));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to withdraw proposal';
      store.dispatch(proposalsActions.withdrawProposalFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Accept proposal (for clients)
  async acceptProposal(id: string): Promise<ProposalResponse> {
    try {
      store.dispatch(proposalsActions.acceptProposalStart());
      const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.ACCEPT(id));
      store.dispatch(proposalsActions.acceptProposalSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to accept proposal';
      store.dispatch(proposalsActions.acceptProposalFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Reject proposal (for clients)
  async rejectProposal(id: string): Promise<ProposalResponse> {
    try {
      store.dispatch(proposalsActions.rejectProposalStart());
      const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.REJECT(id));
      store.dispatch(proposalsActions.rejectProposalSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reject proposal';
      store.dispatch(proposalsActions.rejectProposalFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Clear error
  clearError(): void {
    store.dispatch(proposalsActions.clearError());
  }

  // Set loading
  setLoading(loading: boolean): void {
    store.dispatch(proposalsActions.setLoading(loading));
  }

  // Reset current proposal
  resetCurrentProposal(): void {
    store.dispatch(proposalsActions.resetCurrentProposal());
  }
}

// Export singleton instance
export const proposalService = new ProposalService();