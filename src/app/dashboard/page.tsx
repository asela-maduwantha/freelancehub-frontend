'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to FreelanceHub!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your dashboard is under construction. Check back soon for exciting features!
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
