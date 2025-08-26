'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  Check,
  Filter,
  Settings,
  MoreVertical,
  Clock,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Notification {
  _id: string;
  type: 'message' | 'proposal' | 'payment' | 'system' | 'contract' | 'review';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  relatedEntity?: {
    id: string;
    type: 'project' | 'contract' | 'message' | 'proposal';
    title: string;
  };
  actionRequired: boolean;
  expiresAt?: string;
  metadata?: {
    amount?: number;
    clientName?: string;
    projectTitle?: string;
  };
}

interface NotificationPreferences {
  email: {
    messages: boolean;
    proposals: boolean;
    payments: boolean;
    system: boolean;
    marketing: boolean;
  };
  push: {
    messages: boolean;
    proposals: boolean;
    payments: boolean;
    system: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // This would be the actual API call
      // const response = await notificationsApi.getMyNotifications();
      // setNotifications(response.data);

      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          _id: '1',
          type: 'message',
          title: 'New Message from TechCorp',
          message: 'You have received a new message regarding the e-commerce project.',
          isRead: false,
          priority: 'high',
          createdAt: new Date().toISOString(),
          relatedEntity: {
            id: 'msg1',
            type: 'message',
            title: 'Project Discussion'
          },
          actionRequired: true,
          metadata: {
            clientName: 'TechCorp Inc.'
          }
        },
        {
          _id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'You have received a payment of $2,500 for the completed milestone.',
          isRead: false,
          priority: 'medium',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionRequired: false,
          metadata: {
            amount: 2500,
            clientName: 'StartupXYZ'
          }
        },
        {
          _id: '3',
          type: 'proposal',
          title: 'Proposal Accepted',
          message: 'Congratulations! Your proposal for "Mobile App Development" has been accepted.',
          isRead: true,
          priority: 'high',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          relatedEntity: {
            id: 'prop1',
            type: 'proposal',
            title: 'Mobile App Development'
          },
          actionRequired: true,
          metadata: {
            projectTitle: 'Mobile App Development',
            clientName: 'InnovateTech'
          }
        },
        {
          _id: '4',
          type: 'system',
          title: 'Profile Verification Required',
          message: 'Please verify your identity to maintain your freelancer status.',
          isRead: false,
          priority: 'urgent',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          actionRequired: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          type: 'review',
          title: 'New Review Received',
          message: 'You have received a 5-star review from a satisfied client.',
          isRead: true,
          priority: 'low',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          actionRequired: false,
          metadata: {
            clientName: 'GlobalCorp'
          }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      // This would be the actual API call
      // const response = await notificationsApi.getPreferences();
      // setPreferences(response.data);

      // Mock preferences
      const mockPreferences: NotificationPreferences = {
        email: {
          messages: true,
          proposals: true,
          payments: true,
          system: true,
          marketing: false
        },
        push: {
          messages: true,
          proposals: true,
          payments: true,
          system: false
        },
        frequency: 'immediate',
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00'
        }
      };

      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      // await notificationsApi.deleteMultiple(selectedNotifications);
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      // await notificationsApi.updatePreferences(newPreferences);
      setPreferences(newPreferences);
      setShowPreferences(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         notification.type === selectedFilter ||
                         (selectedFilter === 'unread' && !notification.isRead) ||
                         (selectedFilter === 'action' && notification.actionRequired);
    return matchesSearch && matchesFilter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'proposal': return <FileText className="w-5 h-5" />;
      case 'system': return <AlertCircle className="w-5 h-5" />;
      case 'contract': return <FileText className="w-5 h-5" />;
      case 'review': return <User className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      case 'proposal': return 'bg-purple-500';
      case 'system': return 'bg-red-500';
      case 'contract': return 'bg-yellow-500';
      case 'review': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex space-x-4 mt-4 lg:mt-0">
          {selectedNotifications.length > 0 && (
            <Button
              variant="outline"
              onClick={deleteSelected}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedNotifications.length})</span>
            </Button>
          )}

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setShowPreferences(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'action', label: 'Action Required', count: notifications.filter(n => n.actionRequired).length },
            { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
            { key: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
            { key: 'proposal', label: 'Proposals', count: notifications.filter(n => n.type === 'proposal').length },
            { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? 'primary' : 'outline'}
              onClick={() => setSelectedFilter(filter.key)}
              className="text-sm"
            >
              {filter.label} {filter.count > 0 && `(${filter.count})`}
            </Button>
          ))}
        </div>

        <div className="relative">
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Notifications List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You\'re all caught up!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div key={notification._id} variants={itemVariants}>
              <Card className={`hover:shadow-md transition-all duration-200 ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification._id]);
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification._id));
                        }
                      }}
                      className="mt-1"
                    />

                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      <div className="text-white">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {notification.actionRequired && (
                              <Badge variant="warning">Action Required</Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          
                          {notification.metadata && (
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                              {notification.metadata.clientName && (
                                <span>Client: {notification.metadata.clientName}</span>
                              )}
                              {notification.metadata.amount && (
                                <span>Amount: ${notification.metadata.amount.toLocaleString()}</span>
                              )}
                              {notification.metadata.projectTitle && (
                                <span>Project: {notification.metadata.projectTitle}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </div>
                            
                            {notification.expiresAt && (
                              <div className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                <span>Expires {formatTimeAgo(notification.expiresAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Mark Read
                            </Button>
                          )}

                          {notification.actionRequired && (
                            <Button size="sm" className="text-xs">
                              Take Action
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotification(notification._id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Preferences Modal */}
      {showPreferences && preferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="font-semibold mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(preferences.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => {
                          setPreferences(prev => prev ? {
                            ...prev,
                            email: { ...prev.email, [key]: e.target.checked }
                          } : null);
                        }}
                        className="toggle"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="font-semibold mb-4">Push Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(preferences.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => {
                          setPreferences(prev => prev ? {
                            ...prev,
                            push: { ...prev.push, [key]: e.target.checked }
                          } : null);
                        }}
                        className="toggle"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <h3 className="font-semibold mb-4">Notification Frequency</h3>
                <select
                  value={preferences.frequency}
                  onChange={(e) => {
                    setPreferences(prev => prev ? {
                      ...prev,
                      frequency: e.target.value as any
                    } : null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly Digest</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>

              {/* Quiet Hours */}
              <div>
                <h3 className="font-semibold mb-4">Quiet Hours</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Enable Quiet Hours</span>
                    <input
                      type="checkbox"
                      checked={preferences.quietHours.enabled}
                      onChange={(e) => {
                        setPreferences(prev => prev ? {
                          ...prev,
                          quietHours: { ...prev.quietHours, enabled: e.target.checked }
                        } : null);
                      }}
                      className="toggle"
                    />
                  </div>
                  
                  {preferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Time</label>
                        <input
                          type="time"
                          value={preferences.quietHours.startTime}
                          onChange={(e) => {
                            setPreferences(prev => prev ? {
                              ...prev,
                              quietHours: { ...prev.quietHours, startTime: e.target.value }
                            } : null);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">End Time</label>
                        <input
                          type="time"
                          value={preferences.quietHours.endTime}
                          onChange={(e) => {
                            setPreferences(prev => prev ? {
                              ...prev,
                              quietHours: { ...prev.quietHours, endTime: e.target.value }
                            } : null);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPreferences(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updatePreferences(preferences)}
                className="flex-1"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
