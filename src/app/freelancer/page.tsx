'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function FreelancerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.firstName || 'Freelancer'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your projects, view proposals, and track your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Active Jobs</h3>
              <p className="text-blue-100">View and manage your current projects</p>
              <Button
                onClick={() => router.push('/dashboard/freelancer/jobs')}
                className="mt-4 bg-white text-blue-600 hover:bg-blue-50"
              >
                View Jobs
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Proposals</h3>
              <p className="text-green-100">Check your submitted proposals</p>
              <Button
                onClick={() => router.push('/dashboard/freelancer/proposals')}
                className="mt-4 bg-white text-green-600 hover:bg-green-50"
              >
                View Proposals
              </Button>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Earnings</h3>
              <p className="text-purple-100">Track your income and payments</p>
              <Button
                onClick={() => router.push('/dashboard/freelancer/earnings')}
                className="mt-4 bg-white text-purple-600 hover:bg-purple-50"
              >
                View Earnings
              </Button>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Messages</h3>
              <p className="text-orange-100">Communicate with clients</p>
              <Button
                onClick={() => router.push('/dashboard/freelancer/messages')}
                className="mt-4 bg-white text-orange-600 hover:bg-orange-50"
              >
                View Messages
              </Button>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Contracts</h3>
              <p className="text-red-100">Manage your active contracts</p>
              <Button
                onClick={() => router.push('/dashboard/freelancer/contracts')}
                className="mt-4 bg-white text-red-600 hover:bg-red-50"
              >
                View Contracts
              </Button>
            </div>

            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Settings</h3>
              <p className="text-gray-100">Update your profile and preferences</p>
              <Button
                onClick={() => router.push('/dashboard/freelancer/settings')}
                className="mt-4 bg-white text-gray-600 hover:bg-gray-50"
              >
                View Settings
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push('/browse/jobs')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
            >
              Browse New Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
