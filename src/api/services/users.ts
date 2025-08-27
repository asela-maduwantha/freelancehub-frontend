// User and Profile API services
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  PaginatedResponse,
  FreelancerProfile,
  ClientProfile,
  PortfolioItem,
  ExperienceItem,
  EducationItem,
  Certification,
  Language,
  FreelancerProfileUpdateData,
  ClientProfileUpdateData,
  FreelancerSearchFilters
} from '../../types';

export const userApi = {
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<{ user: FreelancerProfile | ClientProfile }>> => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data as ApiResponse<{ user: FreelancerProfile | ClientProfile }>;
  },

  // Update profile picture
  updateProfilePicture: async (imageFile: File): Promise<ApiResponse<{ profilePhoto: string }>> => {
    const formData = new FormData();
    formData.append('profilePhoto', imageFile);
    
    const response = await apiClient.post('/api/v1/auth/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ApiResponse<{ profilePhoto: string }>;
  },

  // Delete profile picture
  deleteProfilePicture: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete('/api/v1/auth/profile/photo');
    return response.data as ApiResponse<any>;
  },

  // Get user by ID or username
  getUserProfile: async (identifier: string): Promise<ApiResponse<FreelancerProfile | ClientProfile>> => {
    const response = await apiClient.get(`/api/v1/users/${identifier}`);
    return response.data as ApiResponse<FreelancerProfile | ClientProfile>;
  },

  // Search users
  searchUsers: async (query: string, filters?: {
    role?: 'freelancer' | 'client';
    location?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{ users: (FreelancerProfile | ClientProfile)[] }>> => {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/api/v1/users/search?${params.toString()}`);
    return response.data as PaginatedResponse<{ users: (FreelancerProfile | ClientProfile)[] }>;
  }
};

// Freelancer-specific APIs
export const freelancerApi = {
  // Update freelancer profile
  updateProfile: async (profileData: FreelancerProfileUpdateData): Promise<ApiResponse<{ profile: FreelancerProfile }>> => {
    const response = await apiClient.put('/api/v1/freelancer/profile', profileData);
    return response.data as ApiResponse<{ profile: FreelancerProfile }>;
  },

  // Get freelancer statistics
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/freelancer/stats');
    return response.data as ApiResponse<any>;
  },

  // Search freelancers
  searchFreelancers: async (filters: FreelancerSearchFilters): Promise<PaginatedResponse<{ freelancers: FreelancerProfile[] }>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/api/v1/freelancers?${params.toString()}`);
    return response.data as PaginatedResponse<{ freelancers: FreelancerProfile[] }>;
  },

  // Get freelancer portfolio
  getPortfolio: async (freelancerId?: string): Promise<ApiResponse<PortfolioItem[]>> => {
    const endpoint = freelancerId 
      ? `/api/v1/freelancers/${freelancerId}/portfolio`
      : '/api/v1/freelancer/portfolio';
    const response = await apiClient.get(endpoint);
    return response.data as ApiResponse<PortfolioItem[]>;
  },

  // Add portfolio item
  addPortfolioItem: async (portfolioData: {
    title: string;
    description: string;
    technologies: string[];
    images?: File[];
    projectUrl?: string;
    githubUrl?: string;
    category?: string;
  }): Promise<ApiResponse<PortfolioItem>> => {
    const formData = new FormData();
    formData.append('title', portfolioData.title);
    formData.append('description', portfolioData.description);
    formData.append('technologies', JSON.stringify(portfolioData.technologies));
    
    if (portfolioData.projectUrl) {
      formData.append('projectUrl', portfolioData.projectUrl);
    }
    if (portfolioData.githubUrl) {
      formData.append('githubUrl', portfolioData.githubUrl);
    }
    if (portfolioData.category) {
      formData.append('category', portfolioData.category);
    }
    
    if (portfolioData.images) {
      portfolioData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post('/api/v1/freelancer/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ApiResponse<PortfolioItem>;
  },

  // Update portfolio item
  updatePortfolioItem: async (itemId: string, updateData: Partial<{
    title: string;
    description: string;
    technologies: string[];
    projectUrl: string;
    githubUrl: string;
    category: string;
    featured: boolean;
  }>): Promise<ApiResponse<PortfolioItem>> => {
    const response = await apiClient.put(`/api/v1/freelancer/portfolio/${itemId}`, updateData);
    return response.data as ApiResponse<PortfolioItem>;
  },

  // Delete portfolio item
  deletePortfolioItem: async (itemId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/portfolio/${itemId}`);
    return response.data as ApiResponse<any>;
  },

  // Reorder portfolio items
  reorderPortfolio: async (itemIds: string[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/freelancer/portfolio/reorder', { itemIds });
    return response.data as ApiResponse<any>;
  },

  // Get experience
  getExperience: async (): Promise<ApiResponse<ExperienceItem[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/experience');
    return response.data as ApiResponse<ExperienceItem[]>;
  },

  // Add experience
  addExperience: async (experienceData: Omit<ExperienceItem, 'id'>): Promise<ApiResponse<ExperienceItem>> => {
    const response = await apiClient.post('/api/v1/freelancer/experience', experienceData);
    return response.data as ApiResponse<ExperienceItem>;
  },

  // Update experience
  updateExperience: async (experienceId: string, updateData: Partial<Omit<ExperienceItem, 'id'>>): Promise<ApiResponse<ExperienceItem>> => {
    const response = await apiClient.put(`/api/v1/freelancer/experience/${experienceId}`, updateData);
    return response.data as ApiResponse<ExperienceItem>;
  },

  // Delete experience
  deleteExperience: async (experienceId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/experience/${experienceId}`);
    return response.data as ApiResponse<any>;
  },

  // Get education
  getEducation: async (): Promise<ApiResponse<EducationItem[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/education');
    return response.data as ApiResponse<EducationItem[]>;
  },

  // Add education
  addEducation: async (educationData: Omit<EducationItem, 'id'>): Promise<ApiResponse<EducationItem>> => {
    const response = await apiClient.post('/api/v1/freelancer/education', educationData);
    return response.data as ApiResponse<EducationItem>;
  },

  // Update education
  updateEducation: async (educationId: string, updateData: Partial<Omit<EducationItem, 'id'>>): Promise<ApiResponse<EducationItem>> => {
    const response = await apiClient.put(`/api/v1/freelancer/education/${educationId}`, updateData);
    return response.data as ApiResponse<EducationItem>;
  },

  // Delete education
  deleteEducation: async (educationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/education/${educationId}`);
    return response.data as ApiResponse<any>;
  },

  // Get certifications
  getCertifications: async (): Promise<ApiResponse<Certification[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/certifications');
    return response.data as ApiResponse<Certification[]>;
  },

  // Add certification
  addCertification: async (certificationData: Omit<Certification, 'id' | 'verified'>): Promise<ApiResponse<Certification>> => {
    const response = await apiClient.post('/api/v1/freelancer/certifications', certificationData);
    return response.data as ApiResponse<Certification>;
  },

  // Update certification
  updateCertification: async (certificationId: string, updateData: Partial<Omit<Certification, 'id' | 'verified'>>): Promise<ApiResponse<Certification>> => {
    const response = await apiClient.put(`/api/v1/freelancer/certifications/${certificationId}`, updateData);
    return response.data as ApiResponse<Certification>;
  },

  // Delete certification
  deleteCertification: async (certificationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/certifications/${certificationId}`);
    return response.data as ApiResponse<any>;
  },

  // Verify certification
  verifyCertification: async (certificationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/freelancer/certifications/${certificationId}/verify`);
    return response.data as ApiResponse<any>;
  },

  // Get languages
  getLanguages: async (): Promise<ApiResponse<Language[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/languages');
    return response.data as ApiResponse<Language[]>;
  },

  // Add language
  addLanguage: async (languageData: Omit<Language, 'id'>): Promise<ApiResponse<Language>> => {
    const response = await apiClient.post('/api/v1/freelancer/languages', languageData);
    return response.data as ApiResponse<Language>;
  },

  // Update language
  updateLanguage: async (languageId: string, updateData: Partial<Omit<Language, 'id'>>): Promise<ApiResponse<Language>> => {
    const response = await apiClient.put(`/api/v1/freelancer/languages/${languageId}`, updateData);
    return response.data as ApiResponse<Language>;
  },

  // Delete language
  deleteLanguage: async (languageId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/languages/${languageId}`);
    return response.data as ApiResponse<any>;
  },

  // Update availability
  updateAvailability: async (availability: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/freelancer/availability', { availability });
    return response.data as ApiResponse<any>;
  },

  // Get profile analytics
  getProfileAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/freelancer/analytics');
    return response.data as ApiResponse<any>;
  },

  // Get profile completion status
  getProfileCompletion: async (): Promise<ApiResponse<{ completion: number; suggestions: string[] }>> => {
    const response = await apiClient.get('/api/v1/freelancer/profile/completion');
    return response.data as ApiResponse<{ completion: number; suggestions: string[] }>;
  }
};

