import type { Pagination } from './pagination';
export interface Budget {
  amount: number;
  currency: string;
  type: 'fixed' | 'hourly';
}

export interface Timeline {
  deadline: string;
  duration: number;
  isUrgent: boolean;
  isFlexible: boolean;
}

export interface Requirements {
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  minimumRating: number;
  minimumCompletedProjects: number;
  preferredLanguages: string[];
  preferredCountries: string[];
}

export interface Project {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  requiredSkills: string[];
  type: 'fixed' | 'hourly';
  budget: Budget;
  timeline: Timeline;
  requirements: Requirements;
  visibility: 'public' | 'private';
  tags: string[];
}

// API Response Types
export interface Skill {
  skill: string;
  level: string;
  _id: string;
}

export interface ClientProfile {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
}

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  clientProfile: ClientProfile;
}

export interface Analytics {
  views: number;
  applications: number;
  saves: number;
}

export interface ProjectResponse {
  _id: string;
  clientId: Client;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  requiredSkills: Skill[];
  budgetType: 'fixed' | 'hourly';
  budget: number;
  currency: string;
  duration: string;
  deadline: string;
  workType: string[];
  experienceLevel: string;
  visibility: 'public' | 'private';
  status: string;
  tags: string[];
  analytics: Analytics;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  skills: string[];
  portfolio: string[];
  hourlyRate?: number;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  availability: 'full-time' | 'part-time' | 'contract';
  languages: string[];
  education?: string;
  certifications?: string[];
}

export interface Freelancer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  freelancerProfile: FreelancerProfile;
  rating: number;
  completedProjects: number;
  totalEarnings: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}