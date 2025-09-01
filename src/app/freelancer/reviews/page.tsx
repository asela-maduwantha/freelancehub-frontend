'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Filter,
  Search,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { reviewAPI, authAPI } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  projectId: string;
  rating: number;
  review: string;
  reviewType: 'freelancer' | 'client';
  createdAt: string;
  response?: {
    message: string;
    createdAt: string;
  };
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  project: {
    id: string;
    title: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Review[];
}

export default function FreelancerReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'responded' | 'unresponded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    loadReviews();
  }, [router]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load review stats
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const statsResponse = await reviewAPI.getUserReviewStats(userData.id);
      setStats(statsResponse as ReviewStats);

      // Load reviews
      const reviewsResponse = await reviewAPI.getMyReviews({
        status: filter === 'all' ? undefined : filter,
        limit: 50
      });
      setReviews(reviewsResponse as Review[]);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const handleRespondToReview = async (reviewId: string) => {
    if (!responseText.trim()) {
      alert('Please enter a response.');
      return;
    }

    try {
      await reviewAPI.respondToReview(reviewId, responseText);
      alert('Response submitted successfully!');
      setSelectedReview(null);
      setResponseText('');
      loadReviews(); // Refresh reviews
    } catch (error) {
      console.error('Failed to respond to review:', error);
      alert('Failed to submit response. Please try again.');
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.reviewer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.reviewer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">View and respond to client reviews</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <ThumbsUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.ratingDistribution[4] + stats.ratingDistribution[5]}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalReviews > 0
                      ? Math.round((reviews.filter(r => r.response).length / stats.totalReviews) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Distribution</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: stats.totalReviews > 0 ? `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}%` : '0%'
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'responded', 'unresponded'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t received any reviews yet.'}
                </p>
              </div>
            ) : (
              filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        {review.reviewer.avatar ? (
                          <img src={review.reviewer.avatar} alt="Reviewer" className="w-12 h-12 rounded-full" />
                        ) : (
                          <User className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {review.reviewer.firstName} {review.reviewer.lastName}
                          </h3>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <Link
                          href={`/freelancer/projects/${review.project.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm mb-3 block"
                        >
                          Project: {review.project.title}
                        </Link>
                        <p className="text-gray-700 mb-4">{review.review}</p>

                        {/* Response */}
                        {review.response ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">Your Response</span>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.response.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.response.message}</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReview(selectedReview === review.id ? null : review.id)}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                              <Reply className="h-4 w-4" />
                              Respond
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Response Form */}
                  {selectedReview === review.id && !review.response && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-4 mt-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-3">Respond to Review</h4>
                      <div className="space-y-4">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Write your response to this review..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespondToReview(review.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            <Reply className="h-4 w-4" />
                            Submit Response
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(null);
                              setResponseText('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
