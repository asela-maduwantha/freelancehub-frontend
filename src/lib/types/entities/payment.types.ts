export interface IPayment {
  _id: string;
  id: string;
  contractId: string;
  payeeId: string;
  payerId: string;
  projectId: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  type: 'milestone' | 'bonus' | 'refund' | 'final';
  escrowStatus?: 'held' | 'released' | 'disputed';
  platformFee: number;
  netAmount: number;
  description?: string;
  stripePaymentIntentId?: string;
  createdAt: string | Date;
  completedAt?: string;
  releasedAt?: string;
  autoReleaseDate?: string;
  contract?: {
    id: string;
    title: string;
  };
  freelancer?: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  milestone?: {
    id: string;
    title: string;
    description: string;
  };
  receipt?: {
    id: string;
    url: string;
  };
}

export interface IPaymentStats {
  totalSpent: number;
  pendingPayments: number;
  completedPayments: number;
  platformFees: number;
  availableBalance: number;
  heldInEscrow: number;
  paymentCount: number;
  averagePayment: number;
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  currency: string;
}

export interface IWallet {
  balance: number;
  currency: string;
  paymentMethods: IPaymentMethod[];
  transactions: IWalletTransaction[];
}

export interface IPaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface IWalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'hold' | 'release';
  amount: number;
  description: string;
  createdAt: string;
  paymentId?: string;
}

export interface IEscrowPayment {
  id: string;
  paymentId: string;
  amount: number;
  heldAt: string;
  autoReleaseAt?: string;
  status: 'held' | 'released' | 'disputed' | 'refunded';
  freelancer: {
    id: string;
    name: string;
  };
  milestone: {
    id: string;
    title: string;
  };
}

export interface IPaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ICreatePaymentRequest {
  contractId: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
  autoRelease?: boolean;
  autoReleaseDays?: number;
}

export interface IPaymentConfirmation {
  paymentId: string;
  status: string;
  amount: number;
  fees: number;
  netAmount: number;
  escrowHeld: boolean;
  autoReleaseAt?: string;
}

export interface IRecurringPayment {
  id: string;
  contractId: string;
  contractTitle: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'bi-weekly';
  nextPaymentDate: string;
  paymentMethod: 'stripe' | 'wallet';
  status: 'active' | 'paused' | 'cancelled';
  autoRelease: boolean;
  autoReleaseDays: number;
  createdAt: string;
  updatedAt: string;
  lastPaymentDate?: string;
  totalPayments: number;
  failedPayments: number;
}

export interface ICreateRecurringPaymentRequest {
  contractId: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'bi-weekly';
  paymentMethod: 'stripe' | 'wallet';
  autoRelease?: boolean;
  autoReleaseDays?: number;
  startDate?: string;
}

export interface IStripeConnectAccount {
  accountId: string;
  status: 'pending' | 'complete' | 'error';
  onboardingUrl?: string;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
  processed: boolean;
  processedAt?: string;
}

export interface IAutoReleaseSettings {
  enabled: boolean;
  defaultDays: number;
  minDays: number;
  maxDays: number;
}

export interface IWithdrawalRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payoutId?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface IRefundRequest {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  refundId?: string;
  createdAt: string;
  processedAt?: string;
}

export interface IDispute {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'open' | 'resolved' | 'escalated';
  createdAt: string;
  resolvedAt?: string;
  resolution?: 'release' | 'refund';
  adminNotes?: string;
}