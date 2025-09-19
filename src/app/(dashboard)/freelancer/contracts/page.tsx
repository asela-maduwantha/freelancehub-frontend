'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function FreelancerContractsPage() {
  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active contracts</h3>
              <p className="mt-1 text-sm text-gray-500">Your accepted projects will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}