import { UserRoleType, UserStatus, Location, Money, FileUpload, Skill, AvailabilityStatus } from './common';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  primaryRole: UserRoleType;
  profilePhoto?: string;
  phone?: string;
  location?: Location;
  bio?: string;
  verified: boolean;
  status: UserStatus;
  memberSince: string;
  lastActive?: string;
  profileComplete?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FreelancerProfile extends User {
  primaryRole: 'freelancer';
  title?: string;
  skills: string[] | Skill[];
  hourlyRate?: Money;
  availability: AvailabilityStatus;
  rating: number;
  reviewsCount: number;
  completedProjects: number;
  totalEarnings?: number;
  portfolio?: PortfolioItem[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  certifications?: Certification[];
  languages?: Language[];
  matchScore?: number;
}

export interface ClientProfile extends User {
  primaryRole: 'client';
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  totalSpent?: number;
  totalProjects?: number;
  avgRating?: number;
  verificationLevel?: 'basic' | 'verified' | 'premium';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images: FileUpload[];
  projectUrl?: string;
  githubUrl?: string;
  createdAt: string;
  featured: boolean;
  category?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

// Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  primaryRole: UserRoleType;
  password: string;
  phone?: string;
  location?: Location;
  termsAccepted: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface WebAuthnChallenge {
  challenge: string;
  allowCredentials?: Array<{
    id: string;
    type: string;
  }>;
  timeout: number;
}

export interface WebAuthnResponse {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
  type: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface EmailVerificationData {
  email: string;
  token?: string;
  otp?: string;
}

export interface NotificationPreferences {
  email: {
    projectUpdates: boolean;
    messages: boolean;
    payments: boolean;
    proposals: boolean;
    milestones: boolean;
  };
  push: {
    projectUpdates: boolean;
    messages: boolean;
    payments: boolean;
    proposals: boolean;
    milestones: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'limited';
  showLocation: boolean;
  showContactInfo: boolean;
  showLastSeen: boolean;
  allowDirectMessages: boolean;
  showEarnings: boolean;
  showCompletedProjects: boolean;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: Location;
  bio?: string;
  profilePhoto?: string;
}

export interface FreelancerProfileUpdateData extends ProfileUpdateData {
  title?: string;
  skills?: string[];
  hourlyRate?: Money;
  availability?: AvailabilityStatus;
}

export interface ClientProfileUpdateData extends ProfileUpdateData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
}
