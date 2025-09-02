'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { User, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const router = useRouter();

  const handleRoleSelection = (role: 'client' | 'freelancer') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/register/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">


      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Join FreelanceHub
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-inter">
              Choose your role to get started with the world's largest freelancing platform
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Client Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelection('client')}
              className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'client'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                  selectedRole === 'client' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <User className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">I'm a Client</h3>
                <p className="text-gray-600 mb-6">
                  I want to hire freelancers and manage projects
                </p>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Post projects and jobs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Browse and hire talent</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Manage contracts & payments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Access project management tools</span>
                  </li>
                </ul>
              </div>
              {selectedRole === 'client' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
            </motion.div>

            {/* Freelancer Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelection('freelancer')}
              className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'freelancer'
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                  selectedRole === 'freelancer' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">I'm a Freelancer</h3>
                <p className="text-gray-600 mb-6">
                  I want to find work and grow my business
                </p>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Browse and apply to jobs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Showcase your portfolio</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Get paid securely</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Build client relationships</span>
                  </li>
                </ul>
              </div>
              {selectedRole === 'freelancer' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              variant={selectedRole ? "premium" : "secondary"}
              size="xl"
              className="font-poppins"
            >
              Continue as {selectedRole ? (selectedRole === 'client' ? 'Client' : 'Freelancer') : '...'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Already have account */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
