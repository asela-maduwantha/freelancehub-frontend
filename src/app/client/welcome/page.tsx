'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Users, Search, Star, Shield, Clock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ClientWelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to registration if no user data
      router.push('/register');
    }
  }, [router]);

  const handleStartHiring = () => {
    router.push('/client/dashboard');
  };

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Access Top Talent",
      description: "Browse thousands of verified freelancers with proven expertise"
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Smart Matching",
      description: "Our AI helps you find the perfect freelancer for your project"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Quality Guaranteed",
      description: "Review ratings and portfolios to make informed decisions"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Escrow protection ensures your money is safe until work is complete"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Get help whenever you need it with our dedicated support team"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Reach",
      description: "Work with talent from around the world in any timezone"
    }
  ];

  const nextSteps = [
    {
      step: 1,
      title: "Post Your First Project",
      description: "Describe what you need and set your budget",
      action: "Create Project"
    },
    {
      step: 2,
      title: "Review Proposals",
      description: "Freelancers will send you detailed proposals",
      action: "Coming Soon"
    },
    {
      step: 3,
      title: "Hire & Collaborate",
      description: "Choose the best freelancer and start working together",
      action: "Coming Soon"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <div className="text-sm text-gray-600">
              Welcome, {user.firstName}! 🎉
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="text-center mb-16">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-8"
            >
              <CheckCircle className="h-12 w-12" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-gray-900 mb-4 font-poppins"
            >
              Welcome to FreelanceHub!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-inter"
            >
              Your account is ready! You now have access to thousands of talented freelancers who can help bring your projects to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleStartHiring}
                variant="premium"
                size="xl"
                className="font-poppins mb-4"
              >
                Start Hiring Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-500 font-inter">
                Post your first project and receive proposals within hours
              </p>
            </motion.div>
          </div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-poppins">50K+</div>
              <div className="text-gray-600 font-inter">Talented Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-poppins">100K+</div>
              <div className="text-gray-600 font-inter">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-poppins">4.9★</div>
              <div className="text-gray-600 font-inter">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-poppins">190+</div>
              <div className="text-gray-600 font-inter">Countries</div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12 font-poppins">
              Why clients choose FreelanceHub
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-inter">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 font-poppins">
              Get started in 3 easy steps
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + (index * 0.1) }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4 font-inter">
                    {step.description}
                  </p>
                  <Button
                    variant={step.step === 1 ? "premium" : "secondary"}
                    size="sm"
                    disabled={step.step !== 1}
                    onClick={step.step === 1 ? handleStartHiring : undefined}
                    className="font-inter"
                  >
                    {step.action}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-emerald-50 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-emerald-800 mb-2 font-poppins">
              Need help getting started?
            </h3>
            <p className="text-emerald-700 mb-4 font-inter">
              Our team is here to help you find the perfect freelancer for your project.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/help" className="text-green-600 hover:text-green-700 font-semibold">
                Visit Help Center
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/support" className="text-green-600 hover:text-green-700 font-semibold">
                Contact Support
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
