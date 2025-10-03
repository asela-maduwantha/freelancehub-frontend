// Milestones API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Types for API requests and responses
export interface MilestoneResponse {
  _id?: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  order: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'paid' | 'rejected';
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
  contractId: string | { _id: string; id: string; title: string; [key: string]: any }; // Can be string ID or populated contract object
  paymentId: string | null;
  contract: any[]; // Contract data
  payment: any[]; // Payment data
  id: string;
}

export interface Deliverable {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface MilestoneListResponse {
  milestones: MilestoneResponse[];
  total: number;
}

export interface SubmitMilestoneRequest {
  deliverables: Deliverable[];
  submissionNote?: string;
}

export interface RejectMilestoneRequest {
  feedback: string;
}

export interface ProcessPaymentRequest {
  paymentId: string;
}

export interface FileUploadResponse {
  filename: string;
  url: string;
  size: number;
  type: string;
}

// API functions
export const milestoneApi = {
  // Get milestones for a contract
  getByContract: (contractId: string): Promise<MilestoneListResponse> => {
    return apiClient.get(API_ENDPOINTS.MILESTONES.LIST_BY_CONTRACT(contractId));
  },

  // Get all milestones with filtering
  getAll: (params?: {
    contractId?: string;
    status?: string;
    isOverdue?: boolean;
    page?: number;
    limit?: number;
  }): Promise<MilestoneListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.contractId) queryParams.append('contractId', params.contractId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isOverdue !== undefined) queryParams.append('isOverdue', params.isOverdue.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.MILESTONES.LIST_ALL}?${queryParams}`
      : API_ENDPOINTS.MILESTONES.LIST_ALL;
    
    return apiClient.get(url);
  },

  // Get overdue milestones
  getOverdue: (): Promise<MilestoneListResponse> => {
    return apiClient.get(API_ENDPOINTS.MILESTONES.OVERDUE);
  },

  // Get contract milestone statistics
  getStats: (contractId: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.MILESTONES.STATS(contractId));
  },

  // Start working on a milestone
  startWork: (milestoneId: string): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.START_WORK(milestoneId));
  },

  // Submit milestone work
  submitWork: (milestoneId: string, data: SubmitMilestoneRequest): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.SUBMIT_WORK(milestoneId), data);
  },

  // Approve submitted milestone
  approve: (milestoneId: string): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.APPROVE(milestoneId));
  },

  // Reject submitted milestone
  reject: (milestoneId: string, data: RejectMilestoneRequest): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.REJECT(milestoneId), data);
  },

  // Process milestone payment
  processPayment: (milestoneId: string, data: ProcessPaymentRequest): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.PROCESS_PAYMENT(milestoneId), data);
  },

  // Upload file for deliverable
  uploadFile: async (file: File, description?: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    return await apiClient.post(API_ENDPOINTS.FILES.UPLOAD_DOCUMENT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default milestoneApi;