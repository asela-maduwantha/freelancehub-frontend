// Withdrawal Types

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WithdrawalMethod {
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
}

export interface Withdrawal {
  _id: string;
  freelancerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  amount: number;
  currency: string;
  finalAmount: number;
  processingFee: number;
  method?: WithdrawalMethod;
  
  // Stripe-specific fields
  stripeAccountId?: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  
  // Bank transfer fields
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  
  // PayPal fields
  paypalEmail?: string;
  
  // Additional fields
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

// Request Types
export interface CreateWithdrawalRequest {
  amount: number;
  currency?: string;
  method: WithdrawalMethod;
  description?: string;
  
  // Stripe method
  stripeAccountId?: string;
  
  // Bank transfer method
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  
  // PayPal method
  paypalEmail?: string;
}

export interface ProcessWithdrawalRequest {
  stripeTransferId?: string;
  stripePayoutId?: string;
  processingFee?: number;
  externalTransactionId?: string;
}

export interface FailWithdrawalRequest {
  errorMessage: string;
}

// Response Types
export interface WithdrawalResponse {
  withdrawal: Withdrawal;
}

export interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Parameters
export interface GetWithdrawalsQuery {
  userId?: string;
  status?: WithdrawalStatus;
  page?: number;
  limit?: number;
  sortBy?: 'requestedAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}
