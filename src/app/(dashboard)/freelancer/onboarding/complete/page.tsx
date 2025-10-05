'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';

const CompletionPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { progress } = useSelector((state: RootState) => state.onboarding);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Clear onboarding progress
    dispatch(onboardingActions.resetOnboarding());

    // Show confetti animation
    setShowConfetti(true);

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/freelancer/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, router]);

  const calculateProfileCompletion = () => {
    if (!progress?.formData) return 0;

    const { formData } = progress;
    let completed = 0;
    let total = 6; // Total possible sections

    // Basic Profile (required)
    if (formData.title && formData.overview && formData.availability && formData.experience && formData.languages?.length) {
      completed++;
    }

    // Professional Details (required)
    if (formData.professionalTitle && formData.hourlyRate && formData.experienceLevel &&
        formData.availability && formData.languages?.length && formData.professionalOverview) {
      completed++;
    }

    // Skills (required)
    if ((formData.skills?.length ?? 0) >= 3) {
      completed++;
    }

    // Portfolio (optional)
    if ((formData.portfolio?.length ?? 0) > 0) {
      completed++;
    }

    // Education (optional)
    if ((formData.education?.length ?? 0) > 0) {
      completed++;
    }

    // Payment Setup (optional)
    if (formData.stripeConnected) {
      completed++;
    }

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateProfileCompletion();

  const handleBrowseJobs = () => {
    router.push('/freelancer/jobs/browse');
  };

  const handleViewProfile = () => {
    router.push('/freelancer/profile');
  };

  const handleSetupPayment = () => {
    router.push('/freelancer/onboarding/payment');
  };

  const handleGoToDashboard = () => {
    router.push('/freelancer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Confetti Animation Placeholder */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-10">
            <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-32 left-1/4 w-5 h-5 bg-green-400 rounded-full animate-bounce delay-200"></div>
            <div className="absolute top-16 right-1/3 w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-20 left-16 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-400"></div>
            <div className="absolute bottom-32 right-16 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-500"></div>
          </div>
        )}

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg className="w-16 h-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to FreelanceHub! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Your freelancer profile is ready to go
          </p>
        </div>

        {/* Profile Completion Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Completion</h2>

          {/* Progress Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-4">
            {completionPercentage === 100
              ? "Perfect! Your profile is 100% complete."
              : `Great start! ${100 - completionPercentage}% more to reach perfection.`
            }
          </p>

          {/* Incomplete Items */}
          {completionPercentage < 100 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Complete your profile:</h3>
              <div className="space-y-1 text-sm">
                {!progress?.formData?.portfolio?.length && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>Add portfolio projects</span>
                    <button
                      onClick={handleViewProfile}
                      className="text-blue-600 hover:underline ml-auto"
                    >
                      Add now
                    </button>
                  </div>
                )}
                {!progress?.formData?.education?.length && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>Add education</span>
                    <button
                      onClick={handleViewProfile}
                      className="text-blue-600 hover:underline ml-auto"
                    >
                      Add now
                    </button>
                  </div>
                )}
                {!progress?.formData?.stripeConnected && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>Set up payment account</span>
                    <button
                      onClick={handleSetupPayment}
                      className="text-blue-600 hover:underline ml-auto"
                    >
                      Set up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What would you like to do next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleBrowseJobs}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Browse Jobs</h3>
                  <p className="text-sm text-gray-600">Find your next project</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleViewProfile}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Profile</h3>
                  <p className="text-sm text-gray-600">See how clients see you</p>
                </div>
              </div>
            </button>

            {!progress?.formData?.stripeConnected && (
              <button
                onClick={handleSetupPayment}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Set Up Payments</h3>
                    <p className="text-sm text-gray-600">Get paid for your work</p>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={handleGoToDashboard}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Go to Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </div>
            </button>
          </div>
        </Card>

        {/* Auto-redirect Notice */}
        <div className="text-center">
          <p className="text-gray-600">
            Auto-redirecting to dashboard in <span className="font-semibold">{countdown}</span> seconds...
          </p>
          <Button
            onClick={handleGoToDashboard}
            variant="outline"
            className="mt-2"
          >
            Go to Dashboard Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
