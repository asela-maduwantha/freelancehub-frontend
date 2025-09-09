export interface StripeCustomerSetup {
  customerId: string;
}

export interface ConnectedAccountSetup {
  accountId: string;
  onboardingUrl: string;
}

export interface PaymentMethod {
  id: string;
  type?: string;
  brand?: string;
  last4?: string;
  isDefault?: boolean;
}

export interface CreatePaymentIntentDto {
  amount: string; // cents
  currency: string;
  description?: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
}
