'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function ReviewStep() {
  const { formData } = useOnboardingStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Review Your Profile
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please review all the information below before submitting your freelancer profile.
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Professional Title</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.professionalTitle || 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Experience Level</span>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {formData.experienceLevel || 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Hourly Rate</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.hourlyRate ? formatPrice(formData.hourlyRate) + '/hour' : 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Availability</span>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {formData.availability?.status || 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Public Profile URL</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.publicProfileUrl ? `freelancehub.com/freelancer/${formData.publicProfileUrl}` : 'Not specified'}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
          <p className="text-gray-900 dark:text-white mt-1">
            {formData.description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Skills & Categories */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Skills & Categories</h4>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Skills ({formData.skills?.length || 0})</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900/20 dark:text-green-200"
                >
                  {skill}
                </span>
              )) || <p className="text-gray-500">No skills selected</p>}
            </div>
          </div>
          
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Project Categories ({formData.categories?.length || 0})</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories?.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900/20 dark:text-blue-200"
                >
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )) || <p className="text-gray-500">No categories selected</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Country</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.location?.country || 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">City</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.location?.city || 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Province/State</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.location?.province || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      {formData.portfolio && formData.portfolio.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Portfolio ({formData.portfolio.length} items)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.portfolio.map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {formData.education && formData.education.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Education ({formData.education.length})
          </h4>
          <div className="space-y-3">
            {formData.education.map((edu, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  {edu.degree} in {edu.field}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {edu.institution} • {edu.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {formData.certifications && formData.certifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Certifications ({formData.certifications.length})
          </h4>
          <div className="space-y-3">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  {cert.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cert.issuer} • {cert.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {formData.languages && formData.languages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Languages ({formData.languages.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  {lang.language}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {lang.proficiency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      >
        <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">🎉 Ready to launch!</h4>
        <p className="text-sm text-green-800 dark:text-green-300">
          Your profile looks great! Click "Complete Profile" to create your freelancer account and start finding amazing projects.
        </p>
      </motion.div>
    </motion.div>
  );
}
