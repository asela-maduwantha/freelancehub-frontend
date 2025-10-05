'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/Input/TextArea';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NavigationButtons from '../NavigationButtons';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumericRange,
  validateForm,
} from '@/lib/utils/validation';

interface ProfessionalFormData {
  professionalTitle: string;
  hourlyRate: number;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  availability: 'full-time' | 'part-time' | 'contract' | 'freelance';
  languages: string[];
  professionalOverview: string;
}

const PROFESSIONAL_TITLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile App Developer',
  'UI/UX Designer',
  'Graphic Designer',
  'Web Designer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'QA Engineer',
  'Technical Writer',
  'Database Administrator',
  'System Administrator',
  'Network Engineer',
  'Security Engineer',
  'Blockchain Developer',
  'Game Developer',
  'AR/VR Developer',
  'IoT Developer',
  'Cloud Architect',
  'Solutions Architect',
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Bengali', 'Russian', 'Turkish', 'Dutch',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech',
  'Slovak', 'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Hebrew',
];

const ProfessionalStep: React.FC = () => {
  const dispatch = useDispatch();
  const { progress, isLoading } = useSelector((state: RootState) => state.onboarding);

  const [formData, setFormData] = useState<ProfessionalFormData>({
    professionalTitle: progress?.formData?.professionalTitle || '',
    hourlyRate: progress?.formData?.hourlyRate || 25,
    experienceLevel: progress?.formData?.experienceLevel || 'beginner',
    availability: progress?.formData?.availability || 'full-time',
    languages: progress?.formData?.languages || ['English'],
    professionalOverview: progress?.formData?.professionalOverview || '',
  });

  const [customTitle, setCustomTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof ProfessionalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTitleSelect = (title: string) => {
    if (title === 'custom') {
      setCustomTitle('');
      return;
    }
    handleInputChange('professionalTitle', title);
    setCustomTitle('');
  };

  const handleCustomTitleSubmit = () => {
    if (customTitle.trim()) {
      handleInputChange('professionalTitle', customTitle.trim());
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      handleInputChange('languages', [...formData.languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    handleInputChange('languages', formData.languages.filter(l => l !== language));
  };

  const validateFormData = (): boolean => {
    const validationRules = {
      professionalTitle: (value: string) => validateRequired(value, 'Professional title'),
      hourlyRate: (value: number) => validateNumericRange(value, 5, 500, 'Hourly rate'),
      experienceLevel: (value: string) => validateRequired(value, 'Experience level'),
      availability: (value: string) => validateRequired(value, 'Availability'),
      languages: (value: string[]) => {
        if (!value || value.length === 0) {
          return 'At least one language is required';
        }
        return null;
      },
      professionalOverview: (value: string) => {
        const required = validateRequired(value, 'Professional overview');
        if (required) return required;
        return validateMinLength(value, 150, 'Professional overview') ||
               validateMaxLength(value, 1000, 'Professional overview');
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

    // Update progress
    dispatch(onboardingActions.updateStep(2, formData));

    // Mark step as completed
    dispatch(onboardingActions.completeStep(2));

    // Navigate to next step
    window.location.href = '/freelancer/onboarding/skills';
  };

  const handleBack = () => {
    window.location.href = '/freelancer/onboarding/profile';
  };

  return (
    <div className="space-y-8">
      {/* Professional Title */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Title</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What best describes your profession? *
            </label>
            <select
              value={formData.professionalTitle}
              onChange={(e) => handleTitleSelect(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.professionalTitle && touched.professionalTitle ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a professional title</option>
              {PROFESSIONAL_TITLES.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
              <option value="custom">Other (specify)</option>
            </select>
            {errors.professionalTitle && touched.professionalTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.professionalTitle}</p>
            )}
          </div>

          {formData.professionalTitle === 'custom' && (
            <div className="flex gap-2">
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter your professional title"
                className="flex-1"
              />
              <Button onClick={handleCustomTitleSubmit} variant="outline">
                Set Title
              </Button>
            </div>
          )}

          {formData.professionalTitle && formData.professionalTitle !== 'custom' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {formData.professionalTitle}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Hourly Rate & Experience */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate & Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 5 && value <= 500) {
                    handleInputChange('hourlyRate', value);
                  }
                }}
                className={`pl-8 ${errors.hourlyRate && touched.hourlyRate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.hourlyRate && touched.hourlyRate && (
              <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Range: $5 - $500 per hour</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level *
            </label>
            <div className="space-y-2">
              {[
                { value: 'beginner', label: 'Beginner (0-2 years)', desc: 'Just starting out or have basic skills' },
                { value: 'intermediate', label: 'Intermediate (2-5 years)', desc: 'Have some experience and can handle most tasks' },
                { value: 'expert', label: 'Expert (5+ years)', desc: 'Highly experienced with advanced skills' },
              ].map(level => (
                <label key={level.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level.value}
                    checked={formData.experienceLevel === level.value}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.experienceLevel && touched.experienceLevel && (
              <p className="text-sm text-red-600 mt-1">{errors.experienceLevel}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Availability */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How much time can you dedicate to projects? *
          </label>
          <div className="space-y-3">
            {[
              { value: 'full-time', label: 'Full-time (30+ hrs/week)', desc: 'Available for extensive projects' },
              { value: 'part-time', label: 'Part-time (10-30 hrs/week)', desc: 'Available for moderate commitments' },
              { value: 'project-based', label: 'Project-based (< 10 hrs/week)', desc: 'Available for specific tasks' },
            ].map(option => (
              <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={formData.availability === option.value}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.availability && touched.availability && (
            <p className="text-sm text-red-600 mt-1">{errors.availability}</p>
          )}
        </div>
      </Card>

      {/* Languages */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages you speak
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.languages.map(language => (
                <span
                  key={language}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {language}
                  <button
                    onClick={() => handleRemoveLanguage(language)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label={`Remove ${language}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a language</option>
                {COMMON_LANGUAGES.filter(lang => !formData.languages.includes(lang)).map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <Button onClick={handleAddLanguage} variant="outline" disabled={!newLanguage}>
                Add
              </Button>
            </div>
          </div>
          {errors.languages && touched.languages && (
            <p className="text-sm text-red-600 mt-1">{errors.languages}</p>
          )}
        </div>
      </Card>

      {/* Professional Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Overview</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell clients about your expertise and experience *
            <span className="text-gray-500 text-xs ml-1">
              ({formData.professionalOverview.length}/1000 characters)
            </span>
          </label>
          <TextArea
            value={formData.professionalOverview}
            onChange={(e) => handleInputChange('professionalOverview', e.target.value)}
            placeholder="Highlight your expertise, experience, and what makes you unique. Describe your approach to work, specializations, and the value you bring to clients..."
            rows={6}
            className={errors.professionalOverview && touched.professionalOverview ? 'border-red-500' : ''}
          />
          {errors.professionalOverview && touched.professionalOverview && (
            <p className="text-sm text-red-600 mt-1">{errors.professionalOverview}</p>
          )}

          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Tips for a great overview:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Highlight your key skills and specializations</li>
              <li>• Mention years of experience and notable achievements</li>
              <li>• Explain your work approach and communication style</li>
              <li>• Include what types of projects you enjoy most</li>
            </ul>
          </div>
        </div>
      </Card>

      <NavigationButtons
        onNext={handleContinue}
        onBack={handleBack}
        nextLabel="Continue"
        backLabel="Back"
        nextDisabled={isLoading}
        loading={isLoading}
      />
    </div>
  );
};

export default ProfessionalStep;