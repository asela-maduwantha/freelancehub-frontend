import { apiClient } from './client';
import { IProject, IPaginationOptions, IDashboardProposal } from '../types';
import { ProjectsResponse, ClientDashboardResponse } from '../types/api/responses.types';

export interface ClientProject extends IProject {
  freelancer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  deadline: string;
}

export interface ClientDashboard {
  totalProjects: number;
  projectsByStatus: {
    open: number;
    'in-progress': number;
    completed: number;
    cancelled: number;
    disputed: number;
  };
  totalProposals: number;
  recentProjects: IProject[];
  latestProposals: IDashboardProposal[];
}

export interface ClientDashboardProject {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  budget: {
    amount: number;
  };
}

export class ClientsService {
  /**
   * Get client projects
   */
  async getProjects(params?: IPaginationOptions & { status?: string }): Promise<ProjectsResponse> {
    return apiClient.get('/clients/projects', params);
  }

  /**
   * Get client project by ID
   */
  async getProjectById(id: string): Promise<ClientProject> {
    return apiClient.get(`/clients/projects/${id}`);
  }

  /**
   * Create a new project
   */
  async createProject(projectData: {
    title: string;
    description: string;
    budget: number;
    deadline: string;
    category?: string;
    skills?: string[];
  }): Promise<ClientProject> {
    return apiClient.post('/clients/projects', projectData);
  }

  /**
   * Get client proposals
   */
  async getProposals(params?: IPaginationOptions): Promise<{ proposals: any[]; total: number; page: number; limit: number }> {
    return apiClient.get('/clients/proposals', params);
  }

  /**
   * Get proposals for a specific project
   */
  async getProjectProposals(projectId: string): Promise<any[]> {
    return apiClient.get(`/clients/projects/${projectId}/proposals`);
  }

  /**
   * Accept proposal
   */
  async acceptProposal(
    projectId: string, 
    proposalId: string, 
    message?: string
  ): Promise<any> {
    return apiClient.post(`/clients/projects/${projectId}/proposals/${proposalId}/accept`, { message });
  }

  /**
   * Reject proposal
   */
  async rejectProposal(
    projectId: string, 
    proposalId: string, 
    reason?: string
  ): Promise<any> {
    return apiClient.post(`/clients/projects/${projectId}/proposals/${proposalId}/reject`, { reason });
  }

  /**
   * Get client dashboard
   */
  async getDashboard(): Promise<ClientDashboard> {
    const response: ClientDashboardResponse = await apiClient.get('/clients/dashboard');
    return response;
  }
}

export const clientsService = new ClientsService();