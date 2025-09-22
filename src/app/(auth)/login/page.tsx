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
      <div className="max-w-md mx-auto space-y-8">
        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex justify-center space-x-8 mb-6">
            <div className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[rgba(42,74,91,0.2)] to-[rgba(42,74,91,0.1)] flex items-center justify-center mb-3 border border-[rgba(42,74,91,0.3)] group-hover:border-[rgba(42,74,91,0.5)] transition-all duration-300 group-hover:scale-105">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-white/90">Secure</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[rgba(43,108,176,0.2)] to-[rgba(43,108,176,0.1)] flex items-center justify-center mb-3 border border-[rgba(43,108,176,0.3)] group-hover:border-[rgba(43,108,176,0.5)] transition-all duration-300 group-hover:scale-105">
                <Users className="w-7 h-7 text-info" />
              </div>
              <span className="text-sm font-medium text-white/90">Community</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[rgba(245,101,101,0.2)] to-[rgba(245,101,101,0.1)] flex items-center justify-center mb-3 border border-[rgba(245,101,101,0.3)] group-hover:border-[rgba(245,101,101,0.5)] transition-all duration-300 group-hover:scale-105">
                <Star className="w-7 h-7 text-accent" />
              </div>
              <span className="text-sm font-medium text-white/90">Trusted</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-white">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/60 group-focus-within:text-accent transition-colors duration-200" />
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
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:bg-white/15 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-white">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/60 group-focus-within:text-accent transition-colors duration-200" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                disabled={isLoading}
                className="pl-12 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:bg-white/15 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white/60" />
                ) : (
                  <Eye className="h-5 w-5 text-white/60" />
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
                className="h-4 w-4 rounded border-white/30 bg-white/10 text-accent focus:ring-accent focus:ring-offset-0 focus:ring-2 transition-all duration-200"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-3 block text-sm font-medium text-white/90">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
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
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent-active shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-white/70 font-medium">New to our platform?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <Link href="/register">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Create Your Account</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-semibold text-white">Secure & Trusted</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Your data is protected with enterprise-grade security. Join thousands of professionals already using our platform.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}