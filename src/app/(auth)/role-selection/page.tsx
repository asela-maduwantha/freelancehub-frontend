'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null);
  const router = useRouter();
  const setStoreSelectedRole = useAuthStore((state) => state.setSelectedRole);

  const handleRoleSelect = (role: 'freelancer' | 'client') => {
    setSelectedRole(role);
    // Don't set store here, only set local state for UI
  };

  const handleContinue = () => {
    if (selectedRole) {
      // Store the selected role in Zustand store
      setStoreSelectedRole(selectedRole);
      console.log('Role saved to store:', selectedRole); // Debug log
      router.push('/register');
    }
  };

  const freelancerFeatures = [
    'Find exciting projects',
    'Set your own rates',
    'Work from anywhere',
    'Build your portfolio',
    'Get paid securely',
  ];

  const clientFeatures = [
    'Post projects easily',
    'Find skilled freelancers',
    'Manage projects',
    'Secure payments',
    'Track progress',
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Animated Background Elements - matching landing page */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-emerald-200 rounded-full opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ✨ Welcome to FreelanceHub
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Choose Your Path
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with talented freelancers or find the perfect project for your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Freelancer Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                selectedRole === 'freelancer'
                  ? 'border-green-500 bg-white/80 shadow-xl transform scale-105 ring-4 ring-green-100'
                  : 'border-gray-200 bg-white/60 hover:border-green-300 hover:shadow-lg hover:bg-white/80'
              }`}
              onClick={() => handleRoleSelect('freelancer')}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                  I'm a Freelancer
                </h3>
                <p className="text-gray-600">
                  Offer your skills and services to clients worldwide
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {freelancerFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedRole === 'freelancer' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.div>

            {/* Client Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                selectedRole === 'client'
                  ? 'border-green-500 bg-white/80 shadow-xl transform scale-105 ring-4 ring-green-100'
                  : 'border-gray-200 bg-white/60 hover:border-green-300 hover:shadow-lg hover:bg-white/80'
              }`}
              onClick={() => handleRoleSelect('client')}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                  I'm a Client
                </h3>
                <p className="text-gray-600">
                  Find and hire talented freelancers for your projects
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {clientFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedRole === 'client' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              size="xl"
              className="px-12 py-4 text-lg font-semibold shadow-xl"
              variant="premium"
            >
              Continue to Registration
            </Button>
            {!selectedRole && (
              <p className="mt-4 text-sm text-gray-500">
                Please select a role to continue
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
