// Project API services
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  PaginatedResponse,
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectTemplate,
  ProjectFilters,
  ProjectProgress,
  Milestone,
  Contract,
  ProjectInvitation,
  ProjectStats,
  ProjectAnalytics
} from '../../types';

export const projectApi = {
  // Get projects (authenticated - client or freelancer view)
  getProjects: async (filters?: ProjectFilters): Promise<PaginatedResponse<{ projects: Project[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`/api/v1/projects?${params.toString()}`);
    return response.data as PaginatedResponse<{ projects: Project[] }>;
  },

  // Get project by ID
  getProject: async (projectId: string): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}`);
    return response.data as ApiResponse<{ project: Project }>;
  },

  // Create new project
  createProject: async (projectData: CreateProjectData): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.post('/api/v1/projects', projectData);
    return response.data as ApiResponse<{ project: Project }>;
  },

  // Update project
  updateProject: async (projectId: string, updateData: UpdateProjectData): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.put(`/api/v1/projects/${projectId}`, updateData);
    return response.data as ApiResponse<{ project: Project }>;
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/projects/${projectId}`);
    return response.data as ApiResponse<any>;
  },

  // Get recommended projects (for freelancers)
  getRecommendedProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get('/api/v1/projects/recommended');
    return response.data as ApiResponse<Project[]>;
  },

  // Bookmark/Save project
  bookmarkProject: async (projectId: string): Promise<ApiResponse<{ bookmarked: boolean }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/bookmark`);
    return response.data as ApiResponse<{ bookmarked: boolean }>;
  },

  // Remove bookmark
  removeBookmark: async (projectId: string): Promise<ApiResponse<{ bookmarked: boolean }>> => {
    const response = await apiClient.delete(`/api/v1/projects/${projectId}/bookmark`);
    return response.data as ApiResponse<{ bookmarked: boolean }>;
  },

  // Get bookmarked projects
  getBookmarkedProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get('/api/v1/projects/bookmarks');
    return response.data as ApiResponse<Project[]>;
  },

  // Get project templates
  getProjectTemplates: async (category?: string): Promise<ApiResponse<ProjectTemplate[]>> => {
    const params = category ? `?category=${category}` : '';
    const response = await apiClient.get(`/api/v1/projects/templates${params}`);
    return response.data as ApiResponse<ProjectTemplate[]>;
  },

  // Get project template by ID
  getProjectTemplate: async (templateId: string): Promise<ApiResponse<ProjectTemplate>> => {
    const response = await apiClient.get(`/api/v1/projects/templates/${templateId}`);
    return response.data as ApiResponse<ProjectTemplate>;
  },

  // Create project from template
  createFromTemplate: async (templateId: string, overrides?: Partial<CreateProjectData>): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.post(`/api/v1/projects/templates/${templateId}/create`, overrides || {});
    return response.data as ApiResponse<{ project: Project }>;
  },

  // Update project progress
  updateProjectProgress: async (projectId: string, progressData: {
    status?: string;
    progressPercentage?: number;
    notes?: string;
  }): Promise<ApiResponse<{ project: ProjectProgress }>> => {
    const response = await apiClient.put(`/api/v1/projects/${projectId}/progress`, progressData);
    return response.data as ApiResponse<{ project: ProjectProgress }>;
  },

  // Get project milestones
  getProjectMilestones: async (projectId: string): Promise<ApiResponse<Milestone[]>> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/milestones`);
    return response.data as ApiResponse<Milestone[]>;
  },

  // Submit milestone
  submitMilestone: async (projectId: string, milestoneId: string, data: {
    deliverables?: string[];
    description?: string;
  }): Promise<ApiResponse<{ milestone: Milestone }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/submit`, data);
    return response.data as ApiResponse<{ milestone: Milestone }>;
  },

  // Approve milestone (client)
  approveMilestone: async (projectId: string, milestoneId: string): Promise<ApiResponse<{ milestone: Milestone }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/approve`);
    return response.data as ApiResponse<{ milestone: Milestone }>;
  },

  // Reject milestone (client)
  rejectMilestone: async (projectId: string, milestoneId: string, reason: string): Promise<ApiResponse<{ milestone: Milestone }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/reject`, { reason });
    return response.data as ApiResponse<{ milestone: Milestone }>;
  },

  // Get project contract
  getProjectContract: async (projectId: string): Promise<ApiResponse<Contract>> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/contract`);
    return response.data as ApiResponse<Contract>;
  },

  // Complete project
  completeProject: async (projectId: string, completionData?: {
    notes?: string;
    rating?: number;
  }): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/complete`, completionData || {});
    return response.data as ApiResponse<{ project: Project }>;
  },

  // Cancel project
  cancelProject: async (projectId: string, reason: string): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/cancel`, { reason });
    return response.data as ApiResponse<{ project: Project }>;
  },

  // Invite freelancer to project
  inviteFreelancer: async (projectId: string, data: {
    freelancerId: string;
    message: string;
  }): Promise<ApiResponse<{ invitation: ProjectInvitation }>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/invite`, data);
    return response.data as ApiResponse<{ invitation: ProjectInvitation }>;
  },

  // Get project invitations
  getProjectInvitations: async (projectId: string): Promise<ApiResponse<ProjectInvitation[]>> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/invitations`);
    return response.data as ApiResponse<ProjectInvitation[]>;
  },

  // Respond to project invitation
  respondToInvitation: async (invitationId: string, response: 'accept' | 'decline'): Promise<ApiResponse<{ invitation: ProjectInvitation }>> => {
    const responseData = await apiClient.post(`/api/v1/projects/invitations/${invitationId}/respond`, { response });
    return responseData.data as ApiResponse<{ invitation: ProjectInvitation }>;
  },

  // Get project analytics
  getProjectAnalytics: async (projectId: string): Promise<ApiResponse<ProjectAnalytics>> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/analytics`);
    return response.data as ApiResponse<ProjectAnalytics>;
  },

  // Flag project
  flagProject: async (projectId: string, reason: string, details?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/flag`, { reason, details });
    return response.data as ApiResponse<any>;
  },

  // Report project
  reportProject: async (projectId: string, data: {
    type: string;
    reason: string;
    details?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/report`, data);
    return response.data as ApiResponse<any>;
  }
};

// Client-specific project APIs
export const clientProjectApi = {
  // Get client's projects
  getClientProjects: async (status?: string): Promise<PaginatedResponse<{ projects: Project[] }>> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/api/v1/client/projects${params}`);
    return response.data as PaginatedResponse<{ projects: Project[] }>;
  },

  // Get project proposals
  getProjectProposals: async (projectId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/proposals`);
    return response.data as ApiResponse<any>;
  },

  // Get client project statistics
  getClientProjectStats: async (): Promise<ApiResponse<ProjectStats>> => {
    const response = await apiClient.get('/api/v1/client/projects/stats');
    return response.data as ApiResponse<ProjectStats>;
  }
};

// Freelancer-specific project APIs  
export const freelancerProjectApi = {
  // Get freelancer's active projects
  getActiveProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/projects/active');
    return response.data as ApiResponse<Project[]>;
  },

  // Get freelancer project statistics
  getFreelancerProjectStats: async (): Promise<ApiResponse<ProjectStats>> => {
    const response = await apiClient.get('/api/v1/freelancer/projects/stats');
    return response.data as ApiResponse<ProjectStats>;
  },

  // Get freelancer dashboard data
  getFreelancerDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/freelancer/dashboard');
    return response.data as ApiResponse<any>;
  },

  // Get recent activity
  getRecentActivity: async (limit?: number): Promise<ApiResponse<any[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/api/v1/freelancer/activity${params}`);
    return response.data as ApiResponse<any[]>;
  }
};

export default projectApi;
