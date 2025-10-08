// Profile-related types
export interface Location {
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  location?: Location;
  website?: string;
  socialLinks?: SocialLinks;
}

export interface ProfilePortfolioItem {
  id: string;
  title: string;
  description: string;
  images?: string[];
  url?: string;
  technologies?: string[];
}

export interface EducationRecord {
  id: string;
  degree: string;
  institution: string;
  year: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface FreelancerProfileData {
  skills: string[];
  availability?: 'full-time' | 'part-time' | 'contract';
  experience?: 'beginner' | 'intermediate' | 'expert';
  languages?: string[];
  education: EducationRecord[];
  certifications: Certification[];
  portfolio: ProfilePortfolioItem[];
  title?: string;
  overview?: string;
  totalEarned: number;
  completedJobs: number;
  rating: number;
  reviewCount: number;
}

export interface CompleteUserProfile {
  id: string;
  email: string;
  role: 'FREELANCER' | 'CLIENT' | 'ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  profile: UserProfileData;
  freelancerData?: FreelancerProfileData;
  createdAt: string;
  lastLoginAt?: string;
  fullName: string;
}

// Request DTOs
export interface UpdateGeneralProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  location?: Location;
  website?: string;
  socialLinks?: SocialLinks;
}

export interface UpdateFreelancerProfileRequest {
  availability?: 'full-time' | 'part-time' | 'contract';
  experience?: 'beginner' | 'intermediate' | 'expert';
  languages?: string[];
  title?: string;
  overview?: string;
  avatar?: string;
}

export interface AddSkillsRequest {
  skills: string[];
}

export interface AddPortfolioItemRequest {
  title: string;
  description: string;
  images?: string[];
  url?: string;
  technologies?: string[];
}

export interface UpdatePortfolioItemRequest {
  title?: string;
  description?: string;
  images?: string[];
  url?: string;
  technologies?: string[];
}

export interface AddEducationRequest {
  degree: string;
  institution: string;
  year: number;
}

export interface UpdateEducationRequest {
  degree?: string;
  institution?: string;
  year?: number;
}

export interface AddCertificationRequest {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface UpdateCertificationRequest {
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  profileVisibility: 'public' | 'private' | 'freelancers_only';
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface UpdateUserSettingsRequest {
  emailNotifications?: boolean;
  profileVisibility?: 'public' | 'private' | 'freelancers_only';
  language?: string;
  timezone?: string;
  twoFactorEnabled?: boolean;
}

// Client-specific types
export interface ClientProfileData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  totalSpent: number;
  postedJobs: number;
  rating: number;
  reviewCount: number;
}

export interface UpdateClientProfileRequest {
  companyName?: string;
  companySize?: string;
  industry?: string;
}

// API Response types
export interface ApiSuccessResponse {
  message: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
  message: string;
}
