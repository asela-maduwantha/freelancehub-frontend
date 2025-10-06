// Withdrawal Types

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum WithdrawalMethod {
  STRIPE = 'stripe',
}

export interface Withdrawal {
  id: string;
  _id?: string; // Alias for id
  freelancerId: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  } | string;
  amount: number;
  currency: string;
  finalAmount: number;
  processingFee: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  
  // Stripe-specific fields
  stripeAccountId: string;
  stripeTransferId?: string;
  
  // Additional fields
  description?: string;
  errorMessage?: string;
  
  // Timestamps
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Metadata
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

// Request Types
export interface CreateWithdrawalRequest {
  amount: number;
  currency?: string;
  method: 'stripe';
  stripeAccountId: string;
  description?: string;
  idempotencyKey?: string;
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

// Stats Types
export interface WithdrawalStats {
  totalWithdrawn: number;
  totalPending: number;
  pendingCount: number;
  lastWithdrawalDate?: string;
  lastWithdrawalAmount?: number;
}

// NOTE: StripeAccountStatus, CreateStripeAccountRequest/Response, CreateOnboardingLinkRequest/Response
// are now defined in @/types/stripe.ts to avoid duplication
// FreelancerData and UserWithFreelancerData are defined in @/types/balance.ts
