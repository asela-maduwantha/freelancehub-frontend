import { ProficiencyLevel } from "../enums/status.types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  languages?: {
    language: string;
    proficiency: ProficiencyLevel;
  }[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  requiredSkills: string[];
  type: 'fixed' | 'hourly';
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    deadline: string;
    duration: number;
    isUrgent: boolean;
    isFlexible: boolean;
  };
  requirements: {
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    minimumRating: number;
    minimumCompletedProjects: number;
    preferredLanguages: string[];
    preferredCountries: string[];
  };
  visibility: 'public' | 'private';
  tags: string[];
}

export interface CreateContractRequest {
  projectId: string;
  freelancerId: string;
  terms: {
    budget: number;
    type: 'fixed' | 'hourly';
    startDate: string;
    endDate: string;
    paymentSchedule: string;
  };
  milestones: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }[];
}

export interface AcceptProposalRequest {
  message?: string;
}

export interface CreatePaymentRequest {
  payeeId: string;
  projectId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  type?: string;
  description?: string;
  milestoneId?: string;
}

export interface CreateReviewRequest {
  revieweeId: string;
  projectId: string;
  rating: number;
  review: string;
  reviewType: string;
  criteria?: {
    category: string;
    rating: number;
  }[];
  visibility?: string;
}

export interface CreateDisputeRequest {
  contractId: string;
  reason: string;
  description: string;
  evidence?: {
    description: string;
    files?: string[];
  }[];
}

export interface UpdateFreelancerProfileRequest {
  profileData: import('../entities/freelancer.types').EditFreelancerProfileType;
}