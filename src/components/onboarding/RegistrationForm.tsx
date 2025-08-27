"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, User, Phone, Calendar, MapPin, Lock, Check } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import PasswordStrength from '@/components/ui/PasswordStrength';
import LocationSelector from '@/components/ui/LocationSelector';
import Button from '@/components/ui/Button';
import { RegisterData } from '@/types';
import { authApi } from '@/api/services/auth';
import { freelancerApi } from '@/api/services/freelancer';

interface RegistrationFormProps {
  onSuccess: (data: RegisterData) => void;
  onError: (error: string) => void;
}

const RegistrationForm = ({ onSuccess, onError }: RegistrationFormProps) => {
  const [formData, setFormData] = useState<Partial<RegisterData>>({
    role: 'freelancer',
    termsAccepted: false,
    privacyAccepted: false,
  });
  
  const [validationStates, setValidationStates] = useState<Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[], isValid: false });

  // Debounced username check
  useEffect(() => {
    if (formData.username && formData.username.length >= 3) {
      const timer = setTimeout(async () => {
        setValidationStates(prev => ({ ...prev, username: 'validating' }));
        try {
          const response = await freelancerApi.checkUsernameAvailability(formData.username!);
          setUsernameAvailable(response.data?.available || false);
          setValidationStates(prev => ({ 
            ...prev, 
            username: response.data?.available ? 'valid' : 'invalid' 
          }));
          
          if (!response.data?.available) {
            setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
          } else {
            setErrors(prev => ({ ...prev, username: '' }));
          }
        } catch (error) {
          setValidationStates(prev => ({ ...prev, username: 'idle' }));
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.username]);

  // Password strength validation
  useEffect(() => {
    if (formData.password) {
      // Simple password strength calculation
      const password = formData.password;
      let score = 0;
      const feedback: string[] = [];

      if (password.length >= 8) score++;
      else feedback.push('Use at least 8 characters');

      if (/[a-z]/.test(password)) score++;
      else feedback.push('Add lowercase letters');

      if (/[A-Z]/.test(password)) score++;
      else feedback.push('Add uppercase letters');

      if (/\d/.test(password)) score++;
      else feedback.push('Add numbers');

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
      else feedback.push('Add special characters');

      setPasswordStrength({
        score,
        feedback,
        isValid: score >= 3
      });

      setValidationStates(prev => ({
        ...prev,
        password: score >= 3 ? 'valid' : 'invalid'
      }));
    }
  }, [formData.password]);

  // Email validation
  useEffect(() => {
    if (formData.email) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      setValidationStates(prev => ({
        ...prev,
        email: isValid ? 'valid' : 'invalid'
      }));
      
      if (!isValid) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
  }, [formData.email]);

  // Password confirmation validation
  useEffect(() => {
    if (formData.confirmPassword && formData.password) {
      const matches = formData.password === formData.confirmPassword;
      setValidationStates(prev => ({
        ...prev,
        confirmPassword: matches ? 'valid' : 'invalid'
      }));
      
      if (!matches) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = (field: keyof RegisterData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.location?.country) newErrors.location = 'Location is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Password confirmation is required';
    if (!formData.termsAccepted) newErrors.terms = 'You must accept the terms and conditions';
    if (!formData.privacyAccepted) newErrors.privacy = 'You must accept the privacy policy';
    
    if (!passwordStrength.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    if (usernameAvailable === false) {
      newErrors.username = 'Username is not available';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await authApi.register(formData as RegisterData);
      
      if (response.success) {
        onSuccess(formData as RegisterData);
      } else {
        onError(response.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        onError('Email or username already exists');
      } else if (error.response?.status === 400) {
        onError('Invalid data provided. Please check your inputs.');
      } else {
        onError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Freelancer Account
        </h2>
        <p className="text-gray-600">
          Join thousands of talented freelancers on FreelanceHub
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email and Username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            validationState={validationStates.email}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          
          <FormField
            label="Username"
            type="text"
            placeholder="your_username"
            value={formData.username || ''}
            onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            error={errors.username}
            success={usernameAvailable ? 'Username is available!' : undefined}
            validationState={validationStates.username}
            leftIcon={<User className="w-4 h-4" />}
            helperText="Only lowercase letters, numbers, and underscores"
            required
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="First Name"
            type="text"
            placeholder="John"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          
          <FormField
            label="Last Name"
            type="text"
            placeholder="Doe"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        {/* Phone and Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
          
          <FormField
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <LocationSelector
            value={formData.location}
            onChange={(location) => handleInputChange('location', location)}
            error={errors.location}
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              validationState={validationStates.password}
              leftIcon={<Lock className="w-4 h-4" />}
              showPasswordToggle
              required
            />
            
            {formData.password && (
              <div className="mt-3">
                <PasswordStrength
                  password={formData.password}
                  score={passwordStrength.score}
                  feedback={passwordStrength.feedback}
                  isValid={passwordStrength.isValid}
                />
              </div>
            )}
          </div>
          
          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword || ''}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            validationState={validationStates.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            showPasswordToggle
            required
          />
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted || false}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                Terms and Conditions
              </a>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacy"
              checked={formData.privacyAccepted || false}
              onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="privacy" className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.privacy && <p className="text-sm text-red-600">{errors.privacy}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={loading || !formData.termsAccepted || !formData.privacyAccepted}
            className="w-full py-3 text-lg"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;
