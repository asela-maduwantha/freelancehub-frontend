'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface ProfessionalData {
  title: string;
  bio: string;
  experience: 'entry' | 'intermediate' | 'expert';
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
}

interface FormErrors {
  [key: string]: string;
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<ProfessionalData>({
    title: '',
    bio: '',
    experience: 'intermediate',
    hourlyRate: 25,
    availability: 'available'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/register');
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Professional title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Professional title should be at least 10 characters';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio should be at least 50 characters';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio should not exceed 500 characters';
    }

    if (formData.hourlyRate < 5) {
      newErrors.hourlyRate = 'Hourly rate should be at least $5';
    } else if (formData.hourlyRate > 500) {
      newErrors.hourlyRate = 'Hourly rate should not exceed $500';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Store step 1 data in localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.professional = formData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

      // Navigate to step 2
      router.push('/onboarding/step-2');
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)', description: 'New to freelancing or the industry' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)', description: 'Some experience and proven skills' },
    { value: 'expert', label: 'Expert (5+ years)', description: 'Extensive experience and expertise' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available', description: 'Ready to take on new projects' },
    { value: 'busy', label: 'Busy', description: 'Limited availability' },
    { value: 'unavailable', label: 'Unavailable', description: 'Not taking new projects' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Step 1 of 4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link
            href="/register/almost-there"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
              <User className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              Tell us about yourself
            </h1>
            <p className="text-xl text-gray-600 font-inter">
              Help clients understand your expertise and professional background
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-8">
              {/* Professional Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Professional Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } font-inter`}
                  placeholder="e.g., Full-Stack Developer, UI/UX Designer, Content Writer"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                <p className="mt-1 text-sm text-gray-500">This will be the headline of your profile</p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Professional Bio
                </label>
                <textarea
                  id="bio"
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  } font-inter`}
                  placeholder="Describe your experience, skills, and what makes you unique. Include your background, expertise, and the value you bring to clients..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio ? (
                    <p className="text-sm text-red-500">{errors.bio}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tell clients about your background and expertise
                    </p>
                  )}
                  <span className="text-sm text-gray-400">
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                  Experience Level
                </label>
                <div className="space-y-3">
                  {experienceOptions.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={formData.experience === option.value}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900 font-inter">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Hourly Rate (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="hourlyRate"
                    min="5"
                    max="500"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                    } font-inter`}
                  />
                </div>
                {errors.hourlyRate && <p className="mt-1 text-sm text-red-500">{errors.hourlyRate}</p>}
                <p className="mt-1 text-sm text-gray-500">You can always adjust this later</p>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                  Current Availability
                </label>
                <div className="space-y-3">
                  {availabilityOptions.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={formData.availability === option.value}
                        onChange={(e) => handleInputChange('availability', e.target.value)}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900 font-inter">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                variant="premium"
                size="lg"
                className="font-poppins"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Continue</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
