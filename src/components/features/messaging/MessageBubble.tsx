import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, FileText, Image, Paperclip } from 'lucide-react';
import { ChatMessage } from '../../../types/messages';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
}) => {
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {message.sender.firstName?.[0] || '?'}
            </span>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender Name (for received messages) */}
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }`}
        >
          {/* Message Content */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-opacity-80 ${
                    isOwn ? 'bg-blue-600' : 'bg-gray-50'
                  }`}
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  {getFileIcon(attachment.type)}
                  <span className={`text-xs truncate ${isOwn ? 'text-blue-100' : 'text-gray-700'}`}>
                    {attachment.filename}
                  </span>
                  <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                    ({(attachment.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Message Status & Timestamp */}
          <div className={`flex items-center gap-1 mt-1 text-xs ${
            isOwn ? 'text-blue-100 justify-end' : 'text-gray-500 justify-start'
          }`}>
            {showTimestamp && (
              <span>{formatTime(message.sentAt)}</span>
            )}

            {/* Read Status (only for own messages) */}
            {isOwn && (
              <div className="flex items-center">
                {message.isRead ? (
                  <CheckCheck className="w-3 h-3 text-blue-200" />
                ) : (
                  <Check className="w-3 h-3 text-blue-300" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Type Indicator */}
        {message.messageType === 'system' && (
          <span className="text-xs text-gray-400 mt-1 px-3 italic">
            System message
          </span>
        )}

        {/* Edited Indicator */}
        {message.isEdited && (
          <span className="text-xs text-gray-400 mt-1 px-3">
            Edited
          </span>
        )}
      </div>
    </div>
  );
};