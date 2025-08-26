'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Search, MoreVertical, Phone, Video, User, Archive, Trash2 } from 'lucide-react';
import { messageApi, type Message, type Conversation } from '@/lib/api/messages';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Image from 'next/image';

interface MessageDashboardProps {
  userId: string;
  selectedConversationId?: string;
}

export default function MessageDashboard({ userId, selectedConversationId }: MessageDashboardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find(c => c._id === selectedConversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(selectedConversationId);
      }
    }
  }, [selectedConversationId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getConversations();
      
      // Handle case where response might be undefined
      const conversations = response?.conversations || [];
      setConversations(conversations);
      
      if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await messageApi.getMessages(conversationId, {
        limit: 50,
        sortOrder: 'asc'
      });
      setMessages(response?.messages || []);
      
      // Mark messages as read
      await messageApi.markAsRead(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await messageApi.sendMessage({
        conversationId: selectedConversation._id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      if (response?.data) {
        setMessages(prev => [...prev, response.data]);
      }
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participantDetails?.find(p => p._id !== userId);
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const otherParticipant = getOtherParticipant(conversation);
    const isSelected = selectedConversation?._id === conversation._id;
    
    return (
      <div
        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="flex items-center space-x-3">
          {otherParticipant?.profilePicture ? (
            <Image
              src={otherParticipant.profilePicture}
              alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900 truncate">
                {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User'}
              </p>
              {conversation.lastMessage && (
                <span className="text-xs text-gray-500">
                  {formatTime(conversation.lastMessage.createdAt)}
                </span>
              )}
            </div>
            
            {conversation.project && (
              <p className="text-sm text-blue-600 truncate">
                {conversation.project.title}
              </p>
            )}
            
            {conversation.lastMessage && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {conversation.lastMessage.content}
              </p>
            )}
          </div>
          
          {conversation.unreadCount > 0 && (
            <Badge className="bg-blue-500 text-white">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.senderId === userId;
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No conversations yet</p>
            </div>
          ) : (
            conversations
              .filter(conv => {
                if (!searchTerm) return true;
                const otherParticipant = getOtherParticipant(conv);
                return otherParticipant && 
                  `${otherParticipant.firstName} ${otherParticipant.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
              })
              .map((conversation) => (
                <ConversationItem key={conversation._id} conversation={conversation} />
              ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const otherParticipant = getOtherParticipant(selectedConversation);
                    return (
                      <>
                        {otherParticipant?.profilePicture ? (
                          <Image
                            src={otherParticipant.profilePicture}
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User'}
                          </h3>
                          {selectedConversation.project && (
                            <p className="text-sm text-blue-600">
                              {selectedConversation.project.title}
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                    
                    return (
                      <React.Fragment key={message._id}>
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <MessageBubble message={message} />
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                  />
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
