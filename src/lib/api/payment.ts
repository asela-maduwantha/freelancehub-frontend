import { apiClient } from './client';

export interface PaymentIntentData {
  payeeId: string;
  projectId: string;
  amount: number;
  currency: string;
  milestoneId: string;
}

export interface Payment {
  id: string;
  payeeId: string;
  payerId: string;
  projectId: string;
  milestoneId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
  contract: {
    id: string;
    title: string;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  paymentCount: number;
  averagePayment: number;
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export const paymentAPI = {
  // Create payment intent for Stripe
  createPaymentIntent: async (data: PaymentIntentData) => {
    return apiClient.post('/payments/create-intent', data);
  },

  // Confirm payment
  confirmPayment: async (paymentId: string, paymentMethodId?: string) => {
    return apiClient.post(`/payments/${paymentId}/confirm`, {
      paymentMethodId
    });
  },

  // Get all payments for current user
  getPayments: async (filters?: {
    status?: string;
    projectId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    return apiClient.get(`/payments?${params.toString()}`);
  },

  // Get payment statistics
  getPaymentStats: async () => {
    return apiClient.get('/payments/stats');
  },

  // Get specific payment details
  getPayment: async (paymentId: string) => {
    return apiClient.get(`/payments/${paymentId}`);
  },

  // Cancel payment (if still pending)
  cancelPayment: async (paymentId: string) => {
    return apiClient.post(`/payments/${paymentId}/cancel`);
  }
};
