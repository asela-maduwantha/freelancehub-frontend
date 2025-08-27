"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, DollarSign, Clock, FileText } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SkillSelector from '@/components/ui/SkillSelector';
import Button from '@/components/ui/Button';
import { FreelancerProfileUpdateData, ExperienceLevel, AvailabilityOption } from '@/types';
import { freelancerApi } from '@/api/services/freelancer';

interface ProfileCompletionProps {
  onSuccess: (data: FreelancerProfileUpdateData) => void;
  onError: (error: string) => void;
  onBack?: () => void;
}

const ProfileCompletion = ({ onSuccess, onError, onBack }: ProfileCompletionProps) => {
  const [currentSubStep, setCurrentSubStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FreelancerProfileUpdateData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const experienceLevels: ExperienceLevel[] = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'I am new to this field'
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'I have some experience and completed projects'
    },
    {
      value: 'expert',
      label: 'Expert',
      description: 'I am highly experienced and skilled'
    }
  ];

  const availabilityOptions: AvailabilityOption[] = [
    {
      value: 'full_time',
      label: 'Full-time',
      description: 'Available for full-time work (40+ hours/week)'
    },
    {
      value: 'part_time',
      label: 'Part-time',
      description: 'Available for part-time work (20-40 hours/week)'
    },
    {
      value: 'available',
      label: 'Project-based',
      description: 'Available for specific projects or contracts'
    },
    {
      value: 'not_available',
      label: 'Not available',
      description: 'Not currently looking for new work'
    }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const handleInputChange = (field: keyof FreelancerProfileUpdateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentSubStep === 1) {
      if (!formData.title) newErrors.title = 'Professional title is required';
      if (!formData.bio || formData.bio.length < 50) {
        newErrors.bio = 'Bio must be at least 50 characters long';
      }
    } else if (currentSubStep === 2) {
      if (!formData.skills || formData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
      }
      if (!formData.hourlyRate?.amount || formData.hourlyRate.amount < 5) {
        newErrors.hourlyRate = 'Please set a valid hourly rate';
      }
      if (!formData.availability) {
        newErrors.availability = 'Please select your availability';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentSubStep < 2) {
        setCurrentSubStep(currentSubStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentSubStep > 1) {
      setCurrentSubStep(currentSubStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    try {
      // Transform data to match backend expectations
      const profileData: FreelancerProfileUpdateData = {
        title: formData.title || '',
        bio: formData.bio || '',
        skills: formData.skills || [],
        hourlyRate: formData.hourlyRate || { amount: 0, currency: 'USD' },
        availability: formData.availability || 'available',
        experienceLevel: formData.experienceLevel || 'intermediate'
      };
      
      const response = await freelancerApi.updateProfile(profileData);
      
      if (response.success) {
        onSuccess(profileData);
      } else {
        onError(response.error?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      onError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Professional Information
        </h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Tell us about your professional background and expertise to help clients find you
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <FormField
          label="Professional Title"
          type="text"
          placeholder="e.g., Full Stack Developer, UI/UX Designer, Content Writer"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          helperText="This will be displayed as your headline on your profile"
          required
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Professional Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Write a compelling description of your background, skills, and what makes you unique as a freelancer..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">
            {formData.bio?.length || 0}/500 characters
          </span>
          <span className="text-sm text-gray-500">
            Minimum 50 characters
          </span>
        </div>
        {errors.bio && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
            {errors.bio}
          </p>
        )}
      </div>

      {/* Experience Level */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Experience Level
        </label>
        <div className="grid grid-cols-1 gap-4">
          {experienceLevels.map((level) => (
            <label
              key={level.value}
              className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                formData.experienceLevel === level.value
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={formData.experienceLevel === level.value}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
              />
              <div className="ml-4">
                <div className="font-semibold text-gray-900 text-lg">{level.label}</div>
                <div className="text-sm text-gray-600 mt-1">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Skills & Pricing
        </h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Set your skills and pricing to attract the right clients and projects
        </p>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Your Skills <span className="text-red-500">*</span>
        </label>
        <SkillSelector
          value={formData.skills || []}
          onChange={(skills) => handleInputChange('skills', skills)}
          error={errors.skills}
          maxSkills={15}
        />
        {errors.skills && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
            {errors.skills}
          </p>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Hourly Rate <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Currency</label>
            <select
              value={formData.hourlyRate?.currency || 'USD'}
              onChange={(e) => handleInputChange('hourlyRate', {
                ...formData.hourlyRate,
                currency: e.target.value
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Amount per hour</label>
            <input
              type="number"
              min="5"
              max="1000"
              step="5"
              placeholder="50"
              value={formData.hourlyRate?.amount || ''}
              onChange={(e) => handleInputChange('hourlyRate', {
                ...formData.hourlyRate,
                currency: formData.hourlyRate?.currency || 'USD',
                amount: parseInt(e.target.value) || 0
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        {errors.hourlyRate && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
            {errors.hourlyRate}
          </p>
        )}
        <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 This is your base rate. You can always adjust it for specific projects.
        </p>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Availability <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-4">
          {availabilityOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                formData.availability === option.value
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <input
                type="radio"
                name="availability"
                value={option.value}
                checked={formData.availability === option.value}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 mt-1"
              />
              <div className="ml-4">
                <div className="font-semibold text-gray-900 text-lg">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.availability && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
            {errors.availability}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentSubStep === 1 && renderStep1()}
        {currentSubStep === 2 && renderStep2()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleBack}
          className="px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center space-x-3">
          {[1, 2].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                step === currentSubStep ? 'bg-blue-500 scale-110' : 
                step < currentSubStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </div>
          ) : (
            <>
              {currentSubStep === 2 ? 'Save Profile' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletion;
