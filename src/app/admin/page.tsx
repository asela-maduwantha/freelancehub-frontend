'use client';

import { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Lazy load the admin component for better performance
const AdminCleanupTools = lazy(() => import('../../components/payments/AdminCleanupTools').then(module => ({ default: module.AdminCleanupTools })));

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage payment disputes, refunds, and system cleanup tasks.
          </p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex justify-center">
                <LoadingSpinner className="w-8 h-8" />
                <span className="ml-2 text-gray-600">Loading admin tools...</span>
              </div>
            </div>
          }>
            <AdminCleanupTools />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
