import { apiClient } from './client';
import {
  IPayment,
  IPaymentStats,
  IWallet,
  IEscrowPayment,
  IPaymentIntent,
  ICreatePaymentRequest,
  IPaymentConfirmation,
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
      console.error('Escrow endpoint error:', error);
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
   * Create Stripe payment intent (legacy)
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return apiClient.post('/payments/create-intent', data);
  }
}

export const paymentsService = new PaymentsService();