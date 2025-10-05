'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/Input/TextArea';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NavigationButtons from '../NavigationButtons';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';
import { fileService } from '@/lib/api/files';
import { freelancerApi } from '@/lib/api/freelancer';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateForm,
} from '@/lib/utils/validation';

interface ProfileFormData {
  title: string;
  overview: string;
  availability: string;
  experience: string;
  languages: string[];
}

const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
  'Turkish', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian'
].sort();

const ProfileStep: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.onboarding);

  const [formData, setFormData] = useState<ProfileFormData>({
    title: progress?.formData?.title || '',
    overview: progress?.formData?.overview || '',
    availability: (progress?.formData?.availability as 'full-time' | 'part-time' | 'contract' | 'freelance') || '',
    experience: (progress?.formData?.experience as 'beginner' | 'intermediate' | 'expert') || '',
    languages: progress?.formData?.languages || [],
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(progress?.formData?.avatar || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = formData.languages;
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(lang => lang !== language)
      : [...currentLanguages, language];

    handleInputChange('languages', newLanguages);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'File size must be less than 5MB' }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, avatar: '' }));

      // Upload the file immediately
      setIsUploading(true);
      try {
        const uploadResponse = await fileService.uploadDocument({
          file,
          description: 'Profile avatar'
        });
        setAvatarUrl(uploadResponse.url);
        setErrors(prev => ({ ...prev, avatar: '' }));
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        setErrors(prev => ({ ...prev, avatar: 'Failed to upload image. Please try again.' }));
        setAvatar(null);
        setAvatarPreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAvatarRemove = () => {
    setAvatar(null);
    setAvatarPreview(null);
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFormData = (): boolean => {
    const validationRules = {
      title: (value: string) => validateRequired(value, 'Professional title'),
      overview: (value: string) => {
        if (!value) return validateRequired(value, 'Professional overview');
        return validateMaxLength(value, 1000, 'Professional overview');
      },
      availability: (value: string) => validateRequired(value, 'Availability'),
      experience: (value: string) => validateRequired(value, 'Experience level'),
      languages: (value: string[]) => {
        if (!value || value.length === 0) {
          return 'Please select at least one language';
        }
        return null;
      },
    };

    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleContinue = async () => {
    // Mark all fields as touched for validation
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);

    if (!validateFormData()) {
      return;
    }

    try {
      // Save profile data to backend
      await freelancerApi.updateProfile({
        title: formData.title,
        overview: formData.overview,
        availability: formData.availability as 'full-time' | 'part-time',
        experience: formData.experience as 'beginner' | 'intermediate' | 'expert',
        languages: formData.languages,
        avatar: avatarUrl,
      });

      // Update progress
      dispatch(onboardingActions.updateStep(2, {
        title: formData.title,
        overview: formData.overview,
        availability: formData.availability as 'full-time' | 'part-time' | 'contract' | 'freelance',
        experience: formData.experience as 'beginner' | 'intermediate' | 'expert',
        languages: formData.languages,
        avatar: avatarUrl,
      }));

      // Mark step as completed
      dispatch(onboardingActions.completeStep(1));

      // Navigate to next step (skills)
      router.push('/freelancer/onboarding?step=2');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save profile. Please try again.' }));
    }
  };

  const handleSkip = () => {
    // Navigate to next step without saving
    dispatch(onboardingActions.updateStep(2, {}));
    router.push('/freelancer/onboarding?step=2');
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview || avatarUrl ? (
              <img
                src={avatarPreview || avatarUrl}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                ?
              </div>
            )}
            {(avatarPreview || avatarUrl) && (
              <button
                onClick={handleAvatarRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                aria-label="Remove avatar"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
              disabled={isUploading}
            />
            <label htmlFor="avatar-upload">
              <div className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2">
              JPG, PNG up to 5MB. Square images work best.
            </p>
            {errors.avatar && (
              <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Professional Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Full Stack Developer, UI/UX Designer"
              className={errors.title && touched.title ? 'border-red-500' : ''}
            />
            {errors.title && touched.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="overview" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Overview *
              <span className="text-gray-500 text-xs ml-1">
                ({formData.overview.length}/1000 characters)
              </span>
            </label>
            <TextArea
              value={formData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              placeholder="Describe your experience, skills, and what makes you unique as a professional..."
              rows={4}
              className={errors.overview && touched.overview ? 'border-red-500' : ''}
            />
            {errors.overview && touched.overview && (
              <p className="text-sm text-red-600 mt-1">{errors.overview}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability *
              </label>
              <select
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.availability && touched.availability ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select availability</option>
                {AVAILABILITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.availability && touched.availability && (
                <p className="text-sm text-red-600 mt-1">{errors.availability}</p>
              )}
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.experience && touched.experience ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {errors.experience && touched.experience && (
                <p className="text-sm text-red-600 mt-1">{errors.experience}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Languages *
              <span className="text-gray-500 text-xs ml-1">
                ({formData.languages.length} selected)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {LANGUAGES.map(language => (
                <button
                  key={language}
                  type="button"
                  onClick={() => handleLanguageToggle(language)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                    formData.languages.includes(language)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
            {errors.languages && touched.languages && (
              <p className="text-sm text-red-600 mt-2">{errors.languages}</p>
            )}
          </div>
        </div>
      </Card>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <NavigationButtons
        onNext={handleContinue}
        onSkip={handleSkip}
        nextLabel="Continue"
        skipLabel="Skip for now"
        showSkip={true}
        nextDisabled={isLoading || isUploading}
        loading={isLoading}
      />
    </div>
  );
};

export default ProfileStep;