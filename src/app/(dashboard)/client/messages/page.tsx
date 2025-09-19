'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function ClientMessagesPage() {
  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
              <p className="mt-1 text-sm text-gray-500">Your conversations with freelancers will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}