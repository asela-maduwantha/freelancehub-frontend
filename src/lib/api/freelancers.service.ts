import { apiClient } from './client';
import {
  IApiResponse,
  PaginatedApiResponse
} from '../types';

// Freelancer Profile Types
export interface IFreelancerProfile {
  title: string;
  bio: string;
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'expert';
  hourlyRate: number;
  availability: 'full-time' | 'part-time' | 'not-available';
  portfolio?: string[];
  languages?: {
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }[];
  isComplete?: boolean;
  completionPercentage?: number;
}

export interface IFreelancerProfileUpdate {
  title?: string;
  bio?: string;
  skills?: string[];
  experience?: 'beginner' | 'intermediate' | 'expert';
  hourlyRate?: number;
  availability?: 'full-time' | 'part-time' | 'not-available' | 'available';
  portfolio?: {
    title: string;
    description: string;
    images?: string[];
    url?: string;
    tags?: string[];
  }[];
  languages?: {
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }[];
}

export interface IFreelancerProfileComplete extends IFreelancerProfileUpdate {
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    year: number;
  }[];
}

export interface IFreelancerAvailability {
  status: 'available' | 'busy' | 'not-available';
  message?: string;
  preferredProjectTypes?: string[];
  maxProjects?: number;
}

// Project Types
export interface IFreelancerProject {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
  contract?: {
    id: string;
    status: string;
    startDate: string;
  };
  currentMilestone?: {
    id: string;
    title: string;
    dueDate: string;
  };
  assignedAt: string;
}

export interface IFreelancerActiveProject {
  id: string;
  title: string;
  client: {
    firstName: string;
    lastName: string;
  };
  contract: {
    totalValue: number;
    paidAmount: number;
    remainingAmount: number;
  };
  currentMilestone: {
    title: string;
    dueDate: string;
    amount: number;
  };
  progress: number;
  daysRemaining: number;
  status: string;
}

export interface IFreelancerCompletedProject {
  id: string;
  title: string;
  client: {
    firstName: string;
    lastName: string;
  };
  completedAt: string;
  finalAmount: number;
  rating?: number;
  review?: string;
  testimonial?: string;
}

// Proposal Types
export interface IFreelancerProposal {
  id: string;
  projectId: string | { id: string }; // Can be string or object with id
  project?: {
    id: string;
    title: string;
    budget: number;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      companyName?: string;
    };
  };
  proposedBudget: number;
  proposedDuration: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  attachments?: string[];
}

export interface ICreateProposalRequest {
  coverLetter: string;
  pricing: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
    estimatedHours?: number;
    breakdown: string;
  };
  timeline: {
    deliveryTime: number;
    startDate: string;
    milestones: {
      title: string;
      description: string;
      deliveryDate: string;
      amount: number;
    }[];
  };
  portfolioLinks: string[];
  additionalInfo: string;
}

// Dashboard Types
export interface IFreelancerDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarned: number;
  activeContracts: number;
  pendingProposals: number;
  recentProjects: {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    budget: {
      amount: number;
    };
  }[];
}

// Earnings Types
export interface IFreelancerEarnings {
  period: string;
  totalEarnings: number;
  availableBalance: number;
  pendingPayments: number;
  withheldAmount: number;
  breakdown: {
    completedProjects: number;
    bonuses: number;
    referrals: number;
  };
  monthlyTrend: {
    month: string;
    earnings: number;
  }[];
}

// Analytics Types
export interface IFreelancerAnalytics {
  profileViews: number;
  proposalViews: number;
  proposalAcceptanceRate: number;
  averageResponseTime: string;
  clientSatisfaction: number;
  skillsDemand: {
    skill: string;
    demand: 'low' | 'medium' | 'high';
    avgRate: number;
  }[];
  marketPosition: {
    rank: number;
    percentile: number;
    comparedTo: string;
  };
}

// Message Types
export interface IFreelancerMessage {
  id: string;
  projectId: string;
  projectTitle: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  attachments?: {
    name: string;
    url: string;
  }[];
}

export interface ISendMessageRequest {
  projectId: string;
  subject: string;
  message: string;
  attachments?: string[];
}

// Skills & Portfolio Types
export interface ISkillEndorsement {
  skill: string;
  endorsements: {
    client: {
      firstName: string;
      lastName: string;
    };
    project: string;
    comment: string;
    endorsedAt: string;
  }[];
  endorsementCount: number;
}

export interface IPortfolioItem {
  title: string;
  description: string;
  projectUrl?: string;
  sourceUrl?: string;
  technologies: string[];
  images?: string[];
  category: string;
  completionDate: string;
}

export interface IFreelancerPublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  freelancerProfile: IFreelancerProfile;
  stats: {
    avgRating: number;
    projectsCompleted: number;
    totalEarnings: number;
    responseTime: string;
  };
  location?: {
    country: string;
    city: string;
  };
}

export interface IFreelancerFilters {
  skills?: string[];
  experience?: ('beginner' | 'intermediate' | 'expert')[];
  minRate?: number;
  maxRate?: number;
  availability?: string[];
  location?: string;
  rating?: number;
  page?: number;
  limit?: number;
  excludeCurrentUser?: boolean;
}

