import { apiClient } from './client';
import { IUser, IApiResponse, IPaginationOptions } from '../types';
import { Dispute } from './disputes.service';

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalContracts: number;
  totalRevenue: number;
  activeUsers: number;
  pendingProjects: number;
  disputedContracts: number;
}

export interface RevenueStats {
  period: string;
  totalRevenue: number;
  platformFees: number;
  paymentProcessingFees: number;
  netRevenue: number;
  currency: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  freelancersCount: number;
  clientsCount: number;
  userGrowthRate: number;
}

export interface AdminUser extends IUser {
  status: string;
  lastLogin?: Date;
  stats?: {
    totalProjects: number;
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
  };
}

export interface PendingProject {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}

export interface ReportedContent {
  id: string;
  type: string;
  contentId: string;
  reason: string;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: string;
  createdAt: Date;
}

export interface SystemSettings {
  platformFee: number;
  paymentProcessingFee: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

export interface ProjectAnalytics {
  period: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  averageBudget: number;
  popularCategories: Array<{ category: string; count: number }>;
}

export interface ContractAnalytics {
  period: string;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  disputedContracts: number;
  averageDuration: number;
  averageValue: number;
  successRate: number;
}

export interface PaymentAnalytics {
  period: string;
  totalPayments: number;
  totalVolume: number;
  averagePayment: number;
  paymentMethods: Record<string, number>;
  currency: string;
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get('/admin/dashboard/stats');
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(period?: string): Promise<RevenueStats> {
    const params = period ? { period } : undefined;
    return apiClient.get('/admin/stats/revenue', params);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    return apiClient.get('/admin/stats/users');
  }

  /**
   * Get all users
   */
  async getUsers(params?: IPaginationOptions & {
    role?: string;
    status?: string;
  }): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get('/admin/users', params);
  }

  /**
   * Get detailed user information
   */
  async getUserById(id: string): Promise<AdminUser> {
    return apiClient.get(`/admin/users/${id}`);
  }

  /**
   * Update user status
   */
  async updateUserStatus(id: string, status: string): Promise<IApiResponse> {
    return apiClient.put(`/admin/users/${id}/status`, { status });
  }

  /**
   * Get pending projects for approval
   */
  async getPendingProjects(): Promise<PendingProject[]> {
    return apiClient.get('/admin/projects/pending');
  }

  /**
   * Approve pending project
   */
  async approveProject(id: string, moderationNotes?: string): Promise<IApiResponse> {
    return apiClient.post(`/admin/projects/${id}/approve`, { moderationNotes });
  }

  /**
   * Reject pending project
   */
  async rejectProject(id: string, reason: string): Promise<IApiResponse> {
    return apiClient.post(`/admin/projects/${id}/reject`, { reason });
  }

  /**
   * Get reported content
   */
  async getReports(): Promise<ReportedContent[]> {
    return apiClient.get('/admin/reports');
  }

  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings> {
    return apiClient.get('/admin/settings');
  }

  /**
   * Update system settings
   */
  async updateSettings(settings: Partial<SystemSettings>): Promise<IApiResponse> {
    return apiClient.put('/admin/settings', settings);
  }

  /**
   * Get available project categories
   */
  async getCategories(): Promise<{ categories: string[] }> {
    return apiClient.get('/admin/categories');
  }

  /**
   * Update project categories
   */
  async updateCategories(categories: string[]): Promise<IApiResponse<{ categories: string[] }>> {
    return apiClient.put('/admin/categories', { categories });
  }

  /**
   * Get available skills
   */
  async getSkills(): Promise<{ skills: string[] }> {
    return apiClient.get('/admin/skills');
  }

  /**
   * Update available skills
   */
  async updateSkills(skills: string[]): Promise<IApiResponse<{ skills: string[] }>> {
    return apiClient.put('/admin/skills', { skills });
  }

  /**
   * Get platform fees configuration
   */
  async getFees(): Promise<{
    platformFee: number;
    paymentProcessingFee: number;
    currency: string;
  }> {
    return apiClient.get('/admin/fees');
  }

  /**
   * Update platform fees
   */
  async updateFees(fees: {
    platformFee?: number;
    paymentProcessingFee?: number;
  }): Promise<IApiResponse<{
    fees: {
      platformFee: number;
      paymentProcessingFee: number;
      currency: string;
    };
  }>> {
    return apiClient.put('/admin/fees', fees);
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(period?: string): Promise<ProjectAnalytics> {
    const params = period ? { period } : undefined;
    return apiClient.get('/admin/analytics/projects', params);
  }

  /**
   * Get contract analytics
   */
  async getContractAnalytics(period?: string): Promise<ContractAnalytics> {
    const params = period ? { period } : undefined;
    return apiClient.get('/admin/analytics/contracts', params);
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(period?: string): Promise<PaymentAnalytics> {
    const params = period ? { period } : undefined;
    return apiClient.get('/admin/analytics/payments', params);
  }

  /**
   * Get all open disputes (admin only)
   */
  async getOpenDisputes(): Promise<Dispute[]> {
    return apiClient.get('/admin/disputes/open');
  }
}

export const adminService = new AdminService();