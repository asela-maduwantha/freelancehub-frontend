import apiClient from "../../api/axios-instance";

export interface Contract {
  _id: string;
  projectId: string;
  freelancerId: string;
  clientId: string;
  proposalId: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'terminated' | 'disputed';
  
  // Milestones
  milestones: {
    _id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    deliverables?: string[];
    completedAt?: Date;
  }[];
  
  // Payment terms
  paymentTerms: {
    paymentSchedule: 'milestone' | 'hourly' | 'fixed';
    paymentDueDays: number;
    penaltyRate?: number;
  };
  
  // Terms and conditions
  terms: string;
  clientApproved: boolean;
  freelancerApproved: boolean;
  signedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  project?: {
    _id: string;
    title: string;
  };
  freelancer?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  client?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export interface CreateContractDto {
  projectId: string;
  freelancerId: string;
  proposalId: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  expectedEndDate: string;
  milestones: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    deliverables?: string[];
  }[];
  paymentTerms: {
    paymentSchedule: 'milestone' | 'hourly' | 'fixed';
    paymentDueDays: number;
    penaltyRate?: number;
  };
  terms: string;
}

export interface UpdateContractDto extends Partial<Omit<CreateContractDto, 'projectId' | 'freelancerId' | 'proposalId'>> {}

export interface ContractFilters {
  projectId?: string;
  freelancerId?: string;
  clientId?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'expectedEndDate';
  sortOrder?: 'asc' | 'desc';
}

export interface ContractListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MilestoneUpdateDto {
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deliverables?: string[];
}

export const contractApi = {
  // Get all contracts with filters
  getContracts: async (filters: ContractFilters = {}): Promise<ContractListResponse> => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/contracts?${params.toString()}`);
      
      // Handle different response structures
      if (response.data) {
        const data = response.data as any;
        if (data.data) {
          return data.data as ContractListResponse;
        }
        if (data.contracts || Array.isArray(data)) {
          return data as ContractListResponse;
        }
      }
      
      return {
        contracts: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    } catch (error) {
      console.error('Error in getContracts:', error);
      return {
        contracts: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  },

  // Get contract by ID
  getContract: async (id: string): Promise<{ success: boolean; data: Contract }> => {
    const response = await apiClient.get(`/contracts/${id}`);
    return response.data as { success: boolean; data: Contract };
  },

  // Create new contract
  createContract: async (contractDto: CreateContractDto): Promise<{ success: boolean; data: Contract }> => {
    const response = await apiClient.post('/contracts', contractDto);
    return response.data as { success: boolean; data: Contract };
  },

  // Update contract
  updateContract: async (id: string, updateDto: UpdateContractDto): Promise<{ success: boolean; data: Contract }> => {
    const response = await apiClient.patch(`/contracts/${id}`, updateDto);
    return response.data as { success: boolean; data: Contract };
  },

  // Delete contract
  deleteContract: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/contracts/${id}`);
    return response.data as { success: boolean; message: string };
  },

  // Approve contract (client or freelancer)
  approveContract: async (id: string): Promise<{ success: boolean; message: string; data?: Contract }> => {
    const response = await apiClient.post(`/contracts/${id}/approve`);
    return response.data as { success: boolean; message: string; data?: Contract };
  },

  // Start contract
  startContract: async (id: string): Promise<{ success: boolean; message: string; data?: Contract }> => {
    const response = await apiClient.post(`/contracts/${id}/start`);
    return response.data as { success: boolean; message: string; data?: Contract };
  },

  // Complete contract
  completeContract: async (id: string): Promise<{ success: boolean; message: string; data?: Contract }> => {
    const response = await apiClient.post(`/contracts/${id}/complete`);
    return response.data as { success: boolean; message: string; data?: Contract };
  },

  // Terminate contract
  terminateContract: async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/contracts/${id}/terminate`, { reason });
    return response.data as { success: boolean; message: string };
  },

  // Update milestone
  updateMilestone: async (contractId: string, milestoneId: string, updateDto: MilestoneUpdateDto): Promise<{ success: boolean; data: Contract }> => {
    const response = await apiClient.patch(`/contracts/${contractId}/milestones/${milestoneId}`, updateDto);
    return response.data as { success: boolean; data: Contract };
  },

  // Get my contracts (as freelancer)
  getMyContracts: async (filters: ContractFilters = {}): Promise<ContractListResponse> => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/contracts/my?${params.toString()}`);
      
      // Debug logging
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response structures
      if (response.data) {
        const data = response.data as any;
        // If the response has a nested data structure
        if (data.data) {
          return data.data as ContractListResponse;
        }
        // If the response data is the ContractListResponse directly
        if (data.contracts || Array.isArray(data)) {
          return data as ContractListResponse;
        }
      }
      
      // Fallback: return empty response structure
      console.warn('Unexpected API response structure:', response);
      return {
        contracts: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    } catch (error) {
      console.error('Error in getMyContracts:', error);
      // Return empty response structure on error
      return {
        contracts: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  },

  // Get contracts as client
  getClientContracts: async (filters: ContractFilters = {}): Promise<ContractListResponse> => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/contracts/client?${params.toString()}`);
      
      // Handle different response structures
      if (response.data) {
        const data = response.data as any;
        if (data.data) {
          return data.data as ContractListResponse;
        }
        if (data.contracts || Array.isArray(data)) {
          return data as ContractListResponse;
        }
      }
      
      return {
        contracts: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    } catch (error) {
      console.error('Error in getClientContracts:', error);
      return {
        contracts: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  },
};
