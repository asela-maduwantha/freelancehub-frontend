import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import { AppDispatch } from '../../../store';
import {
  fetchConversations,
  selectConversations,
  selectConversationsLoading,
  selectConversationsPagination,
  setCurrentConversation,
} from '../../../store/slices/messages';
import { ConversationItem } from './ConversationItem';
import { Conversation } from '../../../types/messages';

interface ConversationListProps {
  onConversationSelect?: (conversation: Conversation) => void;
  selectedConversationId?: string | null;
  contractId?: string; // Filter conversations by contract
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onConversationSelect,
  selectedConversationId,
  contractId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(selectConversations);
  const loading = useSelector(selectConversationsLoading);
  const pagination = useSelector(selectConversationsPagination);

  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations on mount, filtered by contractId if provided
  useEffect(() => {
    dispatch(fetchConversations(contractId ? { contractId } : {}));
  }, [dispatch, contractId]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;

    const otherParticipant =
      conversation.client.firstName + ' ' + conversation.client.lastName +
      ' ' + conversation.freelancer.firstName + ' ' + conversation.freelancer.lastName;

    return otherParticipant.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConversationClick = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation.id));
    onConversationSelect?.(conversation);
  };

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      dispatch(fetchConversations({
        page: pagination.page + 1,
        limit: 20, // Default limit
        ...(contractId && { contractId }),
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600 text-sm max-w-xs">
              {searchQuery
                ? 'Try adjusting your search terms'
                : contractId
                ? 'No messages for this contract yet. Start a conversation!'
                : 'Your conversations with clients and freelancers will appear here'
              }
            </p>
          </div>
        ) : (
          <>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedConversationId}
                onClick={() => handleConversationClick(conversation)}
              />
            ))}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          {pagination.total > conversations.length && ` of ${pagination.total}`}
        </div>
      </div>
    </div>
  );
};