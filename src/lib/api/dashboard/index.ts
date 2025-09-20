import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  activeContracts: number;
  totalSpent: number;
  pendingProposals: number;
  ongoingProjects: number;
}

export interface RecentJob {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'completed';
  proposalsCount: number;
  createdAt: string;
  budget: number;
}

export interface RecentContract {
  id: string;
  jobTitle: string;
  freelancerName: string;
  status: 'active' | 'completed' | 'cancelled';
  contractValue: number;
  startDate: string;
}

export interface FreelancerStats {
  totalProposals: number;
  activeProposals: number;
  activeContracts: number;
  completedProjects: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
}

export interface FreelancerProposal {
  id: string;
  jobTitle: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposedAmount: number;
  submittedAt: string;
  clientName: string;
}

export interface ActiveContract {
  id: string;
  jobTitle: string;
  clientName: string;
  status: 'active' | 'completed' | 'cancelled';
  contractValue: number;
  progress: number;
}

export interface ClientDashboardData {
  stats: DashboardStats;
  recentJobs: RecentJob[];
  recentContracts: RecentContract[];
  message: string;
  success: boolean;
}

export interface FreelancerDashboardData {
  stats: FreelancerStats;
  recentProposals: FreelancerProposal[];
  activeContracts: ActiveContract[];
  message: string;
  success: boolean;
}

export const dashboardApi = {
  /**
   * Get client dashboard data including stats, recent jobs, and recent contracts
   */
  getClientDashboard: async (): Promise<ClientDashboardData> => {
    try {
      const response = await apiClient.getFullResponse(API_ENDPOINTS.DASHBOARD.CLIENT);
      return response;
    } catch (error) {
      console.error('Failed to fetch client dashboard data:', error);
      throw error;
    }
  },

  /**
   * Get freelancer dashboard data (placeholder for future implementation)
   */
  getFreelancerDashboard: async (): Promise<FreelancerDashboardData> => {
    try {
      const response = await apiClient.getFullResponse(API_ENDPOINTS.DASHBOARD.FREELANCER);
      return response;
    } catch (error) {
      console.error('Failed to fetch freelancer dashboard data:', error);
      throw error;
    }
  },
};

export default dashboardApi;