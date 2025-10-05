'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { clientOnboardingActions } from '@/store/slices/clientOnboarding';
import { RootState } from '@/store';
import { ClientOnboardingFormData } from '@/types/clientOnboarding';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

const Step3Preferences: React.FC<Step3Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.clientOnboarding);

  const [formData, setFormData] = useState<Pick<ClientOnboardingFormData, 'workTypes' | 'budgetRange' | 'hiringFrequency' | 'contactMethod' | 'timezone' | 'emailNotifications'>>({
    workTypes: [],
    budgetRange: '',
    hiringFrequency: '',
    contactMethod: '',
    timezone: '',
    emailNotifications: {
      newProposals: true,
      messages: true,
      milestones: true,
      payments: true,
      weeklySummary: true,
      marketing: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load existing data if available
    if (progress?.formData) {
      setFormData({
        workTypes: progress.formData.workTypes || [],
        budgetRange: progress.formData.budgetRange || '',
        hiringFrequency: progress.formData.hiringFrequency || '',
        contactMethod: progress.formData.contactMethod || '',
        timezone: progress.formData.timezone || '',
        emailNotifications: progress.formData.emailNotifications || {
          newProposals: true,
          messages: true,
          milestones: true,
          payments: true,
          weeklySummary: true,
          marketing: false,
        },
      });
    }
  }, [progress]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.workTypes.length === 0) {
      newErrors.workTypes = 'Please select at least one work type';
    }

    if (!formData.budgetRange) {
      newErrors.budgetRange = 'Please select your typical budget range';
    }

    if (!formData.hiringFrequency) {
      newErrors.hiringFrequency = 'Please select your hiring frequency';
    }

    if (!formData.contactMethod) {
      newErrors.contactMethod = 'Please select your preferred contact method';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Please select your timezone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      workTypes: checked
        ? [...prev.workTypes, workType]
        : prev.workTypes.filter(type => type !== workType),
    }));
    if (errors.workTypes) {
      setErrors(prev => ({ ...prev, workTypes: '' }));
    }
  };

  const handleInputChange = (field: keyof Pick<ClientOnboardingFormData, 'workTypes' | 'budgetRange' | 'hiringFrequency' | 'contactMethod' | 'timezone'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNotificationChange = (notificationType: keyof ClientOnboardingFormData['emailNotifications'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [notificationType]: checked,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Update Redux state
    dispatch(clientOnboardingActions.updateStep(3, formData));

    // Mark step as completed
    dispatch(clientOnboardingActions.completeStep(3));

    // Proceed to completion
    onNext();
  };

  const workTypeOptions = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Data Analysis',
    'Project Management',
    'Consulting',
    'Other',
  ];

  const budgetRangeOptions = [
    { value: 'under-1k', label: 'Under $1,000' },
    { value: '1k-5k', label: '$1,000 - $5,000' },
    { value: '5k-10k', label: '$5,000 - $10,000' },
    { value: '10k-25k', label: '$10,000 - $25,000' },
    { value: '25k-50k', label: '$25,000 - $50,000' },
    { value: 'over-50k', label: 'Over $50,000' },
  ];

  const hiringFrequencyOptions = [
    { value: 'one-time', label: 'One-time projects only' },
    { value: 'monthly', label: '1-2 projects per month' },
    { value: 'quarterly', label: '3-5 projects per quarter' },
    { value: 'ongoing', label: 'Ongoing work with multiple freelancers' },
  ];

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'chat', label: 'In-app chat' },
    { value: 'video', label: 'Video calls' },
    { value: 'phone', label: 'Phone calls' },
  ];

  const timezoneOptions = [
    'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
    'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
    'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
    'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00',
    'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00',
  ];

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences & Interests</h2>
        <p className="text-gray-600">
          Tell us about your work preferences to help us match you with the right freelancers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Work Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What types of work do you need? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {workTypeOptions.map((workType) => (
              <label key={workType} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.workTypes.includes(workType)}
                  onChange={(e) => handleWorkTypeChange(workType, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{workType}</span>
              </label>
            ))}
          </div>
          {errors.workTypes && <p className="mt-2 text-sm text-red-600">{errors.workTypes}</p>}
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What's your typical project budget? <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.budgetRange}
            onChange={(e) => handleInputChange('budgetRange', e.target.value)}
            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.budgetRange ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select budget range</option>
            {budgetRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.budgetRange && <p className="mt-2 text-sm text-red-600">{errors.budgetRange}</p>}
        </div>

        {/* Hiring Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How often do you hire freelancers? <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.hiringFrequency}
            onChange={(e) => handleInputChange('hiringFrequency', e.target.value)}
            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.hiringFrequency ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select hiring frequency</option>
            {hiringFrequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.hiringFrequency && <p className="mt-2 text-sm text-red-600">{errors.hiringFrequency}</p>}
        </div>

        {/* Contact Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred contact method <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {contactMethodOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="contactMethod"
                  value={option.value}
                  checked={formData.contactMethod === option.value}
                  onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.contactMethod && <p className="mt-2 text-sm text-red-600">{errors.contactMethod}</p>}
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your timezone <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.timezone ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select timezone</option>
            {timezoneOptions.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
          {errors.timezone && <p className="mt-2 text-sm text-red-600">{errors.timezone}</p>}
        </div>

        {/* Email Notifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Email notification preferences
          </label>
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            {[
              { key: 'newProposals', label: 'New proposals on my jobs', default: true },
              { key: 'messages', label: 'Messages from freelancers', default: true },
              { key: 'milestones', label: 'Milestone updates and completions', default: true },
              { key: 'payments', label: 'Payment confirmations and receipts', default: true },
              { key: 'weeklySummary', label: 'Weekly summary of activity', default: true },
              { key: 'marketing', label: 'Marketing and promotional emails', default: false },
            ].map((notification) => (
              <label key={notification.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{notification.label}</span>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications[notification.key as keyof ClientOnboardingFormData['emailNotifications']]}
                  onChange={(e) => handleNotificationChange(
                    notification.key as keyof ClientOnboardingFormData['emailNotifications'],
                    e.target.checked
                  )}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You can change these preferences anytime in your account settings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default Step3Preferences;