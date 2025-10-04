'use client';

import { useState } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { ConversationList } from '../../../../components/features/messaging/ConversationList';
import { ChatInterface } from '../../../../components/features/messaging/ChatInterface';
import { Conversation } from '../../../../types/messages';

export default function FreelancerMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
  };

  return (
    <DashboardLayout userRole="freelancer">
      <div className="h-[calc(100vh-12rem)] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200">
            <ConversationList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversationId}
            />
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            {selectedConversationId ? (
              <ChatInterface conversationId={selectedConversationId} />
            ) : (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Choose a conversation from the list to start messaging with clients
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}