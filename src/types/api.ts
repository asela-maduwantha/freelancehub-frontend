import { User, Job, Application, Contract, Payment, Message, Review, Notification } from './index';

// API Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'freelancer' | 'client';
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  category: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  duration: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  location: string;
  remote: boolean;
  deadline?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  location?: string;
  portfolio?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface CreateApplicationRequest {
  jobId: string;
  coverLetter: string;
  proposedRate: number;
  estimatedHours?: number;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: File[];
}

export interface CreateReviewRequest {
  contractId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
}

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContractsResponse {
  contracts: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search parameters
export interface SearchParams extends PaginationParams {
  query?: string;
  category?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  experienceLevel?: string;
  budgetMin?: number;
  budgetMax?: number;
  postedWithin?: 'day' | 'week' | 'month';
}

// Filter parameters for different entities
export interface JobFilters extends SearchParams {
  status?: 'open' | 'in-progress' | 'completed' | 'cancelled';
  clientId?: string;
}

export interface FreelancerFilters extends SearchParams {
  ratingMin?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  available?: boolean;
}

export interface ContractFilters extends PaginationParams {
  status?: 'active' | 'completed' | 'terminated';
  clientId?: string;
  freelancerId?: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message' | 'notification' | 'status_update';
  payload: any;
  timestamp: string;
}

// File upload types
export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Error response types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}