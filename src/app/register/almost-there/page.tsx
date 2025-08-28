'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Briefcase, Star, Target, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AlmostTherePage() {
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

  const handleStartOnboarding = () => {
    router.push('/onboarding/step-1');
  };

  const benefits = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Access Thousands of Projects",
      description: "Browse and apply to projects that match your skills"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Build Your Reputation",
      description: "Earn reviews and ratings to attract more clients"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Set Your Own Rates",
      description: "Price your services competitively and grow your income"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Connect with Top Clients",
      description: "Work with businesses and entrepreneurs worldwide"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Grow Your Business",
      description: "Scale your freelance career with powerful tools"
    }
  ];

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
            <div className="text-sm text-gray-600">
              Welcome, {user.firstName}! 👋
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-8"
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4 font-poppins"
          >
            You're Almost There!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-inter"
          >
            Your FreelanceHub account has been created successfully. Let's complete your profile to help you get discovered by amazing clients.
          </motion.p>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm font-inter">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg p-6 mb-8 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">Profile Completion</h3>
              <span className="text-2xl font-bold text-green-600">10%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "10%" }}
                transition={{ delay: 1, duration: 1 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
              ></motion.div>
            </div>
            <p className="text-sm text-gray-600 font-inter">
              Complete your profile to increase your chances of getting hired
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-emerald-50 rounded-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-emerald-800 mb-3 font-poppins">What's Next?</h3>
            <div className="text-left max-w-md mx-auto">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-emerald-700 font-inter">Complete your professional profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-gray-600 font-inter">Add your skills and experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-gray-600 font-inter">Set your rates and availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <span className="text-gray-600 font-inter">Add portfolio samples</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={handleStartOnboarding}
              variant="premium"
              size="xl"
              className="font-poppins mb-4"
            >
              Complete Your Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-500 font-inter">
              Takes about 5-10 minutes
            </p>
          </motion.div>

          {/* Skip Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <Link href="/freelancer/dashboard" className="text-gray-500 hover:text-gray-700 text-sm font-inter">
              Skip for now (you can complete this later)
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
