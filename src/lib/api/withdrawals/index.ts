// Withdrawal API Service
import { apiClient } from '../client';
import {
  Withdrawal,
  WithdrawalStatus,
  WithdrawalMethod,
  CreateWithdrawalRequest,
  ProcessWithdrawalRequest,
  FailWithdrawalRequest,
  GetWithdrawalsQuery,
} from '@/types';

// API Response types for withdrawals
export interface WithdrawalResponse {
  _id: string;
  freelancerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  currency: string;
  finalAmount: number;
  processingFee: number;
  method?: WithdrawalMethod;
  stripeAccountId?: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  paypalEmail?: string;
  description?: string;
  externalTransactionId?: string;
  errorMessage?: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalsListResponse {
  withdrawals: WithdrawalResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CreateWithdrawalResponse {
  _id: string;
  freelancerId: string;
  amount: number;
  currency: string;
  finalAmount: number;
  processingFee: number;
  method: WithdrawalMethod;
  stripeAccountId?: string;
  description?: string;
  status: WithdrawalStatus;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalMessageResponse {
  message: string;
}

class WithdrawalService {
  private baseUrl = '/withdrawals';

  /**
   * Create a new withdrawal request
   * POST /withdrawals
   * Role: Freelancer only
   */
  async createWithdrawal(data: CreateWithdrawalRequest): Promise<CreateWithdrawalResponse> {
    return apiClient.post(this.baseUrl, data);
  }

  /**
   * Get withdrawal history
   * GET /withdrawals
   * Role: Freelancer (own withdrawals), Admin (all withdrawals)
   */
  async getWithdrawals(query?: GetWithdrawalsQuery): Promise<WithdrawalsListResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      if (query.userId) params.append('userId', query.userId);
      if (query.status) params.append('status', query.status);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get a single withdrawal by ID
   * GET /withdrawals/:id
   * Role: Freelancer (own), Admin
   */
  async getWithdrawalById(withdrawalId: string): Promise<WithdrawalResponse> {
    return apiClient.get(`${this.baseUrl}/${withdrawalId}`);
  }

  /**
   * Process a pending withdrawal (Admin only)
   * PATCH /withdrawals/:id/process
   * Role: Admin only
   * 
   * If withdrawal has stripeAccountId and no transfer ID provided,
   * this automatically executes a Stripe transfer
   */
  async processWithdrawal(
    withdrawalId: string,
    data?: ProcessWithdrawalRequest
  ): Promise<WithdrawalResponse> {
    return apiClient.patch(`${this.baseUrl}/${withdrawalId}/process`, data || {});
  }

  /**
   * Complete a withdrawal (Admin only)
   * PATCH /withdrawals/:id/complete
   * Role: Admin only
   * 
   * Marks withdrawal as completed and deducts from freelancer's availableBalance
   */
  async completeWithdrawal(withdrawalId: string): Promise<WithdrawalResponse> {
    return apiClient.patch(`${this.baseUrl}/${withdrawalId}/complete`);
  }

  /**
   * Fail a withdrawal (Admin only)
   * PATCH /withdrawals/:id/fail
   * Role: Admin only
   * 
   * Marks withdrawal as failed, balance is NOT deducted
   */
  async failWithdrawal(
    withdrawalId: string,
    data: FailWithdrawalRequest
  ): Promise<WithdrawalResponse> {
    return apiClient.patch(`${this.baseUrl}/${withdrawalId}/fail`, data);
  }

  /**
   * Get withdrawals filtered by status
   * Convenience method for common queries
   */
  async getWithdrawalsByStatus(status: WithdrawalStatus, page = 1, limit = 20): Promise<WithdrawalsListResponse> {
    return this.getWithdrawals({ status, page, limit });
  }

  /**
   * Get pending withdrawals (Admin)
   */
  async getPendingWithdrawals(page = 1, limit = 20): Promise<WithdrawalsListResponse> {
    return this.getWithdrawalsByStatus(WithdrawalStatus.PENDING, page, limit);
  }

  /**
   * Get user's withdrawal history
   * Convenience method for fetching specific user's withdrawals
   */
  async getUserWithdrawals(userId: string, page = 1, limit = 20): Promise<WithdrawalsListResponse> {
    return this.getWithdrawals({ userId, page, limit });
  }

  /**
   * Calculate withdrawal fee preview
   * This is a client-side calculation based on documented fee structure
   */
  calculateFee(amount: number, method: WithdrawalMethod): {
    processingFee: number;
    finalAmount: number;
    feePercentage: number;
    fixedFee?: number;
  } {
    let processingFee = 0;
    let feePercentage = 0;
    let fixedFee: number | undefined;

    switch (method) {
      case WithdrawalMethod.STRIPE:
      case WithdrawalMethod.PAYPAL:
        feePercentage = 2.9;
        fixedFee = 0.30;
        processingFee = (amount * 0.029) + 0.30;
        break;
      case WithdrawalMethod.BANK_TRANSFER:
        feePercentage = 2.0;
        processingFee = amount * 0.02;
        break;
    }

    const finalAmount = amount - processingFee;

    return {
      processingFee: Math.round(processingFee * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      feePercentage,
      fixedFee,
    };
  }

  /**
   * Validate withdrawal request
   * Client-side validation before API call
   */
  validateWithdrawal(
    amount: number,
    availableBalance: number,
    method: WithdrawalMethod
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Minimum amount validation
    const MINIMUM_WITHDRAWAL = 10;
    if (amount < MINIMUM_WITHDRAWAL) {
      errors.push(`Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL}`);
    }

    // Balance validation
    if (amount > availableBalance) {
      errors.push('Insufficient balance');
    }

    // Fee calculation
    const { finalAmount } = this.calculateFee(amount, method);
    if (finalAmount < 0) {
      errors.push('Amount too low to cover processing fees');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const withdrawalService = new WithdrawalService();
export default withdrawalService;
