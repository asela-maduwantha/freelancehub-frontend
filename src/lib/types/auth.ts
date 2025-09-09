// Authentication and User related types
import type { Role } from './common';
import type { Pagination } from './pagination';

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  emailVerified: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshedTokens{
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export interface OtpVerificationResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Freelancer Profile related types

export interface Availability {
  status: string;
  hoursPerWeek: number;
  workingHours: {
    timezone: string;
    schedule: {
      monday: string | null;
      tuesday: string | null;
      wednesday: string | null;
      thursday: string | null;
      friday: string | null;
      saturday: string | null;
      sunday: string | null;
    };
  };
}

export interface Location {
  country: string;
  city: string;
  province: string;
}

export interface PortfolioItem {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
  url: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface FreelancerProfileCreationDto {
  professionalTitle: string;
  description: string;
  skills: string[];
  categories: string[];
  experienceLevel: string;
  hourlyRate: number;
  availability: Availability;
  location: Location;
  publicProfileUrl: string;
  portfolio: PortfolioItem[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
}

// Freelancer Profile for GET response (with populated userId)
export interface FreelancerUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  _id: string;
  userId: FreelancerUser;
  professionalTitle: string;
  description: string;
  skills: string[];
  categories: string[];
  experienceLevel: string;
  hourlyRate: number;
  availability: Availability;
  location: Location;
  portfolio: PortfolioItem[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  profileCompleteness: number;
  publicProfileUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination interface
// Response for GET freelancers endpoint
export interface PaginatedFreelancersResponse {
  data: FreelancerProfile[];
  pagination: Pagination;
}

// Query parameters for GET freelancers endpoint
export interface GetFreelancersQuery {
  skills?: string;
  experience?: string;
  minRate?: number;
  maxRate?: number;
  availability?: string;
  page?: number;
  limit?: number;
}
