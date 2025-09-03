'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  MessageSquare,
  User,
  Briefcase,
  Award,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { usersService } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  completedProjects: number;
  location: {
    country: string;
    city: string;
  };
  availability: 'AVAILABLE' | 'PART_TIME' | 'BUSY' | 'UNAVAILABLE';
  memberSince: string;
}

interface Filters {
  skills: string[];
  minRate: number;
  maxRate: number;
  minRating: number;
  location: string;
  availability: string;
}

export default function FreelancersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    skills: [],
    minRate: 0,
    maxRate: 200,
    minRating: 0,
    location: '',
    availability: ''
  });

  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'HTML/CSS',
    'UI/UX Design', 'Figma', 'Adobe Photoshop', 'Content Writing',
    'SEO', 'Digital Marketing', 'WordPress', 'Shopify'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadFreelancers();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [freelancers, searchTerm, filters]);

  const loadFreelancers = async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getFreelancers();
      const freelancersData = response.data || response || [];
      
      // Map IUser[] to Freelancer[]
      const mappedFreelancers: Freelancer[] = freelancersData.map((user: any) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        title: user.freelancerProfile?.title || 'Freelancer',
        bio: user.freelancerProfile?.bio || '',
        skills: user.freelancerProfile?.skills || [],
        hourlyRate: user.freelancerProfile?.hourlyRate || 0,
        rating: user.stats?.avgRating || 0,
        totalReviews: user.stats?.projectsCompleted || 0,
        completedProjects: user.stats?.projectsCompleted || 0,
        location: {
          country: user.location?.country || '',
          city: user.location?.city || ''
        },
        availability: (user.freelancerProfile?.availability as 'AVAILABLE' | 'PART_TIME' | 'BUSY' | 'UNAVAILABLE') || 'UNAVAILABLE',
        memberSince: user.createdAt
      }));
      
      setFreelancers(mappedFreelancers);
    } catch (error) {
      console.error('Failed to load freelancers:', error);
      setError('Failed to load freelancers. Please try again.');
      setFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = freelancers;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(freelancer =>
        freelancer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(freelancer =>
        filters.skills.some(skill => freelancer.skills.includes(skill))
      );
    }

    // Rate filter
    filtered = filtered.filter(freelancer =>
      freelancer.hourlyRate >= filters.minRate && freelancer.hourlyRate <= filters.maxRate
    );

    // Rating filter
    filtered = filtered.filter(freelancer =>
      freelancer.rating >= filters.minRating
    );

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(freelancer =>
        freelancer.location.country.toLowerCase().includes(filters.location.toLowerCase()) ||
        freelancer.location.city.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(freelancer =>
        freelancer.availability === filters.availability
      );
    }

    setFilteredFreelancers(filtered);
  };

  const handleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleContactFreelancer = (freelancerId: string) => {
    router.push(`/client/messages?freelancer=${freelancerId}`);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'PART_TIME': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Freelancers</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadFreelancers} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
            Find Freelancers
          </h1>
          <p className="text-gray-600 font-inter">
            Browse through thousands of talented freelancers ready to work on your projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search freelancers by name, skills, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter text-lg"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="px-6 py-4 font-inter border-2 hover:border-green-300"
              >
                <Filter className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <span className="ml-2 text-sm text-gray-500">
                  ({Object.values(filters).filter(v => v !== '' && v !== 0 && (!Array.isArray(v) || v.length > 0)).length} active)
                </span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Skills */}
                <div className="md:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {popularSkills.slice(0, 8).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleSkillFilter(skill)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          filters.skills.includes(skill)
                            ? 'bg-green-100 border-green-500 text-green-700 shadow-sm'
                            : 'border-gray-300 text-gray-600 hover:border-green-400 hover:bg-green-50'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {filters.skills.length > 0 && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, skills: [] }))}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear all skills
                    </button>
                  )}
                </div>

                {/* Rate Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hourly Rate ($)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Minimum</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minRate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minRate: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Maximum</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxRate: parseInt(e.target.value) || 200 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.0}>4.0+ Stars</option>
                    <option value={3.5}>3.5+ Stars</option>
                    <option value={3.0}>3.0+ Stars</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any Availability</option>
                    <option value="AVAILABLE">Available Now</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="BUSY">Busy</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      skills: [],
                      minRate: 0,
                      maxRate: 200,
                      minRating: 0,
                      location: '',
                      availability: ''
                    });
                  }}
                  className="px-6"
                >
                  Reset All Filters
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Freelancers List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((freelancer) => (
                  <motion.div
                    key={freelancer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                              {freelancer.firstName} {freelancer.lastName}
                            </h3>
                            <p className="text-green-600 font-medium">{freelancer.title}</p>

                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span>{freelancer.rating}</span>
                                <span className="ml-1">({freelancer.totalReviews} reviews)</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{freelancer.location.city}, {freelancer.location.country}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(freelancer.availability)}`}>
                                  {freelancer.availability.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 font-poppins">
                              ${freelancer.hourlyRate}
                            </div>
                            <div className="text-sm text-gray-500">per hour</div>
                          </div>
                        </div>

                        <p className="text-gray-600 mt-3 line-clamp-2">
                          {freelancer.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {freelancer.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancer.skills.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              +{freelancer.skills.length - 4} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              <span>{freelancer.completedProjects} projects</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              <span>Member since {new Date(freelancer.memberSince).getFullYear()}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContactFreelancer(freelancer.id)}
                              className="font-inter"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-inter"
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Reviews
                            </Button>
                            <Link href={`/client/freelancers/${freelancer.id}`}>
                              <Button variant="premium" size="sm" className="font-inter">
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        skills: [],
                        minRate: 0,
                        maxRate: 200,
                        minRating: 0,
                        location: '',
                        availability: ''
                      });
                    }}
                    variant="outline"
                    className="font-inter"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">
                Platform Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Freelancers</span>
                  <span className="font-semibold text-gray-900">50,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active This Month</span>
                  <span className="font-semibold text-gray-900">25,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold text-gray-900">2 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">98%</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">
                💡 Pro Tips
              </h3>
              <ul className="space-y-3 text-sm text-green-700">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Check freelancer portfolios and reviews before hiring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Start with small projects to test working relationships</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Be clear about project requirements and deadlines</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Use contracts to protect both parties</span>
                </li>
              </ul>
            </div>

            {/* Create Project CTA */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2 font-poppins">
                Ready to Hire?
              </h3>
              <p className="text-green-100 mb-4 text-sm">
                Post your project and receive proposals from qualified freelancers
              </p>
              <Link href="/client/projects/new">
                <Button variant="secondary" className="w-full font-inter">
                  Post a Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
