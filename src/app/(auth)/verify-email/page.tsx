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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a 6-digit verification code to:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Secure Verification</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Your verification code is valid for 10 minutes and can only be used once.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-3">
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
                  className="text-center text-2xl tracking-[0.5em] h-14 font-mono bg-gray-50 border-2 focus:border-orange-500 focus:bg-white"
                />
                {formData.otp.length === 6 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
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
                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
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
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wrong email? Go back to register
              </Link>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Check your spam folder or contact our support team.
              </p>
              <Link
                href="/contact"
                className="text-xs text-orange-600 hover:text-orange-500 font-medium"
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <Loader size="lg" />
            <p className="text-gray-600">Loading verification page...</p>
          </div>
        </div>
      </AuthLayout>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}