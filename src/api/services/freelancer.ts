// Freelancer API services
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  FreelancerProfile,
  FreelancerProfileUpdateData,
  PortfolioItem,
  PortfolioItemData
} from '../../types';

export const freelancerApi = {
  // Get freelancer profile
  getProfile: async (): Promise<ApiResponse<FreelancerProfile>> => {
    const response = await apiClient.get('/api/v1/freelancer/profile');
    return response.data as ApiResponse<FreelancerProfile>;
  },

  // Update freelancer profile
  updateProfile: async (data: FreelancerProfileUpdateData): Promise<ApiResponse<FreelancerProfile>> => {
    // Transform data to match backend structure
    const backendData = {
      title: data.title,
      bio: data.bio,
      skills: data.skills,
      hourlyRate: data.hourlyRate,
      availability: data.availability,
      experienceLevel: data.experienceLevel
    };
    
    const response = await apiClient.put('/api/v1/freelancer/profile', backendData);
    return response.data as ApiResponse<FreelancerProfile>;
  },

  // Get portfolio items
  getPortfolio: async (): Promise<ApiResponse<PortfolioItem[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/portfolio');
    return response.data as ApiResponse<PortfolioItem[]>;
  },

  // Create portfolio item
  createPortfolioItem: async (data: PortfolioItemData): Promise<ApiResponse<PortfolioItem>> => {
    const response = await apiClient.post('/api/v1/freelancer/portfolio', data);
    return response.data as ApiResponse<PortfolioItem>;
  },

  // Update portfolio item
  updatePortfolioItem: async (id: string, data: Partial<PortfolioItemData>): Promise<ApiResponse<PortfolioItem>> => {
    const response = await apiClient.put(`/api/v1/freelancer/portfolio/${id}`, data);
    return response.data as ApiResponse<PortfolioItem>;
  },

  // Delete portfolio item
  deletePortfolioItem: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/portfolio/${id}`);
    return response.data as ApiResponse<void>;
  },

  // Upload portfolio images
  uploadPortfolioImage: async (file: File): Promise<ApiResponse<{ url: string; fileId: string }>> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post('/api/v1/freelancer/portfolio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ApiResponse<{ url: string; fileId: string }>;
  },

  // Get dashboard data
  getDashboard: async (): Promise<ApiResponse<{
    stats: {
      profileCompletion: number;
      activeProposals: number;
      completedProjects: number;
      totalEarnings: number;
    };
    recentActivity: any[];
    recommendations: any[];
  }>> => {
    const response = await apiClient.get('/api/v1/freelancer/dashboard');
    return response.data as ApiResponse<{
      stats: {
        profileCompletion: number;
        activeProposals: number;
        completedProjects: number;
        totalEarnings: number;
      };
      recentActivity: any[];
      recommendations: any[];
    }>;
  },


  // Get skill suggestions
  getSkillSuggestions: async (query: string): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get(`/api/v1/freelancer/skills/suggestions?q=${encodeURIComponent(query)}`);
    return response.data as ApiResponse<string[]>;
  },

  // Complete onboarding
  completeOnboarding: async (): Promise<ApiResponse<{ profileCompletion: number }>> => {
    const response = await apiClient.post('/api/v1/freelancer/onboarding/complete');
    return response.data as ApiResponse<{ profileCompletion: number }>;
  }
};

export default freelancerApi;
