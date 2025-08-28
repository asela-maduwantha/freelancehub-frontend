'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Star, Users, DollarSign, Globe, Shield, Clock, Search } from 'lucide-react';
import Link from 'next/link';
import { freelancerAPI } from '@/lib/api';

interface OnboardingData {
  professional?: any;
  skills?: any;
  portfolio?: any;
  preferences?: any;
}

export default function OnboardingStep4() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!userData || !accessToken) {
      console.error('User not authenticated');
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));

    // Load all onboarding data
    const data = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    setOnboardingData(data);
  }, [router]);

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found');
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      console.log('Starting onboarding completion with token:', accessToken.substring(0, 20) + '...');

      // Combine all onboarding data
      const completeProfileData = {
        professional: onboardingData.professional,
        skills: onboardingData.skills,
        portfolio: onboardingData.portfolio,
        preferences: onboardingData.preferences
      };

      console.log('Submitting profile data:', completeProfileData);

      // Submit complete profile to API
      const result = await freelancerAPI.createCompleteProfile(completeProfileData);
      console.log('API call successful:', result);

      // Clear onboarding data
      localStorage.removeItem('onboardingData');

      // Navigate to freelancer dashboard
      router.push('/freelancer/dashboard');
      
         } catch (error: any) {
       console.error('Error completing onboarding:', error);
       
       // Check if it's an authentication error (multiple ways to detect)
       const isAuthError = 
         error.message?.includes('401') || 
         error.message?.includes('Unauthorized') ||
         error.status === 401 ||
         error.statusText?.includes('Unauthorized');
       
       if (isAuthError) {
         console.log('Authentication error detected, redirecting to login');
         // Clear invalid tokens and redirect to login
         localStorage.removeItem('accessToken');
         localStorage.removeItem('refreshToken');
         localStorage.removeItem('user');
         router.push('/login?message=session_expired');
         return;
       }
       
       // For other errors, still redirect to dashboard
       console.log('Non-auth error, redirecting to dashboard');
       localStorage.removeItem('onboardingData');
       router.push('/freelancer/dashboard');
     } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('onboardingData');
    router.push('/freelancer/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Step 4 of 4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link
            href="/onboarding/step-3"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Success Icon */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-8"
            >
              <CheckCircle className="h-12 w-12" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              You're all set!
            </h1>
            <p className="text-xl text-gray-600 font-inter">
              Your profile is complete and ready to attract clients
            </p>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 font-poppins">Profile Summary</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Professional Info */}
              {onboardingData.professional && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 font-poppins">Professional Information</h4>
                  <div className="space-y-2 text-sm text-gray-600 font-inter">
                    <div><strong>Title:</strong> {onboardingData.professional.title}</div>
                    <div><strong>Experience:</strong> {onboardingData.professional.experience}</div>
                    <div><strong>Hourly Rate:</strong> ${onboardingData.professional.hourlyRate}/hr</div>
                    <div><strong>Availability:</strong> {onboardingData.professional.availability}</div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {onboardingData.skills && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 font-poppins">Skills & Expertise</h4>
                  <div className="space-y-2 text-sm text-gray-600 font-inter">
                    <div><strong>Primary Skills:</strong> {onboardingData.skills.primarySkills?.join(', ')}</div>
                    <div><strong>Secondary Skills:</strong> {onboardingData.skills.secondarySkills?.join(', ')}</div>
                    <div><strong>Languages:</strong> {onboardingData.skills.languages?.join(', ')}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Summary */}
            {onboardingData.portfolio && onboardingData.portfolio.items && onboardingData.portfolio.items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 font-poppins">Portfolio Items</h4>
                <div className="grid gap-3">
                  {onboardingData.portfolio.items.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 text-sm text-gray-600 font-inter">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{item.title}</span>
                    </div>
                  ))}
                  {onboardingData.portfolio.items.length > 3 && (
                    <div className="text-sm text-gray-500 font-inter">
                      +{onboardingData.portfolio.items.length - 3} more projects
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-6 font-poppins">What's Next?</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 font-poppins">Find Projects</h4>
                  <p className="text-sm text-green-700 font-inter">Browse and apply to projects that match your skills</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 font-poppins">Get Discovered</h4>
                  <p className="text-sm text-green-700 font-inter">Clients will find you through your profile and portfolio</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 font-poppins">Start Earning</h4>
                  <p className="text-sm text-green-700 font-inter">Complete projects and receive secure payments</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 font-poppins">Build Reputation</h4>
                  <p className="text-sm text-green-700 font-inter">Earn reviews and ratings from satisfied clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Benefits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 font-poppins">Why FreelanceHub?</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 font-poppins">Secure Payments</h4>
                  <p className="text-sm text-gray-600 font-inter">Escrow protection ensures you get paid for your work</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 font-poppins">Global Reach</h4>
                  <p className="text-sm text-gray-600 font-inter">Connect with clients from around the world</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 font-poppins">Flexible Schedule</h4>
                  <p className="text-sm text-gray-600 font-inter">Work on your own terms and timeline</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 font-poppins">Support Team</h4>
                  <p className="text-sm text-gray-600 font-inter">24/7 support to help you succeed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Link href="/onboarding/step-3">
              <Button variant="outline" className="font-inter">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            </Link>

            <div className="flex space-x-4">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="font-inter"
              >
                Skip for Now
              </Button>

              <Button
                onClick={handleCompleteOnboarding}
                disabled={isSubmitting}
                variant="premium"
                size="lg"
                className="font-poppins"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Complete Setup</span>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
