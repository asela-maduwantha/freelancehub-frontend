import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { AppDispatch } from '../../../store';
import {
  fetchMessages,
  sendMessage,
  selectCurrentConversation,
  selectMessages,
  selectTypingUsers,
} from '../../../store/slices/messages';
import { useMessagingSocket } from '../../../lib/hooks/useMessagingSocket';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '../../../types/messages';

interface ChatInterfaceProps {
  conversationId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useSelector(selectCurrentConversation);
  const messages = useSelector(selectMessages(conversationId));
  const typingUsers = useSelector(selectTypingUsers(conversationId));

  const [newMessage, setNewMessage] = useState('');

  // Socket.IO integration
  const { sendMessage: socketSendMessage, sendTyping } = useMessagingSocket(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages({ conversationId }));
    }
  }, [conversationId, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversationId) return;

    try {
      // Send via Socket.IO for real-time delivery
      await socketSendMessage(conversationId, content.trim());

      // Also dispatch to Redux for optimistic updates
      dispatch(sendMessage({
        conversationId,
        data: {
          content: content.trim(),
        },
      }));

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    sendTyping(conversationId, isTyping);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {conversation.client.firstName[0]}{conversation.client.lastName[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation.client.firstName} {conversation.client.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              Conversation
            </p>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-600 text-sm max-w-xs">
                Send a message to begin discussing the project details
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === conversation.client.id} // Adjust based on current user
            />
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          placeholder="Type your message..."
          disabled={false}
        />
      </div>
    </div>
  );
};