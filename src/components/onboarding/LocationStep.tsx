'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { FormInput } from '@/components/forms/FormInput';

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Netherlands',
  'Australia', 'India', 'Philippines', 'Pakistan', 'Bangladesh', 'Nigeria',
  'Ukraine', 'Poland', 'Romania', 'Brazil', 'Mexico', 'Argentina', 'Other'
];

export default function LocationStep() {
  const { formData, updateFormData } = useOnboardingStore();

  const handleLocationChange = (field: string, value: string) => {
    const currentLocation = formData.location || { country: '', city: '', province: '' };
    updateFormData({
      location: {
        ...currentLocation,
        [field]: value,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Where are you located?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This helps clients understand your timezone and local market knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country
          </label>
          <select
            value={formData.location?.country || ''}
            onChange={(e) => handleLocationChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select your country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <FormInput
            label="City"
            placeholder="Enter your city"
            value={formData.location?.city || ''}
            onChange={(e) => handleLocationChange('city', e.target.value)}
          />
        </div>

        {/* Province/State */}
        <div className="md:col-span-2">
          <FormInput
            label="State/Province/Region"
            placeholder="Enter your state, province, or region"
            value={formData.location?.province || ''}
            onChange={(e) => handleLocationChange('province', e.target.value)}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">🌍 Why location matters</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Helps clients find freelancers in their timezone</li>
          <li>• Shows local market knowledge for region-specific projects</li>
          <li>• Enables better communication during overlapping work hours</li>
          <li>• Some clients prefer working with local talent</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
