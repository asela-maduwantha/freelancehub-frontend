import { apiClient } from './client';
import {
  Withdrawal,
  CreateWithdrawalRequest,
  GetWithdrawalsQuery,
  WithdrawalsResponse,
} from '@/types/withdrawals';
import {
  StripeAccountStatus,
  CreateStripeAccountRequest,
  CreateStripeAccountResponse,
  CreateOnboardingLinkRequest,
  OnboardingLinkResponse,
} from '@/types/stripe';
import { UserWithFinancials } from '@/types/balance';

/**
 * Withdrawal API Service
 */
export const withdrawalAPI = {
  /**
   * Get user profile with balance information
   */
  async getUserProfile(): Promise<UserWithFinancials> {
    const data = await apiClient.get('/users/me');
    return data as UserWithFinancials;
  },

  /**
   * Get Stripe account status
   */
  async getStripeAccountStatus(): Promise<StripeAccountStatus> {
    const data = await apiClient.get('/users/stripe-account/status');
    return data as StripeAccountStatus;
  },

  /**
   * Create Stripe connected account
   */
  async createStripeAccount(data: CreateStripeAccountRequest): Promise<CreateStripeAccountResponse> {
    const response = await apiClient.post('/users/stripe-account', data);
    return response as CreateStripeAccountResponse;
  },

  /**
   * Create Stripe onboarding link
   */
  async createOnboardingLink(data: CreateOnboardingLinkRequest): Promise<OnboardingLinkResponse> {
    const response = await apiClient.post('/users/stripe-account/onboard', data);
    return response as OnboardingLinkResponse;
  },

  /**
   * Create withdrawal request
   */
  async createWithdrawal(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    const response = await apiClient.post('/withdrawals', data);
    return response as Withdrawal;
  },

  /**
   * Get all withdrawals for current user
   */
  async getWithdrawals(query?: GetWithdrawalsQuery): Promise<WithdrawalsResponse> {
    const params = new URLSearchParams();
    if (query) {
      if (query.status) params.append('status', query.status);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    }
    const queryString = params.toString();
    const url = queryString ? `/withdrawals?${queryString}` : '/withdrawals';
    const data = await apiClient.get(url);
    
    // Handle both array response and object response
    if (Array.isArray(data)) {
      return { withdrawals: data, pagination: undefined };
    }
    return data as WithdrawalsResponse;
  },

  /**
   * Get single withdrawal by ID
   */
  async getWithdrawal(id: string): Promise<Withdrawal> {
    const data = await apiClient.get(`/withdrawals/${id}`);
    return data as Withdrawal;
  },

  /**
   * Get withdrawal by ID (alias for Redux slice compatibility)
   */
  async getWithdrawalById(id: string): Promise<Withdrawal> {
    return this.getWithdrawal(id);
  },

  /**
   * Admin: Get pending withdrawals
   */
  async getPendingWithdrawals(page: number = 1, limit: number = 20): Promise<WithdrawalsResponse> {
    const data = await apiClient.get(`/withdrawals?status=pending&page=${page}&limit=${limit}`);
    if (Array.isArray(data)) {
      return { withdrawals: data, pagination: undefined };
    }
    return data as WithdrawalsResponse;
  },

  /**
   * Admin: Process withdrawal
   */
  async processWithdrawal(withdrawalId: string, data?: any): Promise<Withdrawal> {
    const response = await apiClient.patch(`/withdrawals/${withdrawalId}/process`, data);
    return response as Withdrawal;
  },

  /**
   * Admin: Complete withdrawal
   */
  async completeWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await apiClient.patch(`/withdrawals/${withdrawalId}/complete`);
    return response as Withdrawal;
  },

  /**
   * Admin: Fail withdrawal
   */
  async failWithdrawal(withdrawalId: string, data: any): Promise<Withdrawal> {
    const response = await apiClient.patch(`/withdrawals/${withdrawalId}/fail`, data);
    return response as Withdrawal;
  },
};

/**
 * Legacy alias for Redux slice compatibility
 * @deprecated Use withdrawalAPI instead
 */
export const withdrawalService = withdrawalAPI;
