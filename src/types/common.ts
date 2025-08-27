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

// Onboarding specific types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export interface City {
  name: string;
  country: string;
  region?: string;
}

// Auth specific types
export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  location: Location;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  role: 'freelancer' | 'client';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse<TUser = AuthUser> {
  success: boolean;
  user: TUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

// Base authenticated user interface
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRoleType;
  profilePhoto?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Specific auth response types for each role
export type FreelancerAuthResponse = AuthResponse<AuthUser & { role: 'freelancer' }>;
export type ClientAuthResponse = AuthResponse<AuthUser & { role: 'client' }>;
export type AdminAuthResponse = AuthResponse<AuthUser & { role: 'admin' }>;

export interface EmailVerificationData {
  token?: string;
  otp?: string;
  email?: string;
}

export interface WebAuthnChallenge {
  challenge: string;
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  rp: {
    name: string;
    id: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: string;
    userVerification?: string;
  };
  timeout?: number;
}

export interface WebAuthnResponse {
  id: string;
  rawId: string;
  response: {
    attestationObject?: string;
    clientDataJSON: string;
    signature?: string;
    authenticatorData?: string;
  };
  type: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
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
