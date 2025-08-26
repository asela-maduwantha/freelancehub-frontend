"use client";
import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Flag, MessageCircle, Calendar, User } from "lucide-react";
import Button from "@/components/ui/Button";
import { reviewApi, Review, ReviewStats } from "@/lib/api/reviews";

interface FreelancerReviewsEnhancedProps {
  freelancerId: string;
}

export const FreelancerReviewsEnhanced: React.FC<FreelancerReviewsEnhancedProps> = ({
  freelancerId
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load reviews and stats
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load reviews for the freelancer
        const reviewFilters = {
          revieweeId: freelancerId,
          reviewType: 'client_to_freelancer' as const,
          isPublic: true,
          page,
          limit: 10,
          sortBy: 'createdAt' as const,
          sortOrder: sortBy === 'newest' ? 'desc' as const : 'asc' as const,
          ...(filter !== 'all' && { 
            minRating: parseInt(filter), 
            maxRating: parseInt(filter) 
          })
        };

        const [reviewsResult, statsResult] = await Promise.allSettled([
          reviewApi.getReviews(reviewFilters),
          reviewApi.getUserReviewStats(freelancerId)
        ]);

        // Extract values with fallbacks for failed calls
        const reviewsResponse = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;
        const statsResponse = statsResult.status === 'fulfilled' ? statsResult.value : null;

        // Log any failures for debugging
        if (reviewsResult.status === 'rejected') {
          console.error('Failed to load reviews:', reviewsResult.reason);
        }
        if (statsResult.status === 'rejected') {
          console.error('Failed to load review stats:', statsResult.reason);
        }

        setReviews(reviewsResponse?.reviews || []);
        setTotalPages(reviewsResponse?.totalPages || 1);
        
        if (statsResponse?.success) {
          setStats(statsResponse.data);
        }

      } catch (err: any) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (freelancerId) {
      loadReviews();
    }
  }, [freelancerId, filter, sortBy, page]);

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.rating === parseInt(filter);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="text-4xl font-bold mr-4">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
              <div>
                {renderStars(stats?.averageRating || 0, 20)}
                <p className="text-gray-600 text-sm mt-1">
                  Based on {stats?.totalReviews || 0} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const ratingData = stats?.ratingDistribution?.find(r => r.rating === rating);
              const count = ratingData?.count || 0;
              const percentage = (stats?.totalReviews || 0) > 0 ? (count / (stats?.totalReviews || 1)) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm w-6">{rating}</span>
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
          {(['all', '5', '4', '3', '2', '1'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === filterOption
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption === 'all' ? 'All' : `${filterOption} stars`}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rating</option>
            <option value="lowest">Lowest rating</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "This freelancer hasn't received any reviews yet."
                : `No reviews with ${filter} stars found.`
              }
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.reviewer?.profilePicture || "/api/placeholder/48/48"}
                    alt={`${review.reviewer?.firstName} ${review.reviewer?.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/48/48";
                    }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <Flag size={16} />
                </button>
              </div>

              {/* Project Title */}
              {review.project && (
                <div className="bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
                  <span className="text-sm text-blue-800 font-medium">{review.project.title}</span>
                </div>
              )}

              {/* Review Content */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {/* Review Date */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Review posted on {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {sortedReviews.length > 0 && sortedReviews.length >= 10 && (
        <div className="text-center">
          <Button 
            onClick={() => setPage(prev => prev + 1)}
            disabled={page >= totalPages}
            variant="outline"
          >
            Load More Reviews
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <Button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
