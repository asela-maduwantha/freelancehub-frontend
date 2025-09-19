'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function SharedNotificationsPage() {
  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h9A2.5 2.5 0 0118 7.5V13" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}