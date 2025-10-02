// Balance and Earnings Types

export interface FreelancerBalance {
  totalEarned: number;
  pendingBalance: number;
  availableBalance: number;
}

export interface BalanceTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  balanceAfter: number;
  relatedId?: string; // ID of related milestone, withdrawal, etc.
  relatedType?: 'milestone' | 'withdrawal' | 'refund' | 'adjustment';
  createdAt: string;
}

// Extended User Types with Financial Data
export interface FreelancerData {
  skills: string[];
  hourlyRate?: number;
  availability?: string;
  experience?: string;
  totalEarned: number;
  pendingBalance: number;
  availableBalance: number;
  completedJobs: number;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  portfolio?: string[];
  certifications?: string[];
}

export interface UserWithFinancials {
  _id: string;
  email: string;
  role: 'freelancer' | 'client' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    bio?: string;
  };
  freelancerData?: FreelancerData;
  stripeCustomerId?: string;
  stripeAccountId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Withdrawal Fee Calculation
export interface WithdrawalFeeCalculation {
  amount: number;
  method: string;
  processingFee: number;
  finalAmount: number;
  feePercentage: number;
  fixedFee?: number;
}

// Withdrawal Limits and Constraints
export interface WithdrawalConstraints {
  minimumAmount: number;
  maximumAmount: number;
  availableBalance: number;
  canWithdraw: boolean;
  reasons?: string[]; // Why withdrawal might be disabled
}
