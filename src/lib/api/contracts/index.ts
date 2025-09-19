// Contract API services
import { apiClient } from '../client';

// Types for API requests and responses
export interface CreateContractRequest {
  proposalId: string;
  startDate: string;
  endDate: string;
  terms?: string;
}

export interface ContractResponse {
  _id: string;
  proposalId: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  contractType: string;
  totalAmount: number;
  currency: string;
  hourlyRate?: number;
  startDate: string;
  endDate: string;
  status: string;
  platformFeePercentage: number;
  totalPaid: number;
  milestoneCount: number;
  completedMilestones?: number;
  estimatedHours?: number;
  terms?: string;
  isClientSigned: boolean;
  isFreelancerSigned: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ContractListResponse {
  contracts: ContractResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateMilestoneRequest {
  contractId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  order: number;
  dueDate: string;
}

export interface MilestoneDeliverable {
  title: string;
  description: string;
  fileUrl: string;
}

export interface MilestonePayment {
  _id: string;
  amount: number;
  status: string;
  transactionId: string;
}

export interface MilestoneContractInfo {
  _id: string;
  title: string;
  clientId: string;
  freelancerId: string;
}

export interface MilestoneResponse {
  _id: string;
  contractId: string | MilestoneContractInfo;
  title: string;
  description: string;
  amount: number;
  currency: string;
  order: number;
  dueDate: string;
  status: string;
  deliverables: MilestoneDeliverable[];
  submissionNote?: string;
  clientFeedback?: string;
  paymentId?: MilestonePayment;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  isOverdue: boolean;
  daysUntilDue: number;
  hasDeliverables: boolean;
  isPending: boolean;
  isInProgress: boolean;
  isSubmitted: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isPaid: boolean;
  id: string;
}

export interface CreateMilestoneResponse extends MilestoneResponse {
  // API client extracts the data.data part, so this will be the milestone object directly
}

export interface ContractMilestonesResponse {
  milestones: MilestoneResponse[];
  total: number;
}

class ContractService {
  // Create a new contract
  async createContract(data: CreateContractRequest): Promise<ContractResponse> {
    try {
      const response = await apiClient.post('/contracts', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create contract');
    }
  }

  // Get contract by ID
  async getContract(id: string): Promise<ContractResponse> {
    try {
      const response = await apiClient.get(`/contracts/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contract');
    }
  }

  // Get contracts list for client
  async getContracts(page = 1, limit = 10): Promise<ContractListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/contracts?${params}`);
      console.log('ContractService.getContracts response:', response);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contracts');
    }
  }

  // Update contract
  async updateContract(id: string, data: Partial<CreateContractRequest>): Promise<ContractResponse> {
    try {
      const response = await apiClient.put(`/contracts/${id}`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update contract');
    }
  }

  // Sign contract
  async signContract(id: string): Promise<ContractResponse> {
    try {
      const response = await apiClient.post(`/contracts/${id}/sign`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to sign contract');
    }
  }

  // Create milestone
  async createMilestone(data: CreateMilestoneRequest): Promise<CreateMilestoneResponse> {
    try {
      const response = await apiClient.post('/milestones', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create milestone');
    }
  }

  // Get milestones for a contract
  async getContractMilestones(contractId: string): Promise<ContractMilestonesResponse> {
    try {
      const response = await apiClient.get(`/milestones/contract/${contractId}/milestones`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch milestones');
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();