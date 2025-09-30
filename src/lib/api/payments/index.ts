// Payment API types
export interface CreatePaymentRequest {
  contractId: string;
  milestoneId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  paymentType: 'milestone' | 'bonus' | 'refund';
  platformFeePercentage: number;
  description: string;
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

export interface PaymentListResponse {
  payments: PaymentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentListItem {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentType: 'milestone' | 'bonus' | 'refund';
  contractId: {
    id: string;
    title: string;
  };
  milestoneId?: {
    id: string;
    title: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentType?: 'milestone' | 'bonus' | 'refund';
  contractId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProcessPaymentRequest {
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  stripeTransferId?: string;
  stripeFee?: number;
}

export interface FailPaymentRequest {
  errorMessage: string;
}

export interface ContractPaymentsResponse {
  payments: ContractPaymentItem[];
  total: number;
  currency: string;
}

export interface ContractPaymentItem {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentType: 'milestone' | 'bonus' | 'refund';
  milestoneId?: {
    title: string;
  };
  createdAt: string;
}

export interface ContractPaymentTotalResponse {
  totalPaid: number;
  currency: string;
  paymentCount: number;
}

export interface UserPaymentStatsResponse {
  totalEarned: number;
  totalSpent: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  currency: string;
}

export interface TransactionLogResponse {
  transactions: TransactionLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionLogItem {
  id: string;
  paymentId: string;
  type: 'payment' | 'refund' | 'fee' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface UserBalanceResponse {
  balance: number;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
}

export interface PaymentFormData {
  amount: string;
  currency: string;
  description: string;
  paymentType: 'milestone' | 'bonus' | 'refund';
}

// Payment API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

class PaymentService {
  // Create a new payment
  createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, data);
  }

  // Get all payments with filters
  getPayments(filters?: PaymentFilters): Promise<PaymentListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`${API_ENDPOINTS.PAYMENTS.LIST}?${params.toString()}`);
  }

  // Get payment by ID
  getPaymentById(paymentId: string): Promise<PaymentResponse> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.DETAIL(paymentId));
  }

  // Process payment (update with Stripe data)
  processPayment(paymentId: string, data: ProcessPaymentRequest): Promise<PaymentResponse> {
    return apiClient.patch(API_ENDPOINTS.PAYMENTS.PROCESS(paymentId), data);
  }

  // Complete payment
  completePayment(paymentId: string): Promise<PaymentResponse> {
    return apiClient.patch(API_ENDPOINTS.PAYMENTS.COMPLETE(paymentId));
  }

  // Fail payment
  failPayment(paymentId: string, data: FailPaymentRequest): Promise<PaymentResponse> {
    return apiClient.patch(API_ENDPOINTS.PAYMENTS.FAIL(paymentId), data);
  }

  // Refund payment
  refundPayment(paymentId: string): Promise<PaymentResponse> {
    return apiClient.patch(API_ENDPOINTS.PAYMENTS.REFUND(paymentId));
  }

  // Get payments for a specific contract
  getContractPayments(contractId: string): Promise<ContractPaymentsResponse> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.CONTRACT_PAYMENTS(contractId));
  }

  // Get payment total for a contract
  getContractPaymentTotal(contractId: string): Promise<ContractPaymentTotalResponse> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.CONTRACT_TOTAL(contractId));
  }

  // Get user payment statistics
  getUserPaymentStats(userId: string, userType: 'client' | 'freelancer'): Promise<UserPaymentStatsResponse> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.USER_STATS(userId, userType));
  }

  // Get transaction logs
  getTransactionLogs(page = 1, limit = 20): Promise<TransactionLogResponse> {
    return apiClient.get(`${API_ENDPOINTS.PAYMENTS.TRANSACTION_LOGS}?page=${page}&limit=${limit}`);
  }

  // Get user transactions
  getUserTransactions(userId: string, page = 1, limit = 10): Promise<TransactionLogResponse> {
    return apiClient.get(`${API_ENDPOINTS.PAYMENTS.USER_TRANSACTIONS(userId)}?page=${page}&limit=${limit}`);
  }

  // Get user balance
  getUserBalance(userId: string): Promise<UserBalanceResponse> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.USER_BALANCE(userId));
  }
}

export const paymentService = new PaymentService();
export default paymentService;