'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';

const availabilityOptions = [
  { value: 'available', label: 'Available', description: 'Ready to take on new projects', icon: '✅' },
  { value: 'busy', label: 'Busy', description: 'Currently working on projects', icon: '⏳' },
  { value: 'unavailable', label: 'Unavailable', description: 'Not available for new work', icon: '❌' },
];

const hoursOptions = [
  { value: 10, label: '10 hours/week' },
  { value: 20, label: '20 hours/week' },
  { value: 30, label: '30 hours/week' },
  { value: 40, label: '40+ hours/week' },
];

export default function AvailabilityStep() {
  const { formData, updateFormData } = useOnboardingStore();

  const handleAvailabilityChange = (field: string, value: string | number) => {
    const currentAvailability = formData.availability || {
      status: '',
      hoursPerWeek: 0,
      workingHours: {
        timezone: 'UTC',
        schedule: {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
        },
      },
    };

    updateFormData({
      availability: {
        ...currentAvailability,
        [field]: value,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Availability Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What's your availability?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availabilityOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAvailabilityChange('status', option.value)}
              className={`p-6 rounded-lg border-2 text-center transition-all ${
                formData.availability?.status === option.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {option.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hours per week */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How many hours per week can you work?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hoursOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAvailabilityChange('hoursPerWeek', option.value)}
              className={`p-3 rounded-lg border transition-colors ${
                formData.availability?.hoursPerWeek === option.value
                  ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What's your timezone?
        </h3>
        <select
          value={formData.availability?.workingHours?.timezone || 'UTC'}
          onChange={(e) => {
            const currentAvailability = formData.availability || {
              status: '',
              hoursPerWeek: 0,
              workingHours: {
                timezone: 'UTC',
                schedule: {
                  monday: null,
                  tuesday: null,
                  wednesday: null,
                  thursday: null,
                  friday: null,
                  saturday: null,
                  sunday: null,
                },
              },
            };
            updateFormData({
              availability: {
                ...currentAvailability,
                workingHours: {
                  ...currentAvailability.workingHours,
                  timezone: e.target.value,
                },
              },
            });
          }}
          className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (US)</option>
          <option value="America/Chicago">Central Time (US)</option>
          <option value="America/Denver">Mountain Time (US)</option>
          <option value="America/Los_Angeles">Pacific Time (US)</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Kolkata">India</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>
    </motion.div>
  );
}
