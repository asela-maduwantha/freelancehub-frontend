'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../../../components/layouts/AuthLayout';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Loader from '../../../components/ui/Feedback/Loader';
import { Alert } from '../../../components/ui/Feedback';
import { authService } from '../../../lib/api/auth';
import { store } from '../../../store';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Clock, Shield } from 'lucide-react';

interface VerifyEmailFormData {
  otp: string;
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState<VerifyEmailFormData>({
    otp: '',
  });

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleInputChange = (field: keyof VerifyEmailFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;

    // For OTP field, only allow digits and limit to 6 characters
    if (field === 'otp') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp) {
      setError('Please enter the verification code');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail({
        email: email,
        otp: formData.otp,
      });

      setSuccessMessage('Email verified successfully! Redirecting...');

      // Get user role from Redux store and redirect appropriately
      const user = store.getState().auth.user;
      setTimeout(() => {
        if (user?.role === 'client') {
          // Check if client has completed onboarding
          const clientOnboardingProgress = localStorage.getItem('client_onboarding_progress');
          if (clientOnboardingProgress) {
            try {
              const progress = JSON.parse(clientOnboardingProgress);
              // Check if all steps are completed
              const hasCompletedOnboarding = progress.completedSteps?.length >= 2;
              if (hasCompletedOnboarding) {
                router.push('/client/dashboard');
              } else {
                // Redirect to current step in onboarding
                const currentStep = progress.currentStep || 1;
                router.push(`/client/onboarding?step=${currentStep}`);
              }
            } catch (error) {
              // If there's an error parsing progress, start fresh onboarding
              router.push('/client/onboarding?step=1');
            }
          } else {
            // No progress found, start onboarding
            router.push('/client/onboarding?step=1');
          }
        } else if (user?.role === 'freelancer') {
          // Check if freelancer has completed onboarding
          const onboardingProgress = localStorage.getItem('freelancer_onboarding_progress');
          if (onboardingProgress) {
            try {
              const progress = JSON.parse(onboardingProgress);
              // Check if all 4 steps are completed (updated from 6 to 4)
              const hasCompletedOnboarding = progress.completedSteps?.length >= 4;
              if (hasCompletedOnboarding) {
                router.push('/freelancer/dashboard');
              } else {
                // Redirect to current step in onboarding
                const currentStep = progress.currentStep || 1;
                router.push(`/freelancer/onboarding?step=${currentStep}`);
              }
            } catch (error) {
              // If there's an error parsing progress, start fresh onboarding
              router.push('/freelancer/onboarding?step=1');
            }
          } else {
            // No progress found, start onboarding
            router.push('/freelancer/onboarding?step=1');
          }
        } else if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // Fallback to generic dashboard
          router.push('/');
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await authService.resendVerification({
        email: email,
      });

      setSuccessMessage('Verification code sent successfully!');
      setResendCooldown(60); // 60 second cooldown

    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no email
  if (!email) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-hover))' }}>
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Verify Your Email
            </h2>
            <p className="text-secondary mb-4">
              We've sent a 6-digit verification code to:
            </p>
            <div className="bg-secondary rounded-lg p-4 border border-light">
              <p className="font-medium text-primary">{email}</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="alert-info mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-info)' }} />
              <div>
                <h3 className="text-sm font-medium" style={{ color: '#1E40AF' }}>Secure Verification</h3>
                <p className="text-xs mt-1" style={{ color: '#1E40AF', opacity: 0.8 }}>
                  Your verification code is valid for 10 minutes and can only be used once.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-primary mb-3">
                Enter Verification Code
              </label>
              <div className="relative">
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleInputChange('otp')}
                  required
                  disabled={isLoading}
                  className="text-center text-2xl tracking-[0.5em] h-14 font-mono bg-secondary border-2 focus:bg-primary"
                />
                {formData.otp.length === 6 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-muted text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert type="error" message={error} />
            )}

            {/* Success Alert */}
            {successMessage && (
              <Alert type="success" message={successMessage} />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading || formData.otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify Email</span>
                </div>
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Didn't receive the code?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0}
                className="inline-flex items-center text-sm font-medium disabled:text-muted disabled:cursor-not-allowed transition-colors link-default"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin mr-2" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}></div>
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Resend in {formatTime(resendCooldown)}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            {/* Back to Register */}
            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wrong email? Go back to register
              </Link>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <div className="bg-secondary rounded-lg p-4">
              <h3 className="text-sm font-medium text-primary mb-2">Need Help?</h3>
              <p className="text-xs text-secondary mb-3">
                Check your spam folder or contact our support team.
              </p>
              <Link
                href="/contact"
                className="text-xs link-default font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-info), var(--color-bg-primary), var(--color-accent))' }}>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-hover))' }}>
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}></div>
            <p className="text-secondary">Loading verification page...</p>
          </div>
        </div>
      </AuthLayout>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}