// Client-specific APIs
export const clientApi = {
  // Update client profile
  updateProfile: async (profileData: ClientProfileUpdateData): Promise<ApiResponse<{ profile: ClientProfile }>> => {
    const response = await apiClient.put('/api/v1/client/profile', profileData);
    return response.data as ApiResponse<{ profile: ClientProfile }>;
  },

  // Get client statistics
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/client/stats');
    return response.data as ApiResponse<any>;
  },

  // Get client dashboard
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/client/dashboard');
    return response.data as ApiResponse<any>;
  },

  // Save freelancer to favorites
  addToFavorites: async (freelancerId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/client/favorites/freelancers', { freelancerId });
    return response.data as ApiResponse<any>;
  },

  // Remove freelancer from favorites
  removeFromFavorites: async (freelancerId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/client/favorites/freelancers/${freelancerId}`);
    return response.data as ApiResponse<any>;
  },

  // Get favorite freelancers
  getFavoriteFreelancers: async (): Promise<ApiResponse<FreelancerProfile[]>> => {
    const response = await apiClient.get('/api/v1/client/favorites/freelancers');
    return response.data as ApiResponse<FreelancerProfile[]>;
  },

  // Get saved searches
  getSavedSearches: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/api/v1/client/saved-searches');
    return response.data as ApiResponse<any[]>;
  },

  // Save search
  saveSearch: async (searchData: {
    name: string;
    type: 'freelancers' | 'projects';
    filters: any;
    alertEnabled?: boolean;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/client/saved-searches', searchData);
    return response.data as ApiResponse<any>;
  },

  // Delete saved search
  deleteSavedSearch: async (searchId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/client/saved-searches/${searchId}`);
    return response.data as ApiResponse<any>;
  }
};

export { userApi as default };
