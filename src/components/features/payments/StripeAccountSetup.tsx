import React, { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import useStripeAccount from '@/lib/hooks/useStripeAccount';
import { StripeAccountType } from '@/types';

interface StripeAccountSetupProps {
  onComplete?: () => void;
  className?: string;
}

const StripeAccountSetup: React.FC<StripeAccountSetupProps> = ({
  onComplete,
  className = '',
}) => {
  const {
    status,
    accountState,
    loading,
    error,
    createAccount,
    startOnboarding,
    clearError,
  } = useStripeAccount();

  const [country, setCountry] = useState('US');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      clearError();
      
      // Create the account
      await createAccount(country, StripeAccountType.EXPRESS);
      
      // Automatically start onboarding
      await startOnboarding();
      
      // Onboarding will redirect, but if it doesn't, call onComplete
      if (onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (err: any) {
      console.error('Failed to create account:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      clearError();
      await startOnboarding();
      
      if (onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (err: any) {
      console.error('Failed to start onboarding:', err);
    }
  };

  // No account yet - show create account form
  if (!status?.hasAccount) {
    return (
      <div className={`stripe-account-setup ${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Setup Payout Account
            </h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              To withdraw your earnings, you'll need to set up a Stripe payout account.
              This only takes a few minutes and is required for secure payments.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isCreating || loading}
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="NL">Netherlands</option>
              <option value="SE">Sweden</option>
            </select>
          </div>

          <Button
            onClick={handleCreateAccount}
            disabled={isCreating || loading}
            className="w-full"
            size="lg"
          >
            {isCreating || loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Account...
              </span>
            ) : (
              'Setup Payout Account'
            )}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold">Stripe</span> • Secure & trusted by millions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Account exists but onboarding not complete
  if (!status.detailsSubmitted) {
    return (
      <div className={`stripe-account-setup ${className}`}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Account Setup
            </h3>
            <p className="text-gray-700 text-sm max-w-md mx-auto">
              Your payout account has been created, but you need to complete the setup process
              with Stripe to enable withdrawals.
            </p>
          </div>

          {accountState?.nextSteps && accountState.nextSteps.length > 0 && (
            <div className="mb-6 bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-3">Next steps:</p>
              <ul className="space-y-2">
                {accountState.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={handleStartOnboarding}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Redirecting to Stripe...' : 'Continue Setup'}
          </Button>
        </div>
      </div>
    );
  }

  // Account under review or restricted
  if (!status.chargesEnabled || !status.payoutsEnabled) {
    const hasRequirements =
      status.requirements &&
      (status.requirements.currentlyDue.length > 0 || status.requirements.pastDue.length > 0);

    if (hasRequirements) {
      return (
        <div className={`stripe-account-setup ${className}`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Action Required
              </h3>
              <p className="text-gray-700 text-sm max-w-md mx-auto">
                {accountState?.actionMessage || 'Additional information is required for your payout account'}
              </p>
            </div>

            {accountState?.nextSteps && accountState.nextSteps.length > 0 && (
              <div className="mb-6 bg-white rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Required actions:</p>
                <ul className="space-y-2">
                  {accountState.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleStartOnboarding}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="accent"
            >
              {loading ? 'Redirecting...' : 'Update Account Information'}
            </Button>
          </div>
        </div>
      );
    }

    // Under review
    return (
      <div className={`stripe-account-setup ${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Account Under Review
            </h3>
            <p className="text-gray-700 text-sm max-w-md mx-auto mb-4">
              {accountState?.actionMessage || 'Your account is being verified by Stripe. This typically takes 1-2 business days.'}
            </p>
            <p className="text-xs text-gray-600">
              We'll notify you once your account is ready for withdrawals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fully enabled - show success state
  return (
    <div className={`stripe-account-setup ${className}`}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Account Ready
          </h3>
          <p className="text-gray-700 text-sm max-w-md mx-auto">
            Your payout account is fully set up and ready to receive withdrawals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeAccountSetup;
