import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Types for freelancer API
export interface UpdateFreelancerProfileRequest {
  avatar?: string;
  availability: 'full-time' | 'part-time';
  experience: 'beginner' | 'intermediate' | 'expert';
  languages: string[];
  title: string;
  overview: string;
}

export interface AddSkillsRequest {
  skills: string[];
}

export interface AddPortfolioRequest {
  title: string;
  description: string;
  images: string[];
  url?: string;
  technologies: string[];
}

export interface CreateStripeAccountRequest {
  country: string;
  type: 'express' | 'standard';
}

export interface GetStripeAccountLinkRequest {
  refreshUrl: string;
  returnUrl: string;
  type: 'account_onboarding' | 'account_update';
}

export interface StripeAccountLinkResponse {
  url: string;
  expiresAt: number;
}

export interface StripeAccountResponse {
  id: string;
  email: string;
  country: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  type: string;
  created: number;
}

export const freelancerApi = {
  /**
   * Update freelancer profile information
   */
  updateProfile: async (data: UpdateFreelancerProfileRequest) => {
    return apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  },

  /**
   * Add skills to freelancer profile
   */
  addSkills: async (data: AddSkillsRequest) => {
    return apiClient.post(API_ENDPOINTS.USERS.ADD_SKILLS, data);
  },

  /**
   * Add portfolio item to freelancer profile
   */
  addPortfolio: async (data: AddPortfolioRequest) => {
    return apiClient.post(API_ENDPOINTS.USERS.ADD_PORTFOLIO, data);
  },

  /**
   * Create a Stripe Connect account for the freelancer
   */
  createStripeAccount: async (data: CreateStripeAccountRequest) => {
    return apiClient.post(API_ENDPOINTS.STRIPE_ACCOUNT.CREATE, data);
  },

  /**
   * Get Stripe account onboarding link
   */
  getStripeAccountLink: async (data: GetStripeAccountLinkRequest) => {
    return apiClient.post(API_ENDPOINTS.STRIPE_ACCOUNT.ONBOARD, data);
  },

  /**
   * Get Stripe account status
   */
  getStripeAccountStatus: async () => {
    return apiClient.get(API_ENDPOINTS.STRIPE_ACCOUNT.STATUS);
  },
};