export class FreelancersService {
  /**
   * Update freelancer profile
   */
  async updateProfile(data: IFreelancerProfileUpdate): Promise<IApiResponse<{ profile: IFreelancerProfile }>> {
    return apiClient.put('/users/freelancer-profile', data);
  }

  /**
   * Complete freelancer profile setup
   */
  async completeProfile(data: IFreelancerProfileComplete): Promise<IApiResponse<{ profile: IFreelancerProfile }>> {
    return apiClient.put('/freelancers/profile/complete', data);
  }

  /**
   * Update freelancer availability status
   */
  async updateAvailability(data: IFreelancerAvailability): Promise<IApiResponse<{ availability: IFreelancerAvailability }>> {
    return apiClient.put('/freelancers/availability', data);
  }

  /**
   * Get projects assigned to current freelancer
   */
  async getAssignedProjects(params?: { page?: number; limit?: number; status?: string }): Promise<IFreelancerProject[]> {
    return apiClient.get('/projects/assigned', { params });
  }

  /**
   * Get active projects for freelancer
   */
  async getActiveProjects(): Promise<IFreelancerActiveProject[]> {
    return apiClient.get('/freelancers/projects/active');
  }

  /**
   * Get completed projects for freelancer
   */
  async getCompletedProjects(params?: { page?: number; limit?: number; year?: number }): Promise<PaginatedApiResponse<IFreelancerCompletedProject>> {
    return apiClient.get('/freelancers/projects/completed', { params });
  }

  /**
   * Get current user's proposals (freelancer view)
   */
  async getMyProposals(params?: { page?: number; limit?: number; status?: string }): Promise<IFreelancerProposal[]> {
    const response = await apiClient.get('/proposals/my', { params });
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    } else if (response && typeof response === 'object' && 'proposals' in response && Array.isArray(response.proposals)) {
      return response.proposals;
    }
    
    // If response is not an array, return empty array
    console.warn('Unexpected response structure for getMyProposals:', response);
    return [];
  }

  /**
   * Get current user's proposals (alternative endpoint)
   */
  async getMyProjectProposals(params?: { page?: number; limit?: number; status?: string }): Promise<IFreelancerProposal[]> {
    const response = await apiClient.get('/projects/my-proposals', { params });
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    } else if (response && typeof response === 'object' && 'proposals' in response && Array.isArray(response.proposals)) {
      return response.proposals;
    }
    
    // If response is not an array, return empty array
    console.warn('Unexpected response structure for getMyProjectProposals:', response);
    return [];
  }

  /**
   * Submit proposal for a project
   */
  async submitProposal(projectId: string, data: ICreateProposalRequest): Promise<IApiResponse> {
    console.log(data)
    return apiClient.post(`/projects/${projectId}/proposals`, data);
  }

  /**
   * Get freelancer dashboard with key metrics
   */
  async getDashboard(): Promise<IFreelancerDashboard> {
    return apiClient.get('/freelancers/dashboard');
  }

  /**
   * Get freelancer earnings summary
   */
  async getEarnings(params?: { period?: 'week' | 'month' | 'year' | 'all' }): Promise<IFreelancerEarnings> {
    return apiClient.get('/freelancers/earnings', { params });
  }

  /**
   * Get freelancer performance analytics
   */
  async getAnalytics(): Promise<IFreelancerAnalytics> {
    return apiClient.get('/freelancers/analytics');
  }

  /**
   * Get freelancer messages and communications
   */
  async getMessages(params?: { projectId?: string; unread?: boolean }): Promise<IFreelancerMessage[]> {
    return apiClient.get('/freelancers/messages', { params });
  }

  /**
   * Send message to client
   */
  async sendMessage(data: ISendMessageRequest): Promise<IApiResponse<{ messageId: string }>> {
    return apiClient.post('/freelancers/messages', data);
  }

  /**
   * Get skill endorsements from clients
   */
  async getSkillEndorsements(): Promise<{ skills: ISkillEndorsement[] }> {
    return apiClient.get('/freelancers/skills/endorsements');
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(data: IPortfolioItem): Promise<IApiResponse<{ portfolioItem: { id: string; title: string; featured: boolean } }>> {
    return apiClient.post('/freelancers/portfolio', data);
  }

  /**
   * Get freelancers with advanced filtering (public access)
   */
  async getFreelancers(filters?: IFreelancerFilters): Promise<PaginatedApiResponse<IFreelancerPublicProfile>> {
    return apiClient.get('/users/freelancers', { params: filters });
  }

  /**
   * Submit work for milestone
   */
  async submitMilestoneWork(contractId: string, milestoneId: string, data: { files: string[]; description: string }): Promise<IApiResponse> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/submit`, data);
  }

  /**
   * Create a review (freelancer reviewing client)
   */
  async createReview(data: { revieweeId: string; contractId: string; rating: number; comment: string }): Promise<IApiResponse<{ id: string; rating: number; comment: string; reviewerId: string; revieweeId: string; createdAt: string }>> {
    return apiClient.post('/reviews', data);
  }

  /**
   * Upload a single file (proposals, deliverables, etc.)
   */
  async uploadFile(file: File, folder?: string): Promise<IApiResponse<{ url: string; fileName: string; mimeType: string; size: number }>> {
    return apiClient.uploadFile('/files/upload/single', file, folder);
  }
}

export const freelancersService = new FreelancersService();
