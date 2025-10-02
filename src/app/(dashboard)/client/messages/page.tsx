'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { MessageSquare } from 'lucide-react';

export default function ClientMessagesPage() {
  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-32 -mt-32" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Stay connected with freelancers</p>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-12">
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">Your conversations with freelancers will appear here. Start by posting a job or reviewing proposals.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}