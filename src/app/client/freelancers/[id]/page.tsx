'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  DollarSign,
  MessageSquare,
  User,
  Briefcase,
  Award,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Mail,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { freelancersService, reviewsService } from '@/lib/api';
import { Review } from '@/lib/types';

interface FreelancerProfile {
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
  email?: string;
  portfolio?: string;
  languages: string[];
  experience: string;
}

export default function FreelancerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const freelancerId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadFreelancerProfile();
      loadFreelancerReviews();
    } else {
      router.push('/login');
    }
  }, [router, freelancerId]);

  const loadFreelancerProfile = async () => {
    try {
      // In a real implementation, this would fetch freelancer profile
      // For now, using mock data
      const mockFreelancer: FreelancerProfile = {
        id: freelancerId,
        firstName: 'John',
        lastName: 'Developer',
        title: 'Full Stack Developer',
        bio: 'Experienced full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. I specialize in building scalable web applications and have worked with startups and enterprises alike.',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
        hourlyRate: 75,
        rating: 4.9,
        totalReviews: 127,
        completedProjects: 89,
        location: {
          country: 'USA',
          city: 'San Francisco'
        },
        availability: 'AVAILABLE',
        memberSince: '2020-03-15T00:00:00Z',
        email: 'john@example.com',
        portfolio: 'https://johndeveloper.dev',
        languages: ['English', 'Spanish'],
        experience: 'Senior Developer with 5+ years of experience'
      };
      setFreelancer(mockFreelancer);
    } catch (error) {
      console.error('Failed to load freelancer profile:', error);
    }
  };

  const loadFreelancerReviews = async () => {
    try {
      const response = await reviewsService.getUserReviews(freelancerId, { reviewType: 'freelancer' });
      setReviews((response as any).data || []);
    } catch (error) {
      console.error('Failed to load freelancer reviews:', error);
      // Mock reviews for demonstration
      const mockReviews: Review[] = [
        {
          id: '1',
          reviewerId: 'client-1',
          revieweeId: freelancerId,
          projectId: 'project-1',
          rating: 5,
          review: 'John was excellent to work with! He delivered the project on time and exceeded our expectations. Great communication throughout the project.',
          reviewType: 'freelancer',
          createdAt: '2024-01-25T00:00:00Z',
          reviewer: {
            id: 'client-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            avatar: '/user.jpg'
          },
          project: {
            id: 'project-1',
            title: 'E-commerce Website'
          }
        },
        {
          id: '2',
          reviewerId: 'client-2',
          revieweeId: freelancerId,
          projectId: 'project-2',
          rating: 5,
          review: 'Professional and skilled developer. The code quality was outstanding and he was very responsive to feedback.',
          reviewType: 'freelancer',
          createdAt: '2024-01-20T00:00:00Z',
          reviewer: {
            id: 'client-2',
            firstName: 'Mike',
            lastName: 'Chen',
            avatar: '/user.jpg'
          },
          project: {
            id: 'project-2',
            title: 'Mobile App Backend'
          }
        },
        {
          id: '3',
          reviewerId: 'client-3',
          revieweeId: freelancerId,
          projectId: 'project-3',
          rating: 4,
          review: 'Good work overall. There were some minor delays but the final product was solid. Would work with again.',
          reviewType: 'freelancer',
          createdAt: '2024-01-15T00:00:00Z',
          reviewer: {
            id: 'client-3',
            firstName: 'Emma',
            lastName: 'Davis',
            avatar: '/user.jpg'
          },
          project: {
            id: 'project-3',
            title: 'API Development'
          }
        }
      ];
      setReviews(mockReviews);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactFreelancer = () => {
    // In a real implementation, this would open a messaging interface
    alert('Messaging functionality would open here');
  };

  const handleHireFreelancer = () => {
    router.push('/client/projects/new');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'PART_TIME': return 'bg-blue-100 text-blue-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'UNAVAILABLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || isLoading || !freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <Link
              href="/client/freelancers"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Freelancers
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Freelancer Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-gray-500" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                    {freelancer.firstName} {freelancer.lastName}
                  </h1>
                  <p className="text-xl text-green-600 font-medium mt-1">{freelancer.title}</p>

                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium text-gray-900">{freelancer.rating}</span>
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

                  <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-lg font-bold text-gray-900">${freelancer.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{freelancer.completedProjects} projects completed</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>Member since {new Date(freelancer.memberSince).getFullYear()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleContactFreelancer}
                    className="font-inter"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button
                    variant="premium"
                    onClick={handleHireFreelancer}
                    className="font-poppins"
                  >
                    Hire Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors text-center ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors text-center ${
                  activeTab === 'reviews'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({freelancer.totalReviews})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Bio */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">About</h3>
                  <p className="text-gray-600 leading-relaxed">{freelancer.bio}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {freelancer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience & Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Experience</h3>
                    <p className="text-gray-600">{freelancer.experience}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Languages</h3>
                    <div className="space-y-2">
                      {freelancer.languages.map((language, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">{language}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                {(freelancer.email || freelancer.portfolio) && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Contact Information</h3>
                    <div className="space-y-3">
                      {freelancer.email && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">{freelancer.email}</span>
                        </div>
                      )}
                      {freelancer.portfolio && (
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-400 mr-3" />
                          <a
                            href={freelancer.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {freelancer.portfolio}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 font-poppins">
                    Client Reviews
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="text-lg font-bold text-gray-900">{freelancer.rating}</span>
                      <span className="text-gray-600 ml-1">({freelancer.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {displayedReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900">
                                {review.reviewer.firstName} {review.reviewer.lastName}
                              </span>
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-3">{review.review}</p>

                          <div className="flex items-center text-sm text-gray-500">
                            <Briefcase className="h-4 w-4 mr-1" />
                            <span>Project: {review.project.title}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Show More/Less Button */}
                {reviews.length > 3 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="font-inter"
                    >
                      {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
