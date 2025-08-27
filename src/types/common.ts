// Common types used across the application

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  statusCode?: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items?: T[];
    [key: string]: T[] | any;
  } & T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Location {
  country: string;
  city: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy?: string;
  category?: string;
  public?: boolean;
  virusScanned?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  popularity?: number;
  freelancerCount?: number;
  projectCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  featured?: boolean;
  projectCount?: number;
  count?: number;
}

export interface Timeline {
  duration: number;
  unit: 'days' | 'weeks' | 'months';
  startDate?: string;
  endDate?: string;
  deadline?: string;
}

export interface UserRole {
  FREELANCER: 'freelancer';
  CLIENT: 'client';
  ADMIN: 'admin';
}

export type UserRoleType = 'freelancer' | 'client' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';

export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'pending_review';

export type ProposalStatus = 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export type AvailabilityStatus = 'available' | 'busy' | 'not_available' | 'full_time' | 'part_time';

export type BudgetType = 'fixed' | 'hourly';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type NotificationType = 
  | 'proposal_received' 
  | 'proposal_accepted' 
  | 'proposal_rejected'
  | 'milestone_submitted'
  | 'milestone_approved'
  | 'message_received'
  | 'payment_received'
  | 'project_completed'
  | 'review_received';

export type Priority = 'low' | 'medium' | 'high';

export type MessageType = 'text' | 'file' | 'image' | 'voice';
