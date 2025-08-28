'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Star, 
  Edit, 
  Settings, 
  FileText, 
  Award,
  MapPin,
  Mail,
  Phone,
  Globe,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

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

export default function FreelancerProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const profileCompletion = () => {
    if (!user.profile) return 0;
    
    const fields = [
      user.profile.title,
      user.profile.bio,
      user.profile.hourlyRate,
      user.profile.skills?.length,
      user.profile.availability,
      user.profile.experience
    ];
    
    const completed = fields.filter(field => field && field !== '' && field !== 0).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = profileCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/freelancer/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Profile Completion: {completionPercentage}%
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">@{user.username}</p>
                {user.profile?.title && (
                  <p className="text-blue-600 font-medium mt-2">{user.profile.title}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                  {user.verification?.emailVerified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.phone}</span>
                    {user.verification?.phoneVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {user.location.city}, {user.location.country}
                    </span>
                  </div>
                )}

                {user.profile?.timezone && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.profile.timezone}</span>
                  </div>
                )}

                {user.profile?.hourlyRate && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ${user.profile.hourlyRate}/hr
                    </span>
                  </div>
                )}

                {user.profile?.availability && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">
                      {user.profile.availability}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link
                  href="/freelancer/profile/edit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Profile Management Options */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Update your personal information, contact details, and basic profile settings.
                </p>
                <Link
                  href="/freelancer/profile/edit"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span>Manage Basic Info</span>
                  <Edit className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Professional Profile */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Briefcase className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Professional Profile</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Set your professional title, bio, hourly rate, and experience level.
                </p>
                <Link
                  href="/freelancer/profile/professional"
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <span>Manage Professional Info</span>
                  <Edit className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Skills & Expertise */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Add and manage your skills, certifications, and areas of expertise.
                </p>
                <Link
                  href="/freelancer/profile/skills"
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <span>Manage Skills</span>
                  <Edit className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Portfolio */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Showcase your best work with portfolio items and project examples.
                </p>
                <Link
                  href="/freelancer/profile/portfolio"
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <span>Manage Portfolio</span>
                  <Edit className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Account Settings */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage your account settings, security, and notification preferences.
                </p>
                <Link
                  href="/freelancer/profile/settings"
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  <span>Manage Settings</span>
                  <Edit className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Profile Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Profile Preview</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  See how your profile appears to potential clients and make adjustments.
                </p>
                <Link
                  href="/freelancer/profile/preview"
                  className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  <span>View Preview</span>
                  <Edit className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
