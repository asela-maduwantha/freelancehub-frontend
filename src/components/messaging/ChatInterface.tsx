'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Message, Conversation } from '@/lib/types';
import { MessagingService } from '@/lib/api';
import { getWebSocketService } from '@/lib/utils/websocket.service';
import { EncryptionService } from '@/lib/utils/encryption.service';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ChatInterfaceProps {
  conversationId: string;
  onBack?: () => void;
  isMobile?: boolean;
}

export default function ChatInterface({ conversationId, onBack, isMobile = false }: ChatInterfaceProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversation();
    loadMessages();
    setupWebSocket();
    loadEncryptionKey();

    return () => {
      const service = getWebSocketService();
      service.off('new_message');
      service.off('message_sent');
      service.off('typing_start');
      service.off('typing_stop');
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const data = await MessagingService.getConversation(conversationId);
      setConversation(data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await MessagingService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEncryptionKey = async () => {
    try {
      let key = await EncryptionService.getConversationKey(conversationId);
      if (!key) {
        // Initialize encryption for new conversation
        const response = await MessagingService.initializeEncryption(conversationId);
        key = await EncryptionService.importKey(response.encryptionKey);
        await EncryptionService.storeConversationKey(conversationId, key);
      }
      setEncryptionKey(key);
    } catch (error) {
      console.error('Failed to load encryption key:', error);
    }
  };

  const setupWebSocket = async () => {
    const service = getWebSocketService();
    
    // Ensure WebSocket is connected before joining conversation
    if (!service.isConnected()) {
      try {
        await service.connect();
      } catch (error) {
        console.error('Failed to connect WebSocket in ChatInterface:', error);
        return;
      }
    }

    service.joinConversation(conversationId);

    service.on('new_message', async (data: any) => {
      if (data.conversationId === conversationId) {
        // Decrypt message if we have the key
        let decryptedContent = data.message.content;
        if (encryptionKey && data.message.type === 'text') {
          try {
            decryptedContent = await EncryptionService.decryptMessage(data.message.content, encryptionKey);
          } catch (error) {
            console.error('Failed to decrypt message:', error);
          }
        }

        const decryptedMessage = {
          ...data.message,
          content: decryptedContent
        };

        setMessages(prev => [...prev, decryptedMessage]);
      }
    });

    service.on('message_sent', (data: any) => {
      // Update message status
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      let contentToSend = newMessage;

      // Encrypt message if we have the key
      if (encryptionKey) {
        contentToSend = await EncryptionService.encryptMessage(newMessage, encryptionKey);
      }

      await MessagingService.sendMessage(conversationId, contentToSend);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    // In a real app, you'd get the current user ID from auth context
    return conversation.participants[0];
  };

  const otherParticipant = getOtherParticipant();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {otherParticipant && (
            <>
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {otherParticipant.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {otherParticipant.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {otherParticipant.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === 'current-user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 ${
                message.senderId === 'current-user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">{formatTime(message.timestamp)}</span>
                {message.senderId === 'current-user' && (
                  <span className="text-xs">
                    {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '✓✓✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              disabled={sending}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-2 rounded-full"
            size="sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
