// Job API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Types for API requests and responses
export interface JobBudget {
  type: 'fixed' | 'hourly' | 'range';
  min: number;
  max?: number;
  currency?: string;
}

export interface JobDuration {
  type: 'less-than-1-month' | '1-3-months' | '3-6-months' | 'more-than-6-months';
  estimatedHours?: number;
}

export interface JobAttachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface JobLocation {
  type: 'remote' | 'onsite' | 'hybrid';
  countries?: string[];
  timezone?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  projectType: 'fixed-price' | 'hourly';
  budget: JobBudget;
  duration?: JobDuration;
  skills: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  isUrgent?: boolean;
  isFeatured?: boolean;
  attachments?: JobAttachment[];
  location?: JobLocation;
  maxProposals?: number;
  expiresAt?: string;
}

export interface JobClient {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export interface JobResponse {
  id: string;
  client: JobClient;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  projectType: 'fixed-price' | 'hourly';
  budget: JobBudget;
  duration?: JobDuration;
  skills: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  status: string;
  isUrgent: boolean;
  isFeatured: boolean;
  attachments?: JobAttachment[];
  location?: JobLocation;
  proposalCount: number;
  maxProposals?: number;
  selectedProposalId?: string | null;
  contractId?: string | null;
  postedAt: string;
  expiresAt?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isExpired: boolean;
  canReceiveProposals: boolean;
}

export interface JobListResponse {
  jobs: JobResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobFilters {
  status?: 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled';
  category?: string;
  clientId?: string;
  search?: string;
}

class JobService {
  // Create a new job
  async createJob(data: CreateJobRequest): Promise<JobResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOBS.CREATE, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create job');
    }
  }

  // Get job details by ID
  async getJob(id: string): Promise<JobResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOBS.DETAIL(id));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job details');
    }
  }

  // Get list of jobs with filters
  async getJobs(filters?: JobFilters, page = 1, limit = 10): Promise<JobListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.clientId) params.append('clientId', filters.clientId);
        if (filters.search) params.append('search', filters.search);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.JOBS.LIST}?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }

  // Get my jobs (client's jobs)
  async getMyJobs(filters?: JobFilters, page = 1, limit = 10): Promise<JobListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.JOBS.MY_JOBS}?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch my jobs');
    }
  }

  // Update job
  async updateJob(id: string, data: Partial<CreateJobRequest>): Promise<JobResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.JOBS.UPDATE(id), data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update job');
    }
  }

  // Open job for proposals (change status from draft to open)
  async openJob(id: string): Promise<JobResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.JOBS.UPDATE(id), { status: 'open' });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to open job');
    }
  }

  // Delete job
  async deleteJob(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.JOBS.DELETE(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete job');
    }
  }

  // Apply to job
  async applyToJob(jobId: string, proposalData: any): Promise<any> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOBS.APPLY(jobId), proposalData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to apply to job');
    }
  }
}

// Export singleton instance
export const jobService = new JobService();