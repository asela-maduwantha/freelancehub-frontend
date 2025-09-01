// API Types and Interfaces

// Auth-related interfaces
export interface RegisterData {
  email: string;
  password: string;
  role: 'freelancer' | 'client';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string[];
    activeRole?: string;
  };
}

export interface VerifyEmailData {
  token: string;
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface SendEmailOTPData {
  email: string;
  type: 'verification' | 'reset';
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// Profile-related interfaces
export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

export interface FreelancerProfileData {
  title?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  portfolio?: Array<{
    title: string;
    description: string;
    images?: string[];
    url?: string;
    tags?: string[];
  }>;
  hourlyRate?: number;
  availability?: 'AVAILABLE' | 'PART_TIME' | 'BUSY' | 'UNAVAILABLE';
  workingHours?: {
    timezone: string;
    hours: Array<{
      day: string;
      start: string;
      end: string;
    }>;
  };
}

export interface ClientProfileData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  description?: string;
  verified?: boolean;
}

// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic API response type
export interface APIResponse<T = any> {
  message: string;
  data?: T;
  success: boolean;
}

// Paginated response type
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
