// Integration validator to ensure frontend types match backend responses
import { 
  PlatformStats, 
  PopularCategory, 
  FeaturedTestimonial,
  Project,
  FreelancerProfile,
  ClientProfile,
  ApiResponse 
} from '@/types';

export interface BackendPlatformStats {
  totalProjects: number;
  totalFreelancers: number;
  totalClients: number;
  completedProjects: number;
  activeProjects: number;
  totalEarnings: number;
  averageRating: number;
  countriesRepresented: number;
}

export interface BackendCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
  averageBudget: number;
  popular: boolean;
}

export interface BackendTestimonial {
  id: string;
  userName: string;
  userRole: 'client' | 'freelancer';
  userAvatar?: string;
  rating: number;
  comment: string;
  projectTitle?: string;
  projectCategory?: string;
  createdAt: string;
}

// Validation functions
export function validatePlatformStats(backendData: BackendPlatformStats): PlatformStats {
  return {
    totalProjects: backendData.totalProjects || 0,
    totalFreelancers: backendData.totalFreelancers || 0,
    totalClients: backendData.totalClients || 0,
    totalEarnings: backendData.totalEarnings || 0,
    projectsCompleted: backendData.completedProjects || 0, // Backend uses completedProjects
    averageRating: backendData.averageRating || 4.8,
  };
}

export function validateCategory(backendData: BackendCategory): PopularCategory {
  return {
    id: backendData.id,
    name: backendData.name,
    description: backendData.description,
    icon: backendData.icon,
    projectCount: backendData.projectCount,
    averageBudget: {
      amount: backendData.averageBudget,
      currency: 'USD'
    },
    featured: backendData.popular,
  };
}

export function validateTestimonial(backendData: BackendTestimonial): FeaturedTestimonial {
  return {
    id: backendData.id,
    clientName: backendData.userRole === 'client' ? backendData.userName : undefined,
    freelancerName: backendData.userRole === 'freelancer' ? backendData.userName : undefined,
    rating: backendData.rating,
    comment: backendData.comment,
    projectType: backendData.projectCategory || backendData.projectTitle || 'Various',
    featured: true,
    avatar: backendData.userAvatar,
  };
}

// Type guards
export function isBackendPlatformStats(data: any): data is BackendPlatformStats {
  return (
    typeof data === 'object' &&
    typeof data.totalProjects === 'number' &&
    typeof data.totalFreelancers === 'number' &&
    typeof data.totalClients === 'number' &&
    typeof data.completedProjects === 'number'
  );
}

export function isBackendCategory(data: any): data is BackendCategory {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.projectCount === 'number'
  );
}

export function isBackendTestimonial(data: any): data is BackendTestimonial {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.userName === 'string' &&
    typeof data.rating === 'number' &&
    typeof data.comment === 'string'
  );
}

// API response validation
export function validateApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean'
  );
}

// Error handling utilities
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in.';
  }
  if (error.response?.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  if (error.response?.status === 409) {
    return 'Conflict. The resource already exists.';
  }
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return 'An unexpected error occurred. Please try again.';
}

// Data transformation utilities
export function transformBackendResponse<T, U>(
  response: any, 
  validator: (data: T) => U,
  typeGuard: (data: any) => data is T
): U | null {
  if (!validateApiResponse(response)) {
    console.error('Invalid API response format:', response);
    return null;
  }

  if (!response.success) {
    console.error('API request failed:', response.error);
    return null;
  }

  if (!response.data) {
    console.error('No data in API response');
    return null;
  }

  if (!typeGuard(response.data)) {
    console.error('Invalid data format:', response.data);
    return null;
  }

  try {
    return validator(response.data);
  } catch (error) {
    console.error('Data transformation failed:', error);
    return null;
  }
}

