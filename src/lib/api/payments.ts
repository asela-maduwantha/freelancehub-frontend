/**
 * Payment Service - Frontend API Integration Layer
 * 
 * This service handles all payment-related API calls to the backend.
 * It provides a clean interface for creating payment intents, processing payments,
 * and managing payment methods.
 */

import { apiClient } from './client';

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

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
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
export const getPayment = async (paymentId: string): Promise<Payment> => {
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
};

export default paymentService;
