'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { Input, PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Feedback';
import { authService } from '../../../lib/api/auth';
import { UserPlus, CheckCircle, ArrowRight, Shield, Star, Users } from 'lucide-react';

type UserRole = 'client' | 'freelancer';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: UserRole;
  termsAccepted: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'freelancer',
    termsAccepted: false,
  });

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'termsAccepted' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.termsAccepted) return 'Please accept the terms and conditions';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      setSuccessMessage('Registration successful! Redirecting to email verification...');

      // Redirect to email verification page with email parameter
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Our Community"
      subtitle="Create your account and start your freelance journey"
    >
      <div className="max-w-md mx-auto">
        {/* Benefits Section */}
        <div className="mb-8 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-accent-light)' }}>
                <Shield className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
              <span className="text-xs text-secondary">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-info)', opacity: 0.1 }}>
                <Users className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
              </div>
              <span className="text-xs text-secondary">Community</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-success)', opacity: 0.1 }}>
                <Star className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              </div>
              <span className="text-xs text-secondary">Trusted</span>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <div className="bg-secondary rounded-xl p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleRoleChange('freelancer')}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.role === 'freelancer'
                    ? 'bg-primary text-accent shadow-sm border border-accent'
                    : 'text-secondary hover:text-primary'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>I'm a Freelancer</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('client')}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.role === 'client'
                    ? 'bg-primary text-accent shadow-sm border border-accent'
                    : 'text-secondary hover:text-primary'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>I'm a Client</span>
                </div>
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-center text-muted">
            Choose your role to get started
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6">
            <Alert type="success" message={successMessage} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                disabled={isLoading}
                autoComplete="given-name"
                className="h-11"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                disabled={isLoading}
                autoComplete="family-name"
                className="h-11"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              disabled={isLoading}
              autoComplete="email"
              className="h-11"
            />
          </div>

          {/* Phone (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
              Phone Number <span className="text-muted text-xs">(Optional)</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              disabled={isLoading}
              autoComplete="tel"
              className="h-11"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <PasswordInput
              id="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              disabled={isLoading}
              className="h-11"
            />
            <div className="mt-2 text-xs text-muted space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleInputChange('termsAccepted')}
              className="mt-1 h-4 w-4 focus:ring-primary border-default rounded"
              style={{ 
                color: 'var(--color-accent)',
                '--tw-ring-color': 'var(--color-primary)'
              } as React.CSSProperties}
              disabled={isLoading}
              required
            />
            <div className="text-sm">
              <label htmlFor="terms" className="text-primary">
                I agree to the{' '}
                <Link href="/terms" className="link-default font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="link-default font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold link-default">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
