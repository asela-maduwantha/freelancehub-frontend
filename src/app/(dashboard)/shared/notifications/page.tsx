'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useNotifications } from '@/lib/hooks/useNotifications';
import NotificationItem from '@/components/common/Notifications/NotificationItem';
import NotificationFiltersComponent from '@/components/common/Notifications/NotificationFilters';
import { groupNotificationsByDate } from '@/lib/utils/notificationUtils';

export default function SharedNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    filters,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    updateFilters,
    refreshNotifications,
  } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications);

  // Handle select notification
  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n._id));
    }
  };

  // Handle mark selected as read
  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markMultipleAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedNotifications.length > 0) {
      if (
        window.confirm(
          `Are you sure you want to delete ${selectedNotifications.length} notification(s)?`
        )
      ) {
        for (const id of selectedNotifications) {
          await deleteNotification(id);
        }
        setSelectedNotifications([]);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  };

  // Clear selected when notifications change
  useEffect(() => {
    setSelectedNotifications((prev) =>
      prev.filter((id) => notifications.some((n) => n._id === id))
    );
  }, [notifications]);

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-1 text-sm text-gray-600">
                Stay updated with your latest activity
              </p>
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                <Bell size={18} />
                <span className="text-sm font-semibold">{unreadCount} unread</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Select All */}
              {notifications.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {selectedNotifications.length === notifications.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              )}

              {/* Mark Selected as Read */}
              {selectedNotifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkSelectedAsRead}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <CheckCheck size={16} />
                    Mark Read ({selectedNotifications.length})
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 size={16} />
                    Delete ({selectedNotifications.length})
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <CheckCheck size={16} />
                  Mark All Read
                </button>
              )}

              {/* Refresh */}
              <button
                onClick={refreshNotifications}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>

              {/* Toggle Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <NotificationFiltersComponent filters={filters} onChange={updateFilters} />
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-sm text-gray-600">
                  {filters.isRead !== undefined || filters.type
                    ? 'No notifications match your filters'
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
              <div key={dateGroup}>
                {/* Date Group Header */}
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{dateGroup}</h2>

                {/* Notifications in Group */}
                <div className="space-y-3">
                  {groupNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      isSelected={selectedNotifications.includes(notification._id)}
                      onSelect={handleSelectNotification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      showCheckbox={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {notifications.length > 0 && notifications.length >= (filters.limit || 10) && (
          <div className="text-center">
            <button
              onClick={() => updateFilters({ ...filters, limit: (filters.limit || 10) + 10 })}
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}