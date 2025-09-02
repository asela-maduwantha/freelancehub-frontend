'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Calendar,
  User,
  Award,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import AppLayout from '@/components/layout/AppLayout';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
    type: 'client' | 'freelancer';
  };
  reviewee: {
    id: string;
    name: string;
    avatar?: string;
    type: 'client' | 'freelancer';
  };
  contract: {
    id: string;
    projectTitle: string;
    amount: number;
  };
  createdAt: string;
  isReceived: boolean; // true if this user received the review, false if they gave it
}

interface ReviewStats {
  totalReceived: number;
  totalGiven: number;
  averageReceived: number;
  averageGiven: number;
  ratingsBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface Filters {
  type: 'all' | 'received' | 'given';
  rating: string;
  search: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    rating: '',
    search: ''
  });

  useEffect(() => {
    loadReviews();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data - replace with actual API calls
      const mockReviews: Review[] = [
        {
          id: '1',
          rating: 5,
          comment: 'Excellent work! Sarah delivered the project on time and exceeded our expectations. Her attention to detail and communication skills are outstanding.',
          reviewer: {
            id: 'client1',
            name: 'John Smith',
            type: 'client'
          },
          reviewee: {
            id: 'freelancer1',
            name: 'Sarah Johnson',
            type: 'freelancer'
          },
          contract: {
            id: 'contract1',
            projectTitle: 'E-commerce Website Development',
            amount: 250000
          },
          createdAt: '2024-01-15T10:30:00Z',
          isReceived: true
        },
        {
          id: '2',
          rating: 4,
          comment: 'Great client to work with. Clear requirements and prompt payments. Would definitely work with again!',
          reviewer: {
            id: 'freelancer1',
            name: 'Sarah Johnson',
            type: 'freelancer'
          },
          reviewee: {
            id: 'client2',
            name: 'Jane Doe',
            type: 'client'
          },
          contract: {
            id: 'contract2',
            projectTitle: 'Mobile App UI/UX Design',
            amount: 180000
          },
          createdAt: '2024-01-10T14:15:00Z',
          isReceived: false
        },
        {
          id: '3',
          rating: 5,
          comment: 'Professional, skilled, and reliable. Sarah completed the project ahead of schedule with exceptional quality.',
          reviewer: {
            id: 'client3',
            name: 'Mike Johnson',
            type: 'client'
          },
          reviewee: {
            id: 'freelancer1',
            name: 'Sarah Johnson',
            type: 'freelancer'
          },
          contract: {
            id: 'contract3',
            projectTitle: 'Content Management System',
            amount: 320000
          },
          createdAt: '2024-01-05T09:20:00Z',
          isReceived: true
        }
      ];

      const mockStats: ReviewStats = {
        totalReceived: 15,
        totalGiven: 8,
        averageReceived: 4.8,
        averageGiven: 4.2,
        ratingsBreakdown: {
          5: 12,
          4: 2,
          3: 1,
          2: 0,
          1: 0
        }
      };

      // Apply filters
      let filteredReviews = mockReviews;
      if (filters.type !== 'all') {
        filteredReviews = filteredReviews.filter(r => 
          filters.type === 'received' ? r.isReceived : !r.isReceived
        );
      }
      if (filters.rating) {
        filteredReviews = filteredReviews.filter(r => r.rating === parseInt(filters.rating));
      }
      if (filters.search) {
        filteredReviews = filteredReviews.filter(r => 
          r.comment.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.contract.projectTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
          (r.isReceived ? r.reviewer.name : r.reviewee.name).toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setReviews(filteredReviews);
      setStats(mockStats);

    } catch (error) {
      console.error('Failed to load reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'rating' as keyof Review,
      title: 'Rating',
      render: (value: number) => renderStars(value)
    },
    {
      key: 'comment' as keyof Review,
      title: 'Review',
      render: (value: string, review: Review) => (
        <div>
          <p className="text-gray-900 mb-2 line-clamp-2">{value}</p>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>
              {review.isReceived ? `From ${review.reviewer.name}` : `To ${review.reviewee.name}`}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'contract' as keyof Review,
      title: 'Project',
      render: (value: any) => (
        <div>
          <Link href={`/freelancer/contracts/${value.id}`}>
            <p className="font-medium text-gray-900 hover:text-green-600 transition-colors">
              {value.projectTitle}
            </p>
          </Link>
          <p className="text-sm text-gray-600">{formatCurrency(value.amount)}</p>
        </div>
      )
    },
    {
      key: 'isReceived' as keyof Review,
      title: 'Type',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value ? 'Received' : 'Given'}
        </span>
      )
    },
    {
      key: 'createdAt' as keyof Review,
      title: 'Date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(value)}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (review: Review) => {
        router.push(`/freelancer/reviews/${review.id}`);
      },
      icon: Eye
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
              Reviews & Feedback
            </h1>
            <p className="text-gray-600 font-inter">
              Manage your reviews and track your reputation
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Link href="/freelancer/reviews/leave">
              <Button variant="premium" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Leave Review</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviews Received</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReceived}</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900 mr-2">{stats.averageReceived}</p>
                    <div className="flex">
                      {renderStars(Math.round(stats.averageReceived))}
                    </div>
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviews Given</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGiven}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ratingsBreakdown[5]}</p>
                </div>
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium mr-2">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.totalReceived > 0 ? (stats.ratingsBreakdown[rating as keyof typeof stats.ratingsBreakdown] / stats.totalReceived) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {stats.ratingsBreakdown[rating as keyof typeof stats.ratingsBreakdown]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              <option value="all">All Reviews</option>
              <option value="received">Reviews Received</option>
              <option value="given">Reviews Given</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <DataTable
          data={reviews}
          columns={columns}
          loading={isLoading}
          emptyTitle="No reviews found"
          emptyDescription="You haven't received or given any reviews yet. Complete projects to start building your reputation."
          emptyIcon={Star}
          actions={actions}
          onRowClick={(review) => router.push(`/freelancer/reviews/${review.id}`)}
          rowClassName={(review) => 
            review.isReceived ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }
        />

        {/* Recent Reviews Highlights */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Highlights</h3>
          <div className="space-y-4">
            {reviews.filter(r => r.isReceived && r.rating >= 4).slice(0, 3).map((review) => (
              <div key={review.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {review.reviewer.name[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{review.reviewer.name}</h4>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 text-sm mb-2">"{review.comment}"</p>
                  <p className="text-xs text-gray-500">
                    {review.contract.projectTitle} • {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
