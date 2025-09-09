'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OnboardingTransitionPage() {
  const router = useRouter();
  
  // Protect this route - require authentication
  const { isAuthenticated, user, isLoading, userRole } = useAuthGuard();

  const isFreelancer = userRole === 'freelancer';
  const isClient = userRole === 'client';

  useEffect(() => {
    // Don't proceed if still loading authentication
    if (isLoading) return;
    
    // If not authenticated, auth guard will handle redirect
    if (!isAuthenticated) return;
    
    // If user doesn't have a role, redirect to role selection
    if (!userRole) {
      router.push('/role-selection');
      return;
    }

    // Auto redirect after 5 seconds if user doesn't click
    const timer = setTimeout(() => {
      const redirectPath = isFreelancer
        ? '/onboarding/freelancer' 
        : '/onboarding/client';
      router.push(redirectPath);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, userRole, isAuthenticated, isLoading, isFreelancer]);

  const handleContinue = () => {
    // Check authentication before proceeding
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Use role from user object
    if (!userRole) {
      router.push('/role-selection');
      return;
    }
    
    const redirectPath = isFreelancer
      ? '/onboarding/freelancer' 
      : '/onboarding/client';
    router.push(redirectPath);
  };

  const features = isFreelancer ? [
    'Create a stunning professional profile',
    'Showcase your portfolio and skills',
    'Set your availability and rates',
    'Connect with potential clients',
    'Start earning on your terms'
  ] : isClient ? [
    'Create your business profile',
    'Post your first project',
    'Find skilled freelancers',
    'Manage projects efficiently',
    'Build your dream team'
  ] : [
    'Complete your profile setup',
    'Get started with the platform',
    'Connect with the community'
  ];

  // Show loading state while checking authentication or role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-green-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 0.8, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Success Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-white text-sm font-medium mb-6 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-4 h-4" />
              Email Verified Successfully!
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {user?.firstName ? `Welcome, ${user.firstName}!` : "You're Almost There!"}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {isFreelancer
                ? "Let's enhance your profile to help you stand out and attract the perfect clients"
                : "Let's set up your business profile to help you find and hire the best freelancers"
              }
            </motion.p>

            {/* Features List */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-green-200 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Here's what we'll help you set up:
              </h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <Button
                onClick={handleContinue}
                size="xl"
                className="px-12 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                variant="premium"
              >
                {isFreelancer
                  ? "Let's Build Your Profile"
                  : "Let's Set Up Your Business"
                }
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>

            {/* Auto redirect notice */}
            <motion.p
              className="text-sm text-gray-500 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              We'll get started automatically in a few seconds...
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
