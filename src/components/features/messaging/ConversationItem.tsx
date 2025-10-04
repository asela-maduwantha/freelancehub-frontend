import React from 'react';
import { format } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';
import { Conversation } from '../../../types/messages';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const formatLastMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 168) { // 7 days
        return format(date, 'EEE');
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return '';
    }
  };

  const getOtherParticipant = () => {
    // This would need to be determined based on current user
    // For now, showing freelancer info
    return conversation.freelancer;
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            {otherParticipant.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-lg font-medium">
                {otherParticipant.firstName?.[0] || <User className="w-6 h-6" />}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {otherParticipant.firstName} {otherParticipant.lastName}
            </h3>
            {conversation.lastMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatLastMessageTime(conversation.lastMessage.sentAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate flex-1 mr-2">
              {conversation.lastMessage?.content || 'No messages yet'}
            </p>

            {/* Unread Badge */}
            {conversation.unreadCount > 0 && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Contract/Milestone Info */}
          <div className="flex items-center gap-2 mt-1">
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Contract #{conversation.contractId.slice(-6)}
              {conversation.milestoneId && ` • Milestone`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};