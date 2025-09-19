'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { Input, PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Feedback';
import { authService } from '../../../lib/api/auth';
import { store } from '../../../store';
import { LogIn, Eye, EyeOff, Shield, Users, Star, Mail, Lock, CheckCircle } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.password.trim()) return 'Password is required';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      // Get user role from Redux store and redirect to appropriate dashboard
      const user = store.getState().auth.user;
      if (user?.role === 'client') {
        router.push('/client/dashboard');
      } else if (user?.role === 'freelancer') {
        router.push('/freelancer/dashboard');
      } else if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      }

    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue your journey"
    >
      <div className="max-w-md mx-auto">
        {/* Trust Indicators */}
        <div className="mb-8 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <Shield className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
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
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-accent-light)' }}>
                <Star className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
              <span className="text-xs text-secondary">Trusted</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-placeholder" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={isLoading}
                autoComplete="email"
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-placeholder" />
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                disabled={isLoading}
                className="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-placeholder hover:text-secondary" />
                ) : (
                  <Eye className="h-5 w-5 text-placeholder hover:text-secondary" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange('rememberMe')}
                className="h-4 w-4 focus:ring-primary border-default rounded"
                style={{ 
                  color: 'var(--color-accent)',
                  '--tw-ring-color': 'var(--color-primary)'
                } as React.CSSProperties}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-primary">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium link-default"
              >
                Forgot password?
              </Link>
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
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary text-secondary">New to our platform?</span>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <Link href="/register">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 font-semibold"
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Create Your Account</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <div className="alert-success">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-primary-active)' }}>Secure & Trusted</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-primary-active)' }}>
              Your data is protected with enterprise-grade security. Join thousands of professionals already using our platform.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}