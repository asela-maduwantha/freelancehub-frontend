import { apiClient } from './client';
import {
  CreateProjectRequest,
  IProject,
  IApiResponse,
  PaginatedApiResponse,
  ProjectFilters,
  IPaginationOptions
} from '../types';

export interface ProjectsQueryParams extends ProjectFilters, IPaginationOptions {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[]; 
}

export class ProjectsService {
  /**
   * Get projects with filters
   */
  async getProjects(params?: ProjectsQueryParams): Promise<PaginatedApiResponse<IProject>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status?.length) searchParams.append('status', params.status.join(','));
    if (params?.category) searchParams.append('category', params.category);
    if (params?.minBudget) searchParams.append('minBudget', params.minBudget.toString());
    if (params?.maxBudget) searchParams.append('maxBudget', params.maxBudget.toString());
    if (params?.skills) searchParams.append('skills', params.skills.join(','));

    return apiClient.getPublic(`/projects?${searchParams.toString()}`);
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectRequest): Promise<IProject> {
    return apiClient.post('/projects', data);
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<IProject> {
    return apiClient.get(`/projects/${id}`);
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<CreateProjectRequest>): Promise<IApiResponse> {
    return apiClient.put(`/projects/${id}`, data);
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<IApiResponse> {
    return apiClient.delete(`/projects/${id}`);
  }

  /**
   * Submit proposal for a project
   */
  async submitProposal(projectId: string, data: {
    proposedBudget: number;
    proposedDuration: { value: number; unit: string };
    coverLetter: string;
    milestones?: Array<{ title: string; description: string; amount: number }>;
  }): Promise<IApiResponse> {
    return apiClient.post(`/projects/${projectId}/proposals`, data);
  }

  /**
   * Get proposals for a project
   */
  async getProjectProposals(projectId: string): Promise<any[]> {
    return apiClient.get(`/projects/${projectId}/proposals`);
  }
}

export const projectsService = new ProjectsService();