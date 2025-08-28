'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Star, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  DollarSign,
  ArrowLeft,
  Edit,
  Award,
  FileText,
  ExternalLink,
  Calendar
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

export default function ProfilePreview() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/freelancer/profile"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Profile</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Profile Preview</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">This is how clients see your profile</span>
              <Link
                href="/freelancer/profile/edit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                {user.profile?.title && (
                  <p className="text-xl text-blue-100 mb-2">{user.profile.title}</p>
                )}
                <p className="text-blue-100">@{user.username}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                {user.profile?.bio && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-600 leading-relaxed">{user.profile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {user.profile?.skills && user.profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Level */}
                {user.profile?.experience && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Experience Level</h2>
                    <div className="flex items-center space-x-3">
                      <Award className="w-6 h-6 text-yellow-600" />
                      <span className="text-lg font-medium text-gray-700 capitalize">
                        {user.profile.experience} Level
                      </span>
                    </div>
                  </div>
                )}

                {/* Portfolio Placeholder */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Portfolio</h2>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
                      Your portfolio items will appear here. Add some projects to showcase your work!
                    </p>
                    <Link
                      href="/freelancer/profile/portfolio"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Add Portfolio Items</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.phone}</span>
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
                  </div>
                </div>

                {/* Pricing */}
                {user.profile?.hourlyRate && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Pricing</h3>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-900">
                          ${user.profile.hourlyRate}
                        </p>
                        <p className="text-sm text-green-700">per hour</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability */}
                {user.profile?.availability && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Availability</h3>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-lg font-medium text-blue-900 capitalize">
                          {user.profile.availability}
                        </p>
                        <p className="text-sm text-blue-700">
                          {user.profile.availability === 'available' && 'Ready for new projects'}
                          {user.profile.availability === 'part_time' && 'Limited availability'}
                          {user.profile.availability === 'busy' && 'Currently working on projects'}
                          {user.profile.availability === 'unavailable' && 'Not taking new projects'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages */}
                {user.profile?.languages && user.profile.languages.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Languages</h3>
                    <div className="space-y-2">
                      {user.profile.languages.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm text-purple-800">{language}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Completion */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">Profile Completion</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-800">Profile Strength</span>
                      <span className="font-medium text-yellow-900">
                        {(() => {
                          const fields = [
                            user.profile?.title,
                            user.profile?.bio,
                            user.profile?.hourlyRate,
                            user.profile?.skills?.length,
                            user.profile?.availability,
                            user.profile?.experience
                          ];
                          const completed = fields.filter(field => field && field !== '' && field !== 0).length;
                          return Math.round((completed / fields.length) * 100);
                        })()}%
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(() => {
                            const fields = [
                              user.profile?.title,
                              user.profile?.bio,
                              user.profile?.hourlyRate,
                              user.profile?.skills?.length,
                              user.profile?.availability,
                              user.profile?.experience
                            ];
                            const completed = fields.filter(field => field && field !== '' && field !== 0).length;
                            return Math.round((completed / fields.length) * 100);
                          })()}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Complete profiles get more views and proposals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
