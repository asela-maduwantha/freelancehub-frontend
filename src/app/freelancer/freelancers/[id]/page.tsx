'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  MessageSquare,
  Heart,
  Award,
  Briefcase,
  Calendar,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Eye,
  ThumbsUp,
  Share2,
  Flag,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface FreelancerProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  experience: 'entry' | 'intermediate' | 'expert';
  location?: string;
  timezone?: string;
  languages: string[];
  availability: 'available' | 'busy' | 'unavailable';
  joinDate: string;
  lastActive: string;
  verified: boolean;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  stats: {
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
    responseTime: string;
    successRate: number;
    clientRetention: number;
  };
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    imageUrl?: string;
    projectUrl?: string;
    completedAt: string;
  }>;
  reviews: Array<{
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    projectTitle: string;
    createdAt: string;
  }>;
}

export default function FreelancerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (params?.id) {
      loadFreelancerProfile(params.id as string);
    }
  }, [params?.id]);

  const loadFreelancerProfile = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      const mockProfile: FreelancerProfile = {
        id: id,
        firstName: 'Alex',
        lastName: 'Thompson',
        username: 'alexthompson',
        email: 'alex.thompson@example.com',
        title: 'Senior Full Stack Developer & DevOps Engineer',
        bio: 'Experienced full-stack developer with 7+ years of expertise in building scalable web applications. Specialized in React, Node.js, AWS, and modern DevOps practices. Passionate about clean code, performance optimization, and delivering exceptional user experiences.',
        skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'Next.js'],
        hourlyRate: 85,
        experience: 'expert',
        location: 'Seattle, WA',
        timezone: 'PST (UTC-8)',
        languages: ['English (Native)', 'Spanish (Fluent)', 'French (Conversational)'],
        availability: 'available',
        joinDate: '2021-03-15T00:00:00Z',
        lastActive: '2024-01-16T10:30:00Z',
        verified: true,
        socialLinks: {
          github: 'https://github.com/alexthompson',
          linkedin: 'https://linkedin.com/in/alexthompson',
          website: 'https://alexthompson.dev'
        },
        stats: {
          completedProjects: 73,
          totalEarnings: 245000,
          averageRating: 4.9,
          responseTime: '< 1 hour',
          successRate: 99,
          clientRetention: 87
        },
        portfolio: [
          {
            id: '1',
            title: 'E-commerce Platform',
            description: 'Modern e-commerce solution with React, Node.js, and AWS. Features include real-time inventory, payment processing, and admin dashboard.',
            technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Stripe'],
            imageUrl: '/portfolio/ecommerce-platform.jpg',
            projectUrl: 'https://demo-ecommerce.alexthompson.dev',
            completedAt: '2024-01-10T00:00:00Z'
          },
          {
            id: '2',
            title: 'Task Management SaaS',
            description: 'Collaborative task management tool with real-time updates, team workspaces, and advanced reporting features.',
            technologies: ['Next.js', 'TypeScript', 'Prisma', 'WebSockets'],
            imageUrl: '/portfolio/task-management.jpg',
            projectUrl: 'https://taskflow.alexthompson.dev',
            completedAt: '2023-12-20T00:00:00Z'
          },
          {
            id: '3',
            title: 'FinTech Dashboard',
            description: 'Financial analytics dashboard with real-time data visualization, portfolio tracking, and risk assessment tools.',
            technologies: ['React', 'D3.js', 'Python', 'FastAPI', 'Redis'],
            imageUrl: '/portfolio/fintech-dashboard.jpg',
            completedAt: '2023-11-15T00:00:00Z'
          }
        ],
        reviews: [
          {
            id: '1',
            clientName: 'Sarah Williams',
            rating: 5,
            comment: 'Exceptional developer! Alex delivered our e-commerce platform ahead of schedule with outstanding quality. Communication was excellent throughout the project.',
            projectTitle: 'E-commerce Platform Development',
            createdAt: '2024-01-12T00:00:00Z'
          },
          {
            id: '2',
            clientName: 'Michael Chen',
            rating: 5,
            comment: 'Alex transformed our ideas into a beautiful, functional application. His technical expertise and attention to detail are remarkable.',
            projectTitle: 'Task Management SaaS',
            createdAt: '2023-12-22T00:00:00Z'
          },
          {
            id: '3',
            clientName: 'Emily Rodriguez',
            rating: 4,
            comment: 'Great work on our financial dashboard. Alex was professional, responsive, and delivered exactly what we needed.',
            projectTitle: 'FinTech Dashboard',
            createdAt: '2023-11-18T00:00:00Z'
          }
        ]
      };

      setFreelancer(mockProfile);

    } catch (error) {
      console.error('Failed to load freelancer profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Implementation for sending message
    alert('Message functionality would be implemented here');
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // API call to follow/unfollow
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${freelancer?.firstName} ${freelancer?.lastName} - Freelancer Profile`,
        text: freelancer?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Freelancer not found</h2>
          <p className="text-gray-600 mb-6">The freelancer profile you're looking for doesn't exist.</p>
          <Link href="/freelancer/freelancers">
            <Button>Browse Freelancers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {freelancer.firstName[0]}{freelancer.lastName[0]}
                </div>
                
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {freelancer.firstName} {freelancer.lastName}
                  </h2>
                  {freelancer.verified && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">@{freelancer.username}</p>
                <p className="text-blue-600 font-medium mb-4">{freelancer.title}</p>

                <div className="flex items-center justify-center mb-4">
                  {renderStars(Math.round(freelancer.stats.averageRating))}
                  <span className="text-sm font-medium ml-2">{freelancer.stats.averageRating}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({freelancer.stats.completedProjects} projects)
                  </span>
                </div>

                <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{freelancer.location}</span>
                </div>

                <div className="flex items-center justify-center text-lg font-bold text-green-600 mb-4">
                  <DollarSign className="h-5 w-5" />
                  <span>{freelancer.hourlyRate}</span>
                  <span className="text-sm text-gray-600 ml-1">/hour</span>
                </div>

                {/* Availability Status */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${
                  freelancer.availability === 'available' ? 'bg-green-100 text-green-800' :
                  freelancer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    freelancer.availability === 'available' ? 'bg-green-500' :
                    freelancer.availability === 'busy' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  {freelancer.availability === 'available' ? 'Available for work' :
                   freelancer.availability === 'busy' ? 'Busy' : 'Unavailable'}
                </span>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleSendMessage}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleFollow}
                      className="flex-1"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-semibold">{formatCurrency(freelancer.stats.totalEarnings)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold">{freelancer.stats.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{freelancer.stats.responseTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client Retention</span>
                  <span className="font-semibold">{freelancer.stats.clientRetention}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{formatDate(freelancer.joinDate)}</span>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            {Object.keys(freelancer.socialLinks).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex space-x-3">
                  {freelancer.socialLinks.github && (
                    <a 
                      href={freelancer.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Github className="h-5 w-5 text-gray-700" />
                    </a>
                  )}
                  {freelancer.socialLinks.linkedin && (
                    <a 
                      href={freelancer.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    </a>
                  )}
                  {freelancer.socialLinks.website && (
                    <a 
                      href={freelancer.socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-green-700" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'portfolio', label: 'Portfolio' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Bio */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">{freelancer.bio}</p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {freelancer.skills.map((skill) => (
                          <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience Level</h3>
                      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                        freelancer.experience === 'expert' ? 'bg-purple-100 text-purple-800' :
                        freelancer.experience === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <Award className="h-4 w-4 mr-2" />
                        {freelancer.experience === 'expert' ? 'Expert Level' :
                         freelancer.experience === 'intermediate' ? 'Intermediate Level' :
                         'Entry Level'}
                      </span>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                      <div className="space-y-2">
                        {freelancer.languages.map((language) => (
                          <span key={language} className="inline-block text-sm text-gray-700 mr-4">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'portfolio' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Portfolio Projects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {freelancer.portfolio.map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-gray-600 mb-4">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.map((tech) => (
                              <span key={tech} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{formatDate(project.completedAt)}</span>
                            {project.projectUrl && (
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 font-medium"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Client Reviews</h3>
                    <div className="space-y-6">
                      {freelancer.reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                {review.clientName[0]}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                                <p className="text-sm text-gray-600">{review.projectTitle}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {renderStars(review.rating)}
                              <p className="text-sm text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
