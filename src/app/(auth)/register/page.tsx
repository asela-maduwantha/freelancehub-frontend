'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { Input, PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Feedback';
import { authService } from '../../../lib/api/auth';
import { UserPlus, CheckCircle, ArrowRight, Shield, Star, Users, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (error) setError(null);
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

      // Store the role for use in email verification and clear any existing onboarding progress
      localStorage.setItem('pending_user_role', formData.role);
      if (formData.role === 'freelancer') {
        localStorage.removeItem('freelancer_onboarding_progress');
      } else if (formData.role === 'client') {
        localStorage.removeItem('client_onboarding_progress');
      }

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
      title="Create Account"
      subtitle="Join our platform and start your professional journey"
    >
      <div className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Choose Account Type</label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleRoleChange('freelancer')}
              className={`flex items-center justify-center py-2.5 px-3 text-sm font-medium rounded-md transition-all duration-300 ${
                formData.role === 'freelancer'
                  ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-800 bg-white/50 hover:bg-white/70'
              }`}
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`flex items-center justify-center py-2.5 px-3 text-sm font-medium rounded-md transition-all duration-300 ${
                formData.role === 'client'
                  ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-800 bg-white/50 hover:bg-white/70'
              }`}
              disabled={isLoading}
            >
              <Users className="w-4 h-4 mr-2" />
              Client
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center space-x-8 py-4">
          <div className="flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-amber-400 flex items-center justify-center mb-2 shadow-md group-hover:shadow-blue-500/30 transform group-hover:scale-110 transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300">Secure</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center mb-2 shadow-md group-hover:shadow-blue-500/30 transform group-hover:scale-110 transition-all duration-300">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300">Verified</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-blue-500 flex items-center justify-center mb-2 shadow-md group-hover:shadow-blue-500/30 transform group-hover:scale-110 transition-all duration-300">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300">Trusted</span>
          </div>
        </div>

        {successMessage && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  disabled={isLoading}
                  autoComplete="given-name"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  disabled={isLoading}
                  autoComplete="family-name"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={isLoading}
                autoComplete="email"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Phone Number <span className="text-slate-500 text-sm">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={isLoading}
                autoComplete="tel"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="mt-2">
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-medium">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center ${formData.password.length >= 8 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    8+ characters
                  </div>
                  <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    Uppercase
                  </div>
                  <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    Lowercase
                  </div>
                  <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${/\d/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    Number
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleInputChange('termsAccepted')}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              disabled={isLoading}
              required
            />
            <div className="text-sm">
              <label htmlFor="terms" className="text-slate-700 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}