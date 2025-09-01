'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { reviewAPI, Review, ReviewStats, CreateReviewData } from '@/lib/api/review';

interface CompletedContract {
  id: string;
  project: {
    id: string;
    title: string;
    completedAt: string;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  status: 'completed';
  hasReview: boolean;
}

function ClientReviewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contract');

  const [user, setUser] = useState<any>(null);
  const [completedContracts, setCompletedContracts] = useState<CompletedContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<CompletedContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadCompletedContracts();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (contractId && completedContracts.length > 0) {
      const contract = completedContracts.find(c => c.id === contractId);
      if (contract && !contract.hasReview) {
        setSelectedContract(contract);
        setShowReviewForm(true);
      }
    }
  }, [contractId, completedContracts]);

  const loadCompletedContracts = async () => {
    try {
      // In a real implementation, this would fetch completed contracts
      // For now, using mock data
      const mockContracts: CompletedContract[] = [
        {
          id: '1',
          project: {
            id: '1',
            title: 'Build E-commerce Website',
            completedAt: '2024-01-30T00:00:00Z'
          },
          freelancer: {
            id: '1',
            firstName: 'John',
            lastName: 'Developer',
            rating: 4.9
          },
          status: 'completed',
          hasReview: true
        },
        {
          id: '2',
          project: {
            id: '2',
            title: 'Mobile App UI Design',
            completedAt: '2024-02-15T00:00:00Z'
          },
          freelancer: {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Designer',
            rating: 4.8
          },
          status: 'completed',
          hasReview: false
        },
        {
          id: '3',
          project: {
            id: '3',
            title: 'Logo Design Project',
            completedAt: '2024-03-01T00:00:00Z'
          },
          freelancer: {
            id: '3',
            firstName: 'Mike',
            lastName: 'Artist',
            rating: 4.7
          },
          status: 'completed',
          hasReview: false
        }
      ];
      setCompletedContracts(mockContracts);
    } catch (error) {
      console.error('Failed to load completed contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedContract || rating === 0 || !review.trim()) return;

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        revieweeId: selectedContract.freelancer.id,
        projectId: selectedContract.project.id,
        rating: rating,
        review: review.trim(),
        reviewType: 'freelancer'
      };

      await reviewAPI.createReview(reviewData);

      // Update local state
      setCompletedContracts(prev =>
        prev.map(contract =>
          contract.id === selectedContract.id
            ? { ...contract, hasReview: true }
            : contract
        )
      );

      setReviewSubmitted(true);
      setTimeout(() => {
        setShowReviewForm(false);
        setSelectedContract(null);
        setRating(0);
        setReview('');
        setReviewSubmitted(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`text-2xl ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              star <= (interactive ? (hoverRating || rating) : currentRating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

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
              href="/client/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
            Leave Reviews
          </h1>
          <p className="text-gray-600 font-inter">
            Share your experience and help other clients find great freelancers
          </p>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                    Review Freelancer
                  </h2>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setSelectedContract(null);
                      setRating(0);
                      setReview('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Freelancer Info */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedContract.freelancer.firstName} {selectedContract.freelancer.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedContract.project.title}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">
                        Current rating: {selectedContract.freelancer.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {reviewSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Review Submitted!
                    </h3>
                    <p className="text-gray-600">
                      Thank you for sharing your feedback. It helps improve our community.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Rating */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                      </label>
                      <div className="flex items-center space-x-4">
                        {renderStars(rating, true)}
                        <span className="text-sm text-gray-600">
                          {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review *
                      </label>
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience working with this freelancer..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {review.length}/500 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setSelectedContract(null);
                          setRating(0);
                          setReview('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="premium"
                        onClick={handleSubmitReview}
                        disabled={rating === 0 || !review.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Review
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Completed Projects List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">
            Completed Projects
          </h2>

          {completedContracts.length > 0 ? (
            completedContracts.map((contract) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                        {contract.project.title}
                      </h3>
                      <p className="text-gray-600">
                        {contract.freelancer.firstName} {contract.freelancer.lastName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span>{contract.freelancer.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Completed {formatDate(contract.project.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {contract.hasReview ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Review Submitted</span>
                      </div>
                    ) : (
                      <Button
                        variant="premium"
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowReviewForm(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed projects yet</h3>
              <p className="text-gray-500 mb-6">
                Reviews will be available once you complete projects with freelancers
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/client/projects">
                  <Button variant="premium" className="font-poppins">
                    View Projects
                  </Button>
                </Link>
                <Link href="/client/freelancers">
                  <Button variant="outline" className="font-inter">
                    Find Freelancers
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientReviewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <ClientReviewsPageContent />
    </Suspense>
  );
}
