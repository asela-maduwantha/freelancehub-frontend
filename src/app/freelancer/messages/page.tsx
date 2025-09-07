'use client';

import { useState, useEffect } from 'react';
import { Search, MessageCircle, User, Clock, MoreVertical } from 'lucide-react';
import { Conversation } from '@/lib/types';
import { messagingService, MessagingService } from '@/lib/api';
import { getWebSocketService } from '@/lib/utils/websocket.service';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ChatInterface from '@/components/messaging/ChatInterface';
import NewConversationModal from '@/components/messaging/NewConversationModal';
import ToastNotificationSystem from '@/components/messaging/ToastNotificationSystem';

export default function FreelancerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [webSocketService, setWebSocketService] = useState<any>(null);

  useEffect(() => {
    loadConversations();
    connectWebSocket();

    return () => {
      if (webSocketService) {
        webSocketService.off('new_message');
        webSocketService.off('user_online');
        webSocketService.off('user_offline');
        // Disconnect WebSocket when leaving messages page
        webSocketService.disconnect();
      }
    };
  }, [webSocketService]);

  const connectWebSocket = async () => {
    try {
      const service = getWebSocketService();
      setWebSocketService(service);
      await service.connect();
      setupWebSocketListeners(service);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await MessagingService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketListeners = (service: any) => {
    service.on('new_message', (data: any) => {
      // Update conversation with new message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, lastMessage: data.message, unreadCount: conv.unreadCount + 1 }
            : conv
        )
      );
    });

    service.on('user_online', (data: any) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.participants.some(p => p.id === data.userId)
            ? {
                ...conv,
                participants: conv.participants.map(p =>
                  p.id === data.userId ? { ...p, isOnline: true } : p
                )
              }
            : conv
        )
      );
    });

    service.on('user_offline', (data: any) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.participants.some(p => p.id === data.userId)
            ? {
                ...conv,
                participants: conv.participants.map(p =>
                  p.id === data.userId ? { ...p, isOnline: false, lastSeen: data.lastSeen } : p
                )
              }
            : conv
        )
      );
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleNewConversation = () => {
    setShowNewConversationModal(true);
  };

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadConversations(); // Refresh the conversations list
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    // In a real app, you'd get the current user ID from auth context
    return conversation.participants[0]; // Simplified
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full">
      {selectedConversation ? (
        <ChatInterface
          conversationId={selectedConversation}
          onBack={handleBackToConversations}
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-2">
                Communicate with your clients
              </p>
            </div>
            <Button className="flex items-center gap-2" onClick={handleNewConversation}>
              <MessageCircle className="w-4 h-4" />
              New Message
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {filteredConversations.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No conversations yet"
                description="Start a conversation with a client to begin messaging"
              />
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            {otherParticipant.avatar ? (
                              <img
                                src={otherParticipant.avatar}
                                alt={otherParticipant.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          {/* Online status */}
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                        </div>

                        {/* Conversation details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherParticipant.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {conversation.lastMessage && (
                                <span className="text-sm text-gray-500">
                                  {formatTime(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                otherParticipant.isOnline
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {otherParticipant.isOnline ? 'Online' : 'Offline'}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleConversationCreated}
      />
      <ToastNotificationSystem />
    </div>
  );
}