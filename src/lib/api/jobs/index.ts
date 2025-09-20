// Job API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { store } from '../../../store';
import { jobsActions } from '../../../store/slices/jobs/jobsSlice';

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
      store.dispatch(jobsActions.createJobStart());
      const response = await apiClient.post(API_ENDPOINTS.JOBS.CREATE, data);
      store.dispatch(jobsActions.createJobSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create job';
      store.dispatch(jobsActions.createJobFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get job details by ID
  async getJob(id: string): Promise<JobResponse> {
    try {
      store.dispatch(jobsActions.fetchJobDetailStart());
      const response = await apiClient.get(API_ENDPOINTS.JOBS.DETAIL(id));
      store.dispatch(jobsActions.fetchJobDetailSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch job details';
      store.dispatch(jobsActions.fetchJobDetailFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get list of jobs with filters
  async getJobs(filters?: JobFilters, page = 1, limit = 10): Promise<JobListResponse> {
    try {
      store.dispatch(jobsActions.fetchJobsStart());
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
      store.dispatch(jobsActions.fetchJobsSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch jobs';
      store.dispatch(jobsActions.fetchJobsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Get my jobs (client's jobs)
  async getMyJobs(filters?: JobFilters, page = 1, limit = 10): Promise<JobListResponse> {
    try {
      store.dispatch(jobsActions.fetchMyJobsStart());
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.JOBS.MY_JOBS}?${params}`);
      store.dispatch(jobsActions.fetchMyJobsSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch my jobs';
      store.dispatch(jobsActions.fetchMyJobsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Update job
  async updateJob(id: string, data: Partial<CreateJobRequest>): Promise<JobResponse> {
    try {
      store.dispatch(jobsActions.updateJobStart());
      const response = await apiClient.put(API_ENDPOINTS.JOBS.UPDATE(id), data);
      store.dispatch(jobsActions.updateJobSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update job';
      store.dispatch(jobsActions.updateJobFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Delete job
  async deleteJob(id: string): Promise<void> {
    try {
      store.dispatch(jobsActions.deleteJobStart());
      await apiClient.delete(API_ENDPOINTS.JOBS.DELETE(id));
      store.dispatch(jobsActions.deleteJobSuccess(id));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete job';
      store.dispatch(jobsActions.deleteJobFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Open/Publish job from draft
  async openJob(id: string): Promise<JobResponse> {
    try {
      store.dispatch(jobsActions.updateJobStart());
      const response = await apiClient.put(API_ENDPOINTS.JOBS.UPDATE(id), { status: 'open' });
      store.dispatch(jobsActions.updateJobSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to open job';
      store.dispatch(jobsActions.updateJobFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Apply to job
  async applyToJob(jobId: string, proposalData: any): Promise<any> {
    try {
      store.dispatch(jobsActions.applyToJobStart());
      const response = await apiClient.post(API_ENDPOINTS.JOBS.APPLY(jobId), proposalData);
      store.dispatch(jobsActions.applyToJobSuccess(response));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to apply to job';
      store.dispatch(jobsActions.applyToJobFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  // Clear error
  clearError(): void {
    store.dispatch(jobsActions.clearError());
  }

  // Set loading
  setLoading(loading: boolean): void {
    store.dispatch(jobsActions.setLoading(loading));
  }

  // Reset current job
  resetCurrentJob(): void {
    store.dispatch(jobsActions.resetCurrentJob());
  }
}

// Export singleton instance
export const jobService = new JobService();