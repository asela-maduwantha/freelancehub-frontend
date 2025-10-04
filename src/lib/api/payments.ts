/**
 * Payment Service - Frontend API Integration Layer
 * 
 * This service handles all payment-related API calls to the backend.
 * It provides a clean interface for creating payment intents, processing payments,
 * and managing payment methods.
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

// =====================================================
// Type Definitions
// =====================================================

export interface CreatePaymentIntentDto {
  contractId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  paymentMethodId?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  paymentId?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentDto {
  contractId: string;
  milestoneId?: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  paymentType: 'milestone' | 'hourly' | 'bonus' | 'refund';
  platformFeePercentage: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  _id: string;
  contractId: string;
  milestoneId?: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  paymentType: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeTransferId?: string;
  platformFee: number;
  platformFeePercentage: number;
  stripeFee: number;
  freelancerAmount: number;
  status: string;
  description?: string;
  metadata?: Record<string, any>;
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponse {
  id: string;
  contractId: string;
  milestoneId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  paymentType: 'milestone' | 'bonus' | 'refund';
  platformFee: number;
  stripeFee: number;
  freelancerAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeTransferId?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface PaymentListItem {
  _id: string;
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentType: 'milestone' | 'bonus' | 'refund';
  contractId: {
    _id: string;
    id?: string;
    title: string;
    status?: string;
    totalAmount?: number;
    currency?: string;
  } | null;
  milestoneId?: {
    _id: string;
    id?: string;
    title: string;
  } | null;
  payerId?: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  payeeId?: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  description?: string;
  createdAt: string;
  platformFee?: number;
  stripeFee?: number;
  freelancerAmount?: number;
}

export interface UserPaymentStatsResponse {
  totalEarned: number;
  totalSpent: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
}

export interface SetupIntentResponse {
  clientSecret?: string | null;
  setupIntentId: string;
}

export interface CreatePaymentMethodDto {
  paymentMethodId: string;
  isDefault?: boolean;
}

export interface PaymentListResponse {
  payments: PaymentListItem[];
  total: number;
  totalPages: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  contractId?: string;
  milestoneId?: string;
  payerId?: string;
  payeeId?: string;
  status?: string;
  paymentType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// =====================================================
// Payment Service Functions
// =====================================================

/**
 * Create a payment intent for a contract payment
 * This should be called before the user enters their card details
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentDto
): Promise<PaymentIntent> => {
  try {
    const response = await apiClient.post('/payments/create-intent', data);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to create payment intent:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create payment intent'
    );
  }
};

/**
 * DEPRECATED: This method should not be used in the new flow
 * Payments are now automatically created when payment intents are created
 * and completed via webhooks when payment succeeds
 */
export const createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
  try {
    const response = await apiClient.post('/payments', data);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to create payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create payment'
    );
  }
};

/**
 * Get payment details by ID
 */
export const getPayment = async (paymentId: string): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to get payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to retrieve payment'
    );
  }
};

/**
 * Get payments for a specific contract
 */
export const getContractPayments = async (contractId: string): Promise<Payment[]> => {
  try {
    const response = await apiClient.get(`/payments/contract/${contractId}`);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to get contract payments:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to retrieve payments'
    );
  }
};

/**
 * Get user's saved payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethodsResponse> => {
  try {
    const response = await apiClient.get('/payments/methods');
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to get payment methods:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to retrieve payment methods'
    );
  }
};

/**
 * DEPRECATED: Do not call this from frontend
 * Payment processing is handled automatically by webhooks
 */
export const processPayment = async (
  paymentId: string,
  data?: any
): Promise<Payment> => {
  console.warn(
    '[PaymentService] processPayment should not be called from frontend - handled by webhooks'
  );
  try {
    const response = await apiClient.patch(`/payments/${paymentId}/process`, data);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to process payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to process payment'
    );
  }
};

/**
 * DEPRECATED: Do not call this from frontend
 * Payment completion is handled automatically by webhooks
 */
export const completePayment = async (paymentId: string): Promise<Payment> => {
  console.warn(
    '[PaymentService] completePayment should not be called from frontend - handled by webhooks'
  );
  try {
    const response = await apiClient.patch(`/payments/${paymentId}/complete`, {});
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to complete payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to complete payment'
    );
  }
};

/**
 * Report a failed payment (for error tracking)
 */
export const failPayment = async (
  paymentId: string,
  data: { errorMessage: string }
): Promise<Payment> => {
  try {
    const response = await apiClient.patch(`/payments/${paymentId}/fail`, data);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to mark payment as failed:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update payment status'
    );
  }
};

/**
 * Get user payment statistics
 */
export const getUserPaymentStats = async (
  userId: string,
  userType: 'client' | 'freelancer'
): Promise<UserPaymentStatsResponse> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.USER_STATS(userId, userType));
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to get user payment stats:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to get user payment stats'
    );
  }
};

/**
 * Request a refund for a completed payment (admin only)
 */
export const refundPayment = async (
  paymentId: string,
  refundAmount?: number
): Promise<Payment> => {
  try {
    const response = await apiClient.patch(`/payments/${paymentId}/refund`, {
      refundAmount,
    });
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to refund payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to refund payment'
    );
  }
};

/**
 * Get payments with pagination and filters
 */
export const getPayments = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    contractId?: string;
    milestoneId?: string;
    payerId?: string;
    payeeId?: string;
    status?: string;
    paymentType?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}): Promise<{ payments: PaymentListItem[]; total: number; totalPages: number }> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // Add filters
    if (params.filters) {
      if (params.filters.contractId) queryParams.append('contractId', params.filters.contractId);
      if (params.filters.milestoneId) queryParams.append('milestoneId', params.filters.milestoneId);
      if (params.filters.payerId) queryParams.append('payerId', params.filters.payerId);
      if (params.filters.payeeId) queryParams.append('payeeId', params.filters.payeeId);
      if (params.filters.status) queryParams.append('status', params.filters.status);
      if (params.filters.paymentType) queryParams.append('paymentType', params.filters.paymentType);
      if (params.filters.dateRange) {
        queryParams.append('startDate', params.filters.dateRange.start.toISOString());
        queryParams.append('endDate', params.filters.dateRange.end.toISOString());
      }
    }

    const response = await apiClient.get(`/payments?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to get payments:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to retrieve payments'
    );
  }
};

/**
 * Create a setup intent for saving payment methods
 */
export const createSetupIntent = async (): Promise<SetupIntentResponse> => {
  try {
    const response = await apiClient.post('/payment-methods/setup-intent');
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to create setup intent:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create setup intent'
    );
  }
};

/**
 * Save a payment method
 */
export const savePaymentMethod = async (data: CreatePaymentMethodDto): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.post('/payment-methods', data);
    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Failed to save payment method:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to save payment method'
    );
  }
};

// Export all functions as a single service object for backwards compatibility
export const paymentService = {
  createPaymentIntent,
  createPayment,
  getPayment,
  getContractPayments,
  getPaymentMethods,
  processPayment,
  completePayment,
  failPayment,
  refundPayment,
  getUserPaymentStats,
  getPayments,
  createSetupIntent,
  savePaymentMethod,
};

export default paymentService;
