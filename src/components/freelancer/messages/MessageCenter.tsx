'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  Archive,
  Star,
  Trash2,
  Download,
  Image as ImageIcon,
  File,
  User,
  Clock,
  Check,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { messageApi, Message, Conversation } from '@/lib/api/messages';
import { toast } from '@/context/toast-context';

export function MessageCenter() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await messageApi.getConversations({
        page: 1,
        limit: 50
      });
      
      // Handle case where response might be undefined
      const conversations = response?.conversations || [];
      setConversations(conversations);
      
      // Select first conversation if none selected
      if (!selectedConversation && conversations.length > 0) {
        setSelectedConversation(conversations[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await messageApi.getMessages(conversationId, {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'asc'
      });
      setMessages(response?.messages || []);
      
      // TODO: Mark conversation as read when API is available
      // await messageApi.markConversationAsRead(conversationId);
      
      // Update conversation in the list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    setSendingMessage(true);
    try {
      const messageData = {
        receiverId: getOtherParticipant(selectedConversation)._id,
        conversationId: selectedConversation._id,
        content: newMessage.trim(),
        messageType: 'text' as const
      };
      
      const response = await messageApi.sendMessage(messageData);
      
      // Add message to local state immediately
      const newMsg: Message = {
        ...(response?.data || {}),
        sender: {
          _id: user.id || '',
          firstName: (user as any)?.firstName || user.name || '',
          lastName: (user as any)?.lastName || '',
          profilePicture: (user as any)?.profilePicture || (user as any)?.image || undefined
        }
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Update last message in conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: newMsg, updatedAt: new Date() }
            : conv
        )
      );
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participantDetails?.find(p => p._id !== user?.id) || {
      _id: '',
      firstName: 'Unknown',
      lastName: 'User',
      profilePicture: undefined
    };
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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
      day: 'numeric'
    });
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== user?.id) return null;
    
    if (message.readAt) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const otherParticipant = getOtherParticipant(conv);
    const name = `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    const lastMessage = conv.lastMessage?.content?.toLowerCase() || '';
    
    return name.includes(searchQuery.toLowerCase()) || 
           lastMessage.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const isSelected = selectedConversation?._id === conversation._id;
                  
                  return (
                    <motion.div
                      key={conversation._id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-green-50 border-r-2 border-green-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={otherParticipant.profilePicture || '/api/placeholder/48/48'}
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant.firstName} {otherParticipant.lastName}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </p>
                            )}
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          
                          {conversation.projectId && (
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary" className="text-xs">
                                Project Discussion
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getOtherParticipant(selectedConversation).profilePicture || '/api/placeholder/40/40'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getOtherParticipant(selectedConversation).firstName} {getOtherParticipant(selectedConversation).lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.projectId ? 'Project Discussion' : 'Direct Message'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showDate = index === 0 || 
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                    
                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center mb-4">
                            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {message.messageType === 'text' ? (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              ) : message.messageType === 'file' ? (
                                <div className="flex items-center space-x-2">
                                  <File className="w-4 h-4" />
                                  <span className="text-sm">File attachment</span>
                                </div>
                              ) : message.messageType === 'image' ? (
                                <div className="flex items-center space-x-2">
                                  <ImageIcon className="w-4 h-4" />
                                  <span className="text-sm">Image attachment</span>
                                </div>
                              ) : null}
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black bg-opacity-10 rounded p-2">
                                      <span className="text-xs truncate">{attachment.fileName}</span>
                                      <Button variant="ghost" size="sm">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                              {getMessageStatus(message)}
                            </div>
                          </div>
                          
                          {!isOwn && (
                            <img
                              src={message.sender?.profilePicture || '/api/placeholder/32/32'}
                              alt="Sender"
                              className="w-8 h-8 rounded-full object-cover order-1 mr-2"
                            />
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-12"
                    />
                  </div>
                  
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  // TODO: Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
    </div>
  );
}
