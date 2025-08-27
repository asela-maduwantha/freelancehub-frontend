// Utility services for common data
import apiClient from '../axios-instance';
import { ApiResponse, Country, City, Skill } from '../../types';

export const utilityApi = {
  // Get countries list
  getCountries: async (): Promise<ApiResponse<Country[]>> => {
    const response = await apiClient.get('/api/v1/public/countries');
    return response.data as ApiResponse<Country[]>;
  },

  // Get cities for a country
  getCities: async (countryCode: string): Promise<ApiResponse<City[]>> => {
    const response = await apiClient.get(`/api/v1/public/cities?country=${countryCode}`);
    return response.data as ApiResponse<City[]>;
  },

  // Search cities with autocomplete
  searchCities: async (query: string, country?: string): Promise<ApiResponse<City[]>> => {
    const params = new URLSearchParams({ q: query });
    if (country) params.append('country', country);
    
    const response = await apiClient.get(`/api/v1/public/cities/search?${params}`);
    return response.data as ApiResponse<City[]>;
  },

  // Get popular skills
  getPopularSkills: async (): Promise<ApiResponse<Skill[]>> => {
    const response = await apiClient.get('/api/v1/public/skills/popular');
    return response.data as ApiResponse<Skill[]>;
  },

  // Search skills
  searchSkills: async (query: string): Promise<ApiResponse<Skill[]>> => {
    const response = await apiClient.get(`/api/v1/public/skills/search?q=${encodeURIComponent(query)}`);
    return response.data as ApiResponse<Skill[]>;
  },

  // Get skill categories
  getSkillCategories: async (): Promise<ApiResponse<{ id: string; name: string; skills: Skill[] }[]>> => {
    const response = await apiClient.get('/api/v1/public/skills/categories');
    return response.data as ApiResponse<{ id: string; name: string; skills: Skill[] }[]>;
  },

  // Upload file
  uploadFile: async (file: File, category: string = 'general'): Promise<ApiResponse<{ 
    id: string; 
    url: string; 
    filename: string; 
    size: number; 
    mimeType: string; 
  }>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    const response = await apiClient.post('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ApiResponse<{ 
      id: string; 
      url: string; 
      filename: string; 
      size: number; 
      mimeType: string; 
    }>;
  },

  // Validate password strength
  validatePassword: async (password: string): Promise<ApiResponse<{
    score: number;
    feedback: string[];
    isValid: boolean;
  }>> => {
    const response = await apiClient.post('/api/v1/auth/validate-password', { password });
    return response.data as ApiResponse<{
      score: number;
      feedback: string[];
      isValid: boolean;
    }>;
  }
};

export default utilityApi;
