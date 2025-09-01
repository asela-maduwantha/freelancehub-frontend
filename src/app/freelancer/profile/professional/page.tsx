'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { authAPI, freelancerAPI } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  profile?: {
    bio?: string;
    hourlyRate?: number;
    skills?: string[];
    availability?: string;
    title?: string;
    experience?: string;
    languages?: string[];
    timezone?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  location?: {
    country?: string;
    city?: string;
  };
  phone?: string;
}

interface FormData {
  title: string;
  bio: string;
  hourlyRate: number;
  experience: string;
  availability: string;
  minimumBudget: number;
  currency: string;
}

export default function ProfessionalProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    bio: '',
    hourlyRate: 0,
    experience: '',
    availability: '',
    minimumBudget: 0,
    currency: 'USD'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setFormData({
          title: userData.profile?.title || '',
          bio: userData.profile?.bio || '',
          hourlyRate: userData.profile?.hourlyRate || 0,
          experience: userData.profile?.experience || '',
          availability: userData.profile?.availability || '',
          minimumBudget: 0, // This would come from a separate pricing object
          currency: 'USD'
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        profile: {
          ...user?.profile,
          title: formData.title,
          bio: formData.bio,
          hourlyRate: formData.hourlyRate,
          experience: formData.experience,
          availability: formData.availability
        }
      };

      await freelancerAPI.updateProfile(updateData);
      setSuccess('Professional profile updated successfully!');
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...updateData.profile
          }
        });
      }
    } catch (err: any) {
      console.error('Failed to update professional profile:', err);
      setError(err.message || 'Failed to update professional profile');
    } finally {
      setSaving(false);
    }
  };

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)', description: 'Just starting out in the field' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)', description: 'Some experience with various projects' },
    { value: 'senior', label: 'Senior (5-10 years)', description: 'Extensive experience and expertise' },
    { value: 'expert', label: 'Expert (10+ years)', description: 'Industry expert with deep knowledge' }
  ];

  const availabilityOptions = [
    { value: 'AVAILABLE', label: 'Available', description: 'Ready to take on new projects' },
    { value: 'PART_TIME', label: 'Part-time', description: 'Limited availability for new projects' },
    { value: 'BUSY', label: 'Busy', description: 'Currently working on multiple projects' },
    { value: 'UNAVAILABLE', label: 'Unavailable', description: 'Not taking on new projects' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
    { value: 'INR', label: 'INR (₹)', symbol: '₹' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please log in to edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-6">
            <Link 
              href="/freelancer/profile"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Professional Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Professional Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Senior Full-Stack Developer"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the first thing clients see about you
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/1000 characters
                  </p>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experienceLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          formData.experience === level.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="experience"
                          value={level.value}
                          checked={formData.experience === level.value}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{level.label}</p>
                              <p className="text-gray-500">{level.description}</p>
                            </div>
                          </div>
                          {formData.experience === level.value && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availabilityOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          formData.availability === option.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="availability"
                          value={option.value}
                          checked={formData.availability === option.value}
                          onChange={(e) => handleInputChange('availability', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-gray-500">{option.description}</p>
                            </div>
                          </div>
                          {formData.availability === option.value && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate
                      </label>
                      <div className="relative">
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="absolute left-0 top-0 h-full px-3 py-2 border-r border-gray-300 bg-gray-50 text-sm text-gray-700 rounded-l-lg"
                        >
                          {currencies.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.symbol}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                          className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Your hourly rate for projects
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Budget
                      </label>
                      <div className="relative">
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="absolute left-0 top-0 h-full px-3 py-2 border-r border-gray-300 bg-gray-50 text-sm text-gray-700 rounded-l-lg"
                        >
                          {currencies.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.symbol}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={formData.minimumBudget}
                          onChange={(e) => handleInputChange('minimumBudget', parseFloat(e.target.value) || 0)}
                          className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum project budget you accept
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Professional Profile'}</span>
                </button>
              </form>
            </motion.div>
          </div>

          {/* Tips and Guidelines */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Profile Tips */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Profile Tips</h3>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start space-x-2">
                    <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Keep your title clear and specific to your expertise</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Highlight your unique value proposition in your bio</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <DollarSign className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Set competitive rates based on your experience and market</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Keep your availability status up to date</span>
                  </li>
                </ul>
              </div>

              {/* Market Insights */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">Market Insights</h3>
                <div className="space-y-4 text-sm text-green-800">
                  <div>
                    <p className="font-medium">Average Hourly Rates</p>
                    <p className="text-xs text-green-600 mt-1">
                      Entry Level: $15-30/hr<br />
                      Intermediate: $30-60/hr<br />
                      Senior: $60-120/hr<br />
                      Expert: $120+/hr
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Profile Completion</p>
                    <p className="text-xs text-green-600 mt-1">
                      Complete profiles get 3x more views and 2x more proposals accepted
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-purple-900 mb-4">Next Steps</h3>
                <div className="space-y-3 text-sm text-purple-800">
                  <Link 
                    href="/freelancer/profile/skills"
                    className="flex items-center space-x-2 hover:text-purple-600 transition-colors"
                  >
                    <span>→ Add your skills and expertise</span>
                  </Link>
                  <Link 
                    href="/freelancer/profile/portfolio"
                    className="flex items-center space-x-2 hover:text-purple-600 transition-colors"
                  >
                    <span>→ Create your portfolio</span>
                  </Link>
                  <Link 
                    href="/freelancer/profile/preview"
                    className="flex items-center space-x-2 hover:text-purple-600 transition-colors"
                  >
                    <span>→ Preview your profile</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
