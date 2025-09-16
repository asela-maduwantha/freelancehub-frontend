'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Loader from '../../../components/ui/Feedback/Loader';
import { Alert } from '../../../components/ui/Feedback';
import { authService } from '../../../lib/api/auth';
import { store } from '../../../store';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

interface VerifyEmailFormData {
  email: string;
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

  const [formData, setFormData] = useState<VerifyEmailFormData>({
    email: searchParams.get('email') || '',
    otp: '',
  });

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

    if (!formData.email || !formData.otp) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail({
        email: formData.email,
        otp: formData.otp,
      });

      setSuccessMessage('Email verified successfully! Redirecting to dashboard...');

      // Get user role from Redux store and redirect to appropriate dashboard
      const user = store.getState().auth.user;
      setTimeout(() => {
        if (user?.role === 'client') {
          router.push('/dashboard/client');
        } else if (user?.role === 'freelancer') {
          router.push('/dashboard/freelancer');
        } else if (user?.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          // Fallback to generic dashboard
          router.push('/dashboard');
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
        email: formData.email,
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

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit verification code to your email address.
              Please enter it below to verify your account.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* OTP Input */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={handleInputChange('otp')}
                  required
                  disabled={isLoading}
                  className="w-full text-center text-2xl tracking-widest"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
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
              className="w-full"
              disabled={isLoading || !formData.email || !formData.otp}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader size="sm" className="mr-2" />
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </Button>

            {/* Resend Verification */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0 || !formData.email}
                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
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

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Check your spam folder or contact{' '}
              <Link href="/contact" className="text-orange-600 hover:text-orange-500">
                support
              </Link>
            </p>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader size="lg" />
        </div>
      </AuthLayout>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}