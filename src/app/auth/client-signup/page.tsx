"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ClientSignupPage = () => {
  const router = useRouter();

  // Validate that user selected client role
  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole');
    if (!selectedRole || selectedRole !== 'client') {
      // Redirect to role selection if role not selected or not client
      router.push('/auth/role-selection');
      return;
    }
  }, [router]);

  const handleBackToRoleSelection = () => {
    sessionStorage.removeItem('selectedRole');
    router.push('/auth/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Client Onboarding Coming Soon
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            We're currently building an amazing onboarding experience for clients. 
            The freelancer onboarding is ready for you to explore!
          </p>

          {/* Client Features Preview */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">What's Coming</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Company profile setup
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Project posting wizard
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Budget and timeline tools
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Freelancer discovery tools
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Proposal management
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Payment and contract setup
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleBackToRoleSelection}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Role Selection
            </Button>
            
            <Button
              onClick={() => router.push('/auth/freelancer-signup')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Try Freelancer Onboarding
            </Button>
          </div>

          {/* Note */}
          <p className="text-sm text-gray-500 mt-6">
            Want to be notified when client onboarding is ready?{" "}
            <a href="mailto:hello@freelancehub.com" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientSignupPage;
