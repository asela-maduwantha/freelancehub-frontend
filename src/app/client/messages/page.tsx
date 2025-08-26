"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/context/toast-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter,
  User,
  Clock,
  Paperclip,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Video,
  Phone,
  CheckCheck,
  Check
} from "lucide-react";
import Link from "next/link";
import api from "@/api/axios-instance";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "CLIENT" | "FREELANCER";
  content: string;
  messageType: "TEXT" | "FILE" | "SYSTEM";
  attachments?: {
    id: string;
    filename: string;
    fileUrl: string;
    fileType: string;
  }[];
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
}

interface Conversation {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  status: "ACTIVE" | "ARCHIVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

interface MessageFilters {
  search: string;
  status: string;
  unreadOnly: boolean;
  pinnedOnly: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filters, setFilters] = useState<MessageFilters>({
    search: "",
    status: "all",
    unreadOnly: false,
    pinnedOnly: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [filters]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/messages/conversations", {
        params: {
          search: filters.search || undefined,
          status: filters.status !== "all" ? filters.status : undefined,
          unread_only: filters.unreadOnly || undefined,
          pinned_only: filters.pinnedOnly || undefined,
        },
      });
      setConversations((response.data as any)?.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages((response.data as any)?.messages || []);
      
      // Mark messages as read
      await api.patch(`/messages/conversations/${conversationId}/read`);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await api.post(`/messages/conversations/${selectedConversation.id}/messages`, {
        content: newMessage,
        messageType: "TEXT",
      });

      const newMsg = (response.data as any)?.message;
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");

      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: newMsg, updatedAt: newMsg.timestamp }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const togglePin = async (conversationId: string) => {
    try {
      await api.patch(`/messages/conversations/${conversationId}/pin`);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, isPinned: !conv.isPinned }
            : conv
        )
      );
      toast.success("Conversation updated");
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      toast.error("Failed to update conversation");
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      await api.patch(`/messages/conversations/${conversationId}/archive`);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, isArchived: !conv.isArchived }
            : conv
        )
      );
      toast.success("Conversation archived");
    } catch (error) {
      console.error("Failed to archive conversation:", error);
      toast.error("Failed to archive conversation");
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString();
    }
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: "#f9fafb" }}
      onClick={() => setSelectedConversation(conversation)}
      className={`p-4 cursor-pointer border-b transition-colors ${
        selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {conversation.freelancerName.charAt(0).toUpperCase()}
          </div>
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {conversation.unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.freelancerName}
            </h3>
            <div className="flex items-center gap-1">
              {conversation.isPinned && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              <span className="text-xs text-gray-500">
                {formatMessageTime(conversation.lastMessage.timestamp)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-1">
            {conversation.projectTitle}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 truncate">
              {conversation.lastMessage.content}
            </p>
            <div className="flex items-center gap-1">
              {conversation.lastMessage.isRead ? (
                <CheckCheck className="h-4 w-4 text-blue-500" />
              ) : (
                <Check className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwnMessage = message.senderType === "CLIENT";
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
      >
        <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-sm">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-xs">{attachment.filename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
            {formatMessageTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold mb-4">Messages</h1>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              
              <Button
                variant={filters.unreadOnly ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, unreadOnly: !prev.unreadOnly }))}
              >
                Unread
              </Button>
              
              <Button
                variant={filters.pinnedOnly ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, pinnedOnly: !prev.pinnedOnly }))}
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto h-full">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-500">Start a project to begin messaging with freelancers</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConversation.freelancerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.freelancerName}</h3>
                  <p className="text-sm text-gray-500">{selectedConversation.projectTitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
