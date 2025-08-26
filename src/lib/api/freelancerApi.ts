import apiClient from "../../api/axios-instance";

export interface FreelancerFilters {
  page?: number;
  limit?: number;
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  experience?: string;
  location?: string;
}

export interface FreelancerListResponse {
  freelancers: FreelancerProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
  bio?: string;
  title?: string;
  hourlyRate?: number;
  experience?: string;
  rating?: number;
  completedProjects?: number;
  isAvailable?: boolean;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
    credentialUrl?: string;
  }>;
  portfolioLinks: Array<{
    title: string;
    description: string;
    url: string;
    type: "website" | "github" | "design" | "document" | "other";
  }>;
  githubUrl?: string;
  portfolioWebsite?: string;
  linkedinUrl?: string;
  isProfileComplete: boolean;
  profileCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFreelancerProfileData {
  profilePicture?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  title?: string;
  hourlyRate?: number;
  experience?: string;
  skills: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
    credentialUrl?: string;
  }>;
  portfolioLinks?: Array<{
    title: string;
    description: string;
    url: string;
    type: "website" | "github" | "design" | "document" | "other";
  }>;
  githubUrl?: string;
  portfolioWebsite?: string;
  linkedinUrl?: string;
}

export const freelancerApi = {
  // Create freelancer profile
  async createProfile(data: CreateFreelancerProfileData): Promise<FreelancerProfile> {
    try {
      const response = await apiClient.post('/freelancers/profile', data);
      return response.data as FreelancerProfile;
    } catch (error) {
      console.error('Error creating freelancer profile:', error);
      throw error;
    }
  },

  // Get freelancer profile by user ID
  async getProfile(userId?: string): Promise<FreelancerProfile | null> {
    try {
      const url = userId ? `/freelancers/profile/${userId}` : '/freelancers/profile/me';
      const response = await apiClient.get(url);
      return response.data as FreelancerProfile;
    } catch (error) {
      console.error('Error fetching freelancer profile:', error);
      return null;
    }
  },

  // Update freelancer profile
  async updateProfile(data: Partial<CreateFreelancerProfileData>): Promise<FreelancerProfile> {
    try {
      const response = await apiClient.patch('/freelancers/profile/me', data);
      return response.data as FreelancerProfile;
    } catch (error) {
      console.error('Error updating freelancer profile:', error);
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.post('/freelancers/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as { url: string };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Calculate profile completeness
  calculateProfileCompleteness(profile: Partial<CreateFreelancerProfileData>): number {
    const requiredFields = [
      'firstName',
      'lastName',
      'bio',
      'title',
      'hourlyRate',
      'experience',
      'skills'
    ];

    const optionalFields = [
      'profilePicture',
      'phoneNumber',
      'location',
      'education',
      'certifications',
      'portfolioLinks',
      'githubUrl',
      'portfolioWebsite',
      'linkedinUrl'
    ];

    let score = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    // Required fields (70% weight)
    const requiredFieldsScore = requiredFields.reduce((acc, field) => {
      const value = profile[field as keyof CreateFreelancerProfileData];
      if (Array.isArray(value)) {
        return acc + (value.length > 0 ? 1 : 0);
      }
      return acc + (value ? 1 : 0);
    }, 0);

    score += (requiredFieldsScore / requiredFields.length) * 70;

    // Optional fields (30% weight)
    const optionalFieldsScore = optionalFields.reduce((acc, field) => {
      const value = profile[field as keyof CreateFreelancerProfileData];
      if (Array.isArray(value)) {
        return acc + (value.length > 0 ? 1 : 0);
      }
      return acc + (value ? 1 : 0);
    }, 0);

    score += (optionalFieldsScore / optionalFields.length) * 30;

    return Math.round(score);
  },

  // Get all freelancers (for client browsing)
  async getAllFreelancers(params?: {
    page?: number;
    limit?: number;
    skills?: string[];
    minRate?: number;
    maxRate?: number;
    experience?: string;
    location?: string;
  }): Promise<{
    freelancers: FreelancerProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.skills?.length) queryParams.append('skills', params.skills.join(','));
      if (params?.minRate) queryParams.append('minRate', params.minRate.toString());
      if (params?.maxRate) queryParams.append('maxRate', params.maxRate.toString());
      if (params?.experience) queryParams.append('experience', params.experience);
      if (params?.location) queryParams.append('location', params.location);

      const response = await apiClient.get(`/freelancers?${queryParams.toString()}`);
      return response.data as {
        freelancers: FreelancerProfile[];
        total: number;
        page: number;
        limit: number;
      };
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      return {
        freelancers: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  },

  // Search freelancers
  async searchFreelancers(query: string): Promise<FreelancerProfile[]> {
    try {
      const response = await apiClient.get(`/freelancers/search?q=${encodeURIComponent(query)}`);
      return response.data as FreelancerProfile[];
    } catch (error) {
      console.error('Error searching freelancers:', error);
      return [];
    }
  }
};
