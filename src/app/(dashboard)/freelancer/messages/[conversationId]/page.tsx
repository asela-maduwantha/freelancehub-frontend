'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { ChatInterface } from '../../../../../components/features/messaging/ChatInterface';

export default function FreelancerConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  if (!conversationId) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid conversation</h3>
            <p className="text-gray-600">The conversation ID is missing or invalid.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="h-[calc(100vh-12rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <ChatInterface conversationId={conversationId} />
      </div>
    </DashboardLayout>
  );
}