// Export all types
export * from './store';
export * from './api';

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'freelancer' | 'client' | 'admin';
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  bio?: string;
  skills: string[];
  experience: number;
  hourlyRate?: number;
  location?: string;
  portfolio?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  rating: number;
  totalReviews: number;
  completedProjects: number;
}

// Job types
export interface Job {
  id: string;
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
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  clientId: string;
  client: User;
  applications: Application[];
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

export interface Application {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancer: User;
  coverLetter: string;
  proposedRate: number;
  estimatedHours?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

// Contract types
export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  status: 'active' | 'completed' | 'terminated';
  terms: {
    paymentTerms: string;
    deliverables: string[];
    timeline: string;
    revisions: number;
  };
  milestones: Milestone[];
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedAt?: string;
}

// Payment types
export interface Payment {
  id: string;
  contractId: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  attachments?: MessageAttachment[];
  read: boolean;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  contractId: string;
  rating: number;
  comment: string;
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'application' | 'message' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'freelancer' | 'client';
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  category: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: 'fixed' | 'hourly';
  duration: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  location: string;
  remote: boolean;
  deadline?: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio?: string;
  skills: string[];
  experience: number;
  hourlyRate?: number;
  location?: string;
  portfolio?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

// Filter and search types
export interface JobFilters {
  category?: string;
  skills?: string[];
  experienceLevel?: string;
  location?: string;
  remote?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  postedWithin?: 'day' | 'week' | 'month';
}

export interface FreelancerFilters {
  skills?: string[];
  experienceMin?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  location?: string;
  ratingMin?: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface FormErrors {
  [key: string]: string;
}