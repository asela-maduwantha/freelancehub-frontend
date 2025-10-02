'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { Input, PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Feedback';
import { authService } from '../../../lib/api/auth';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

interface ResetPasswordFormData {
  otp: string;
  password: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    otp: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: keyof ResetPasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.otp.trim()) return 'Reset code is required';
    if (!formData.password.trim()) return 'New password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!email) {
      setError('Email is missing. Please request a new reset link.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.password
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset successful</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
          <p className="text-gray-600 mt-2">
            Enter the reset code sent to {email} and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          
          <Input
            type="text"
            value={formData.otp}
            onChange={handleInputChange('otp')}
            placeholder="Enter reset code"
            required
          />

          <PasswordInput
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="New password"
            required
          />

          <PasswordInput
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirm new password"
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.otp.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}