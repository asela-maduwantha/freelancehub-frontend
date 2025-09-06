import { apiClient } from './client';
import {
  IPayment,
  IPaymentStats,
  IWallet,
  IEscrowPayment,
  IPaymentIntent,
  ICreatePaymentRequest,
  IPaymentConfirmation,
  IStripeConnectAccount,
  IWebhookEvent,
  IWithdrawalRequest,
  IRefundRequest,
  IApiResponse
} from '../types';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  contractId: string;
  description?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentId: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface PaymentStats {
  totalPaid: number;
  totalReceived: number;
  pendingPayments: number;
  completedPayments: number;
  totalPending: number;
  totalFailed: number;
  paymentCount: number;
  averagePayment: number;
  monthlyStats: any[];
  currency: string;
}

export class PaymentsService {
  /**
   * Create payment
   */
  async createPayment(data: ICreatePaymentRequest): Promise<IPaymentIntent> {
    return apiClient.post('/payments/create', data);
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId: string, data: any): Promise<IPaymentConfirmation> {
    return apiClient.post(`/payments/${paymentId}/confirm`, data);
  }

  /**
   * Get user payments
   */
  async getPayments(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<IPayment[]> {
    const response: any = await apiClient.get('/payments', params);
    // Handle API response structure: { data: [...], timestamp: "..." }
    return response?.data || response || [];
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<IPaymentStats> {
    const response: any = await apiClient.get('/payments/stats');
    // Handle API response structure: { data: {...}, timestamp: "..." }
    return response?.data || response;
  }

  /**
   * Get payment details by ID
   */
  async getPaymentById(id: string): Promise<IPayment> {
    return apiClient.get(`/payments/${id}`);
  }

  /**
   * Process refund for payment
   */
  async refundPayment(id: string, reason: string): Promise<IApiResponse<{ refund: any }>> {
    return apiClient.post(`/payments/${id}/refund`, { reason });
  }

  /**
   * Get escrow payments
   */
  async getEscrowPayments(): Promise<IEscrowPayment[]> {
    try {
      const response: any = await apiClient.get('/payments/escrow');
      // Handle API response structure: { data: [...], timestamp: "..." }
      return response?.data || response || [];
    } catch (error) {
      console.warn('Escrow payments endpoint not available:', error);
      // Return empty array if endpoint is not implemented
      return [];
    }
  }

  /**
   * Release escrow payment
   */
  async releaseEscrowPayment(paymentId: string): Promise<IApiResponse<{ payment: IPayment }>> {
    return apiClient.post(`/payments/${paymentId}/release-escrow`);
  }

  /**
   * Get wallet information
   */
  async getWallet(): Promise<IWallet> {
    const response: any = await apiClient.get('/payments/wallet');
    // Handle API response structure: { data: {...}, timestamp: "..." }
    return response?.data || response;
  }

  /**
   * Add funds to wallet
   */
  async addFunds(amount: number, paymentMethod: string): Promise<IPaymentIntent> {
    return apiClient.post('/payments/wallet/add-funds', { amount, paymentMethod });
  }

  /**
   * Download payment receipt
   */
  async downloadReceipt(paymentId: string): Promise<Blob> {
    return apiClient.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' });
  }

  /**
   * Create Stripe Connect account for freelancer
   */
  async createStripeAccount(): Promise<IStripeConnectAccount> {
    return apiClient.post('/payments/stripe-connect/create');
  }

  /**
   * Get Stripe Connect account status
   */
  async getStripeAccountStatus(accountId: string): Promise<IStripeConnectAccount> {
    return apiClient.get(`/payments/stripe-connect/status/${accountId}`);
  }

  /**
   * Get Stripe Connect onboarding link
   */
  async getOnboardingLink(accountId: string): Promise<{ url: string }> {
    return apiClient.get(`/payments/stripe-connect/onboarding-link/${accountId}`);
  }

  /**
   * Process Stripe webhook
   */
  async processWebhook(signature: string, payload: any): Promise<IApiResponse<{ received: boolean }>> {
    // Note: Webhook processing should be done server-side for security
    // This is just for client-side webhook event retrieval
    return apiClient.post('/payments/stripe/webhook', { signature, payload });
  }

  /**
   * Create withdrawal request
   */
  async createWithdrawal(data: {
    amount: number;
    currency: string;
    description?: string;
  }): Promise<IWithdrawalRequest> {
    return apiClient.post('/payments/withdraw', data);
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(): Promise<IWithdrawalRequest[]> {
    const response: any = await apiClient.get('/payments/withdrawals');
    return response?.data || response || [];
  }

  /**
   * Process auto-releases
   */
  async processAutoReleases(): Promise<IApiResponse<{ processed: number; errors: string[] }>> {
    return apiClient.post('/payments/process-auto-releases');
  }

  /**
   * Cleanup stuck payments
   */
  async cleanupStuckPayments(): Promise<IApiResponse<{ cleaned: number; errors: string[] }>> {
    return apiClient.post('/payments/cleanup-stuck-payments');
  }

  /**
   * Get enhanced payment statistics
   */
  async getEnhancedPaymentStats(): Promise<IPaymentStats> {
    const response: any = await apiClient.get('/payments/enhanced-stats');
    return response?.data || response;
  }

  /**
   * Get payments with enhanced filtering
   */
  async getPaymentsWithFilters(params?: {
    status?: string;
    escrowStatus?: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<IPayment[]> {
    const response: any = await apiClient.get('/payments', params);
    return response?.data || response || [];
  }

  /**
   * Request refund for payment
   */
  async requestRefund(paymentId: string, reason: string): Promise<IRefundRequest> {
    return apiClient.post(`/payments/${paymentId}/refund`, { reason });
  }

  /**
   * Get refund history
   */
  async getRefundHistory(): Promise<IRefundRequest[]> {
    const response: any = await apiClient.get('/payments/refunds');
    return response?.data || response || [];
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents(limit = 50): Promise<IWebhookEvent[]> {
    const response: any = await apiClient.get('/payments/webhooks', { limit });
    return response?.data || response || [];
  }
}

export const paymentsService = new PaymentsService();