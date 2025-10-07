// Contract API services
import { apiClient } from '../client';

// Types for API requests and responses
export interface CreateContractRequest {
  proposalId: string;
  startDate: string;
  endDate: string;
  terms?: string;
  milestones?: CreateContractMilestoneRequest[];
  paymentMethodId?: string; // For saved cards
  savePaymentMethod?: boolean; // For saving new cards
}

export interface CreateContractMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  currency?: string;
  durationDays: number;
}

export interface ContractResponse {
  _id: string;
  title: string;
  description: string;
  contractType: 'fixed-price';
  totalAmount: number;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'pending' | 'pending_payment_method';
  totalPaid: number;
  releasedAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  platformFeePercentage: number;
  platformFee: number;
  freelancerAmount: number;
  milestoneCount: number;
  completedMilestones: number;
  startDate: string;
  endDate: string;
  terms?: string;
  isClientSigned: boolean;
  isFreelancerSigned: boolean;
  stripePaymentIntentId?: string;
  paymentIntent?: any; // Stripe payment intent data
  setupIntent?: any; // Stripe setup intent for saving cards
  requiresPayment?: boolean; // Whether the contract requires payment
  clientId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    fullName: string;
  };
  freelancerId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      title?: string;
    };
    fullName: string;
  };
  jobId: {
    _id: string;
    title: string;
    category: string;
    subcategory?: string;
  };
  // Legacy fields still used in components
  proposalId?: {
    _id: string;
    proposedRate: {
      amount: number;
      type: string;
      currency: string;
    };
    status: string;
  };
  hourlyRate?: number;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
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
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt?: string;
}

export interface MilestonePayment {
  _id: string;
  amount: number;
  status: string;
  transactionId: string;
}

export interface MilestoneContractInfo {
  _id: string;
  currency: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  contractType: string;
  totalAmount: number;
  remainingAmount: number | null;
  completionPercentage: number | null;
  isActive: boolean;
  isCompleted: boolean;
  platformFee: number | null;
  freelancerAmount: number | null;
  id: string;
}

export interface MilestoneResponse {
  _id?: string;
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

export interface PayContractRequest {
  paymentMethodId: string;
}

export interface PayContractResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
    paymentId: string;
  };
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
      console.log('API call - getContractMilestones for contractId:', contractId);
      const response = await apiClient.get(`/milestones/contract/${contractId}/milestones`);
      console.log('API call - getContractMilestones response:', response);
      return response;
    } catch (error: any) {
      console.error('API call - getContractMilestones error:', error);
      console.error('API call - Error response:', error.response);
      throw new Error(error.response?.data?.message || 'Failed to fetch milestones');
    }
  }

  // Download contract as PDF
  async downloadContract(contractId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/contracts/${contractId}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download contract');
    }
  }

  // Pay for a contract using saved payment method
  async payContract(contractId: string, data: PayContractRequest): Promise<PayContractResponse> {
    try {
      const response = await apiClient.post(`/contracts/${contractId}/pay`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    }
  }

  // Cancel a contract (for regular users - client or freelancer)
  async cancelContract(contractId: string): Promise<ContractResponse> {
    try {
      const response = await apiClient.delete(`/contracts/${contractId}/cancel`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel contract');
    }
  }

  // Cancel a contract as admin with reason
  async adminCancelContract(contractId: string, reason: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch(`/admin/contracts/${contractId}/cancel`, { reason });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel contract');
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();