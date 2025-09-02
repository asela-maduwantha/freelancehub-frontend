'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Award,
  MessageSquare,
  Eye,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { freelancerAPI, authService } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profile?: {
    title?: string;
    bio?: string;
    hourlyRate?: number;
    skills?: string[];
    experience?: string;
    availability?: string;
    languages?: string[];
    timezone?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  stats?: {
    completedProjects?: number;
    averageRating?: number;
    totalReviews?: number;
    responseTime?: string;
  };
  createdAt: string;
}

export default function BrowseFreelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    experience: '',
    minRate: '',
    maxRate: '',
    availability: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login';
      return;
    }
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await freelancerAPI.getFreelancers({
        limit: 50,
        excludeCurrentUser: true // Don't show current user in results
      });

      // Mock data for demonstration since API might not return all fields
      const mockFreelancers: Freelancer[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          username: 'sarahdev',
          email: 'sarah@example.com',
          profile: {
            title: 'Full Stack Developer',
            bio: 'Experienced full-stack developer with 5+ years in React, Node.js, and cloud technologies.',
            hourlyRate: 75,
            skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
            experience: 'expert',
            availability: 'AVAILABLE',
            languages: ['English', 'Spanish'],
            timezone: 'America/New_York'
          },
          location: {
            country: 'USA',
            city: 'New York'
          },
          verification: {
            emailVerified: true,
            phoneVerified: true
          },
          stats: {
            completedProjects: 45,
            averageRating: 4.8,
            totalReviews: 23,
            responseTime: '< 2 hours'
          },
          createdAt: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          firstName: 'Michael',
          lastName: 'Chen',
          username: 'mikeui',
          email: 'michael@example.com',
          profile: {
            title: 'UI/UX Designer',
            bio: 'Creative UI/UX designer specializing in mobile and web applications with a focus on user-centered design.',
            hourlyRate: 65,
            skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
            experience: 'intermediate',
            availability: 'PART_TIME',
            languages: ['English', 'Mandarin'],
            timezone: 'Asia/Shanghai'
          },
          location: {
            country: 'China',
            city: 'Shanghai'
          },
          verification: {
            emailVerified: true,
            phoneVerified: false
          },
          stats: {
            completedProjects: 32,
            averageRating: 4.6,
            totalReviews: 18,
            responseTime: '< 4 hours'
          },
          createdAt: '2023-03-20T00:00:00Z'
        },
        {
          id: '3',
          firstName: 'Emma',
          lastName: 'Davis',
          username: 'emmacontent',
          email: 'emma@example.com',
          profile: {
            title: 'Content Writer & SEO Specialist',
            bio: 'Professional content writer with expertise in SEO, copywriting, and digital marketing strategies.',
            hourlyRate: 45,
            skills: ['SEO', 'Content Writing', 'Copywriting', 'WordPress', 'Google Analytics'],
            experience: 'intermediate',
            availability: 'AVAILABLE',
            languages: ['English'],
            timezone: 'Europe/London'
          },
          location: {
            country: 'UK',
            city: 'London'
          },
          verification: {
            emailVerified: true,
            phoneVerified: true
          },
          stats: {
            completedProjects: 67,
            averageRating: 4.9,
            totalReviews: 31,
            responseTime: '< 1 hour'
          },
          createdAt: '2022-11-10T00:00:00Z'
        }
      ];

      setFreelancers(mockFreelancers);
      setFilteredFreelancers(mockFreelancers);
    } catch (error) {
      console.error('Failed to load freelancers:', error);
      setError('Failed to load freelancers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = freelancers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(freelancer =>
        freelancer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.profile?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.profile?.skills?.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Skills filter
    if (filters.skills) {
      filtered = filtered.filter(freelancer =>
        freelancer.profile?.skills?.some(skill =>
          skill.toLowerCase().includes(filters.skills.toLowerCase())
        )
      );
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter(freelancer =>
        freelancer.profile?.experience === filters.experience
      );
    }

    // Rate filters
    if (filters.minRate) {
      filtered = filtered.filter(freelancer =>
        freelancer.profile?.hourlyRate && freelancer.profile.hourlyRate >= parseInt(filters.minRate)
      );
    }
    if (filters.maxRate) {
      filtered = filtered.filter(freelancer =>
        freelancer.profile?.hourlyRate && freelancer.profile.hourlyRate <= parseInt(filters.maxRate)
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(freelancer =>
        freelancer.profile?.availability === filters.availability
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(freelancer =>
        freelancer.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        freelancer.location?.country?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredFreelancers(filtered);
  }, [freelancers, searchTerm, filters]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getExperienceLevel = (experience: string) => {
    switch (experience) {
      case 'beginner': return 'Beginner (0-2 years)';
      case 'intermediate': return 'Intermediate (2-5 years)';
      case 'expert': return 'Expert (5+ years)';
      default: return experience;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100';
      case 'PART_TIME': return 'text-blue-600 bg-blue-100';
      case 'BUSY': return 'text-yellow-600 bg-yellow-100';
      case 'UNAVAILABLE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Freelancers</h1>
          <p className="text-gray-600">Connect with other freelancers for collaboration and networking</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search freelancers by name, skills, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., React, Python"
                    value={filters.skills}
                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Hourly Rate
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minRate}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Hourly Rate
                  </label>
                  <input
                    type="number"
                    placeholder="200"
                    value={filters.maxRate}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="BUSY">Busy</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City or Country"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredFreelancers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFreelancers.map((freelancer, index) => (
                  <motion.div
                    key={freelancer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        {freelancer.firstName && freelancer.lastName ? (
                          <span className="text-xl font-semibold text-gray-600">
                            {freelancer.firstName[0]}{freelancer.lastName[0]}
                          </span>
                        ) : (
                          <User className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {freelancer.firstName} {freelancer.lastName}
                            </h3>
                            <p className="text-gray-600">{freelancer.profile?.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {freelancer.verification?.emailVerified && (
                              <div title="Email Verified">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                            {freelancer.verification?.phoneVerified && (
                              <div title="Phone Verified">
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {freelancer.profile?.bio}
                        </p>

                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          {freelancer.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{freelancer.location.city}, {freelancer.location.country}</span>
                            </div>
                          )}
                          {freelancer.profile?.hourlyRate && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatCurrency(freelancer.profile.hourlyRate)}/hr</span>
                            </div>
                          )}
                          {freelancer.profile?.experience && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>{getExperienceLevel(freelancer.profile.experience)}</span>
                            </div>
                          )}
                        </div>

                        {freelancer.profile?.availability && (
                          <div className="mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(freelancer.profile.availability)}`}>
                              {freelancer.profile.availability.replace('_', ' ')}
                            </span>
                          </div>
                        )}

                        {freelancer.stats && (
                          <div className="flex items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{freelancer.stats.averageRating}</span>
                              <span className="text-gray-600">({freelancer.stats.totalReviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                              <span>{freelancer.stats.completedProjects} projects</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{freelancer.stats.responseTime}</span>
                            </div>
                          </div>
                        )}

                        {freelancer.profile?.skills && freelancer.profile.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {freelancer.profile.skills.slice(0, 4).map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {freelancer.profile.skills.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  +{freelancer.profile.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link
                            href={`/freelancer/freelancers/${freelancer.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View Profile
                          </Link>
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
