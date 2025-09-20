// Milestones API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Types for API requests and responses
export interface MilestoneResponse {
  _id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  order: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
  contractId: string;
  paymentId: string | null;
  contract: any[]; // Contract data
  payment: any[]; // Payment data
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

  // Start working on a milestone
  startWork: (milestoneId: string): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.START_WORK(milestoneId));
  },

  // Submit milestone work
  submitWork: (milestoneId: string, data: SubmitMilestoneRequest): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.MILESTONES.SUBMIT_WORK(milestoneId), data);
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