// Stripe Connected Account API Service
import { apiClient } from '../client';
import {
  StripeAccount,
  StripeAccountStatus,
  StripeAccountType,
  OnboardingType,
  CreateStripeAccountRequest,
  CreateOnboardingLinkRequest,
  CreateStripeAccountResponse,
  OnboardingLinkResponse,
  DeleteStripeAccountResponse,
  StripeAccountSetupState,
  AccountStateInfo,
} from '@/types';

class StripeAccountService {
  private baseUrl = '/users/stripe-account';

  /**
   * Create a Stripe Connected Account
   * POST /users/stripe-account
   * Role: Freelancer only
   * 
   * Creates a Stripe Express or Standard connected account.
   * This is the first step before receiving payouts.
   */
  async createAccount(data: CreateStripeAccountRequest): Promise<CreateStripeAccountResponse> {
    return apiClient.post(this.baseUrl, data);
  }

  /**
   * Create Account Onboarding Link
   * POST /users/stripe-account/onboard
   * Role: Freelancer only
   * 
   * Generates a Stripe onboarding link where the freelancer completes
   * account setup (identity verification, bank details, etc.).
   * Link expires in ~30 minutes.
   */
  async createOnboardingLink(data: CreateOnboardingLinkRequest): Promise<OnboardingLinkResponse> {
    return apiClient.post(`${this.baseUrl}/onboard`, data);
  }

  /**
   * Get Stripe Account Status
   * GET /users/stripe-account/status
   * Role: Freelancer only
   * 
   * Check if the freelancer has a connected account and its current status.
   * Use this to show onboarding progress and withdrawal eligibility.
   */
  async getAccountStatus(): Promise<StripeAccountStatus> {
    return apiClient.get(`${this.baseUrl}/status`);
  }

  /**
   * Delete Stripe Connected Account
   * DELETE /users/stripe-account
   * Role: Freelancer only
   * 
   * Disconnects and deletes the Stripe connected account.
   */
  async deleteAccount(): Promise<DeleteStripeAccountResponse> {
    return apiClient.delete(this.baseUrl);
  }

  /**
   * Determine account setup state
   * Helper method to interpret account status for UI
   */
  getAccountState(status: StripeAccountStatus): AccountStateInfo {
    // No account exists
    if (!status.hasAccount) {
      return {
        state: StripeAccountSetupState.NO_ACCOUNT,
        canWithdraw: false,
        actionRequired: true,
        actionMessage: 'Create your payout account to receive payments',
        nextSteps: ['Click "Setup Payout Account" to get started'],
      };
    }

    // Account created but onboarding not completed
    if (!status.detailsSubmitted) {
      return {
        state: StripeAccountSetupState.ONBOARDING_INCOMPLETE,
        canWithdraw: false,
        actionRequired: true,
        actionMessage: 'Complete your account setup to enable withdrawals',
        nextSteps: [
          'Complete identity verification',
          'Add bank account details',
          'Agree to terms of service',
        ],
      };
    }

    // Account completed but under review
    if (status.detailsSubmitted && !status.payoutsEnabled) {
      const hasPendingRequirements = 
        status.requirements?.pendingVerification && 
        status.requirements.pendingVerification.length > 0;

      return {
        state: StripeAccountSetupState.UNDER_REVIEW,
        canWithdraw: false,
        actionRequired: false,
        actionMessage: hasPendingRequirements 
          ? 'Your account is under review by Stripe'
          : 'Account setup complete, verification in progress',
        nextSteps: ['Verification typically takes 1-2 business days'],
      };
    }

    // Requirements past due or currently due
    const hasRequirements = 
      (status.requirements?.currentlyDue && status.requirements.currentlyDue.length > 0) ||
      (status.requirements?.pastDue && status.requirements.pastDue.length > 0);

    if (hasRequirements) {
      return {
        state: StripeAccountSetupState.RESTRICTED,
        canWithdraw: false,
        actionRequired: true,
        actionMessage: 'Additional information required to enable payouts',
        nextSteps: [
          'Update your account information',
          'Complete required verification steps',
        ],
      };
    }

    // Fully enabled and ready
    if (status.chargesEnabled && status.payoutsEnabled && status.detailsSubmitted) {
      return {
        state: StripeAccountSetupState.FULLY_ENABLED,
        canWithdraw: true,
        actionRequired: false,
        actionMessage: 'Your account is ready to receive payouts',
      };
    }

    // Fallback for unknown states
    return {
      state: StripeAccountSetupState.UNDER_REVIEW,
      canWithdraw: false,
      actionRequired: false,
      actionMessage: 'Account status pending',
    };
  }

  /**
   * Build onboarding link with current URL
   * Convenience method to generate onboarding link with proper URLs
   */
  async startOnboarding(
    returnPath = '/dashboard?onboarding=complete',
    refreshPath = '/dashboard?onboarding=refresh',
    type: OnboardingType = OnboardingType.ACCOUNT_ONBOARDING
  ): Promise<OnboardingLinkResponse> {
    if (typeof window === 'undefined') {
      throw new Error('This method can only be called on the client side');
    }

    const origin = window.location.origin;
    
    return this.createOnboardingLink({
      returnUrl: `${origin}${returnPath}`,
      refreshUrl: `${origin}${refreshPath}`,
    });
  }

  /**
   * Create account with default settings
   * Convenience method for quick account creation
   */
  async createAccountWithDefaults(country: string = 'US'): Promise<CreateStripeAccountResponse> {
    return this.createAccount({
      country,
    });
  }

  /**
   * Check if user can withdraw funds
   * Quick validation method
   */
  async canWithdraw(): Promise<boolean> {
    try {
      const status = await this.getAccountStatus();
      return status.hasAccount && 
             status.payoutsEnabled === true && 
             status.detailsSubmitted === true;
    } catch (error) {
      console.error('Error checking withdrawal eligibility:', error);
      return false;
    }
  }

  /**
   * Get human-readable requirement messages
   * Convert Stripe requirement keys to user-friendly messages
   */
  formatRequirements(requirements: string[]): string[] {
    const requirementMap: Record<string, string> = {
      'external_account': 'Add a bank account for payouts',
      'individual.verification.document': 'Upload identity verification document',
      'individual.verification.additional_document': 'Upload additional identity document',
      'tos_acceptance.date': 'Accept Terms of Service',
      'tos_acceptance.ip': 'Accept Terms of Service',
      'business_profile.mcc': 'Complete business profile',
      'business_profile.url': 'Add business website URL',
    };

    return requirements.map(req => 
      requirementMap[req] || `Complete: ${req.replace(/_/g, ' ')}`
    );
  }
}

export const stripeAccountService = new StripeAccountService();
export default stripeAccountService;
