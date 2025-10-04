// Stripe Connected Account Types

export enum StripeAccountType {
  EXPRESS = 'express',
  STANDARD = 'standard',
}

export enum OnboardingType {
  ACCOUNT_ONBOARDING = 'account_onboarding',
  ACCOUNT_UPDATE = 'account_update',
}

export interface StripeAccountRequirements {
  currentlyDue: string[];
  eventuallyDue: string[];
  pastDue: string[];
  pendingVerification: string[];
}

export interface StripeAccount {
  id: string;
  email: string;
  country: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  type: StripeAccountType;
  created: number;
  requirements?: StripeAccountRequirements;
}

export interface StripeAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirements?: StripeAccountRequirements;
}

// Request Types
export interface CreateStripeAccountRequest {
  country: string;
  type?: StripeAccountType;
}

export interface CreateOnboardingLinkRequest {
  refreshUrl: string;
  returnUrl: string;
  type?: OnboardingType;
}

// Response Types
export interface CreateStripeAccountResponse {
  id: string;
  email: string;
  country: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  type: StripeAccountType;
  created: number;
}

export interface OnboardingLinkResponse {
  url: string;
  expiresAt: number;
}

export interface DeleteStripeAccountResponse {
  message: string;
}

// Account Setup States
export enum StripeAccountSetupState {
  NO_ACCOUNT = 'no_account',
  ACCOUNT_CREATED = 'account_created',
  ONBOARDING_INCOMPLETE = 'onboarding_incomplete',
  UNDER_REVIEW = 'under_review',
  FULLY_ENABLED = 'fully_enabled',
  RESTRICTED = 'restricted',
}

// Helper type for determining account state
export interface AccountStateInfo {
  state: StripeAccountSetupState;
  canWithdraw: boolean;
  actionRequired: boolean;
  actionMessage?: string;
  nextSteps?: string[];
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
}

export interface SetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}
