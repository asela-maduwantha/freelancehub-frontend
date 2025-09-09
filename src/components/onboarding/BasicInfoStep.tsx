'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { FormInput } from '@/components/forms/FormInput';

const experienceLevels = [
  { value: 'beginner', label: 'Entry Level', description: '0-2 years of experience' },
  { value: 'intermediate', label: 'Intermediate', description: '2-5 years of experience' },
  { value: 'expert', label: 'Expert', description: '5+ years of experience' },
];

export default function BasicInfoStep() {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    updateFormData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: string, value: string | number) => {
    let error = '';
    
    switch (field) {
      case 'professionalTitle':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          error = 'Professional title must be at least 2 characters';
        }
        break;
      case 'description':
        if (!value || (typeof value === 'string' && value.trim().length < 50)) {
          error = 'Description must be at least 50 characters';
        } else if (typeof value === 'string' && value.length > 2000) {
          error = 'Description must be less than 2000 characters';
        }
        break;
      case 'hourlyRate':
        if (!value || (typeof value === 'number' && value < 5)) {
          error = 'Hourly rate must be at least $5';
        } else if (typeof value === 'number' && value > 500) {
          error = 'Hourly rate seems too high. Please contact support if this is correct.';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Professional Title */}
      <div>
        <FormInput
          label="Professional Title"
          placeholder="e.g., Full Stack Developer, UI/UX Designer, Data Scientist"
          value={formData.professionalTitle || ''}
          onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
          onBlur={(e) => validateField('professionalTitle', e.target.value)}
          error={errors.professionalTitle ? { message: errors.professionalTitle, type: 'manual' } : undefined}
          className="text-lg"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          What's your main area of expertise?
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Professional Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          onBlur={(e) => validateField('description', e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your professional background, key skills, and what makes you unique. This will be the first thing clients see on your profile..."
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tell clients about your experience and what you can offer them.
          </p>
          <span className={`text-sm ${
            (formData.description?.length || 0) < 50 
              ? 'text-red-500' 
              : (formData.description?.length || 0) > 1800 
                ? 'text-orange-500' 
                : 'text-gray-500'
          }`}>
            {formData.description?.length || 0}/2000
          </span>
        </div>
        {errors.description && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Experience Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceLevels.map((level) => (
            <motion.button
              key={level.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInputChange('experienceLevel', level.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.experienceLevel === level.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {level.label}
                </h3>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.experienceLevel === level.value
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {formData.experienceLevel === level.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {level.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div>
        <FormInput
          label="Hourly Rate (USD)"
          type="number"
          min="5"
          max="500"
          placeholder="50"
          value={formData.hourlyRate || ''}
          onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
          onBlur={(e) => validateField('hourlyRate', parseFloat(e.target.value) || 0)}
          error={errors.hourlyRate ? { message: errors.hourlyRate, type: 'manual' } : undefined}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set your standard hourly rate. You can adjust this for specific projects.
        </p>
      </div>

      {/* Public Profile URL */}
      <div>
        <FormInput
          label="Public Profile URL"
          placeholder="e.g., your-name"
          value={formData.publicProfileUrl || ''}
          onChange={(e) => handleInputChange('publicProfileUrl', e.target.value)}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This will be your profile URL: freelancehub.com/freelancer/{formData.publicProfileUrl || 'your-name'}
        </p>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Tips for a great profile</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Use a clear, specific professional title that clients would search for</li>
          <li>• Highlight your unique skills and experience in your description</li>
          <li>• Research market rates for your skills and experience level</li>
          <li>• Be honest about your experience level - it helps match you with suitable projects</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
