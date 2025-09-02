import { apiClient } from './client';
import { IPayment, IApiResponse } from '../types';

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
   * Create Stripe payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return apiClient.post('/payments/create-intent', data);
  }

  /**
   * Confirm payment with Stripe
   */
  async confirmPayment(paymentId: string, data: ConfirmPaymentRequest): Promise<IApiResponse<{ payment: IPayment }>> {
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
    return apiClient.get('/payments', params);
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<PaymentStats> {
    return apiClient.get('/payments/stats');
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
}

export const paymentsService = new PaymentsService();