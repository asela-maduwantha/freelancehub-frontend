'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { NotificationType } from '@/types/notifications';
import type { NotificationFilters } from '@/types/notifications';
import { getNotificationTypeLabel } from '@/lib/utils/notificationUtils';

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onChange: (filters: NotificationFilters) => void;
}

export const NotificationFiltersComponent: React.FC<NotificationFiltersProps> = ({
  filters,
  onChange,
}) => {
  const handleFilterChange = (field: keyof NotificationFilters, value: any) => {
    onChange({ ...filters, [field]: value, page: 1 }); // Reset to page 1 when filters change
  };

  const notificationTypes = Object.values(NotificationType);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.isRead === undefined ? '' : filters.isRead.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange(
                'isRead',
                value === '' ? undefined : value === 'true'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Notifications</option>
            <option value="false">Unread Only</option>
            <option value="true">Read Only</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            id="type-filter"
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Types</option>
            <optgroup label="Proposals">
              <option value={NotificationType.PROPOSAL_RECEIVED}>
                {getNotificationTypeLabel(NotificationType.PROPOSAL_RECEIVED)}
              </option>
              <option value={NotificationType.PROPOSAL_ACCEPTED}>
                {getNotificationTypeLabel(NotificationType.PROPOSAL_ACCEPTED)}
              </option>
              <option value={NotificationType.PROPOSAL_REJECTED}>
                {getNotificationTypeLabel(NotificationType.PROPOSAL_REJECTED)}
              </option>
            </optgroup>
            <optgroup label="Contracts">
              <option value={NotificationType.CONTRACT_CREATED}>
                {getNotificationTypeLabel(NotificationType.CONTRACT_CREATED)}
              </option>
              <option value={NotificationType.CONTRACT_COMPLETED}>
                {getNotificationTypeLabel(NotificationType.CONTRACT_COMPLETED)}
              </option>
              <option value={NotificationType.CONTRACT_CANCELLED}>
                {getNotificationTypeLabel(NotificationType.CONTRACT_CANCELLED)}
              </option>
            </optgroup>
            <optgroup label="Milestones">
              <option value={NotificationType.MILESTONE_CREATED}>
                {getNotificationTypeLabel(NotificationType.MILESTONE_CREATED)}
              </option>
              <option value={NotificationType.MILESTONE_SUBMITTED}>
                {getNotificationTypeLabel(NotificationType.MILESTONE_SUBMITTED)}
              </option>
              <option value={NotificationType.MILESTONE_APPROVED}>
                {getNotificationTypeLabel(NotificationType.MILESTONE_APPROVED)}
              </option>
              <option value={NotificationType.MILESTONE_REJECTED}>
                {getNotificationTypeLabel(NotificationType.MILESTONE_REJECTED)}
              </option>
            </optgroup>
            <optgroup label="Payments">
              <option value={NotificationType.PAYMENT_RECEIVED}>
                {getNotificationTypeLabel(NotificationType.PAYMENT_RECEIVED)}
              </option>
              <option value={NotificationType.PAYMENT_SENT}>
                {getNotificationTypeLabel(NotificationType.PAYMENT_SENT)}
              </option>
              <option value={NotificationType.PAYMENT_REFUNDED}>
                {getNotificationTypeLabel(NotificationType.PAYMENT_REFUNDED)}
              </option>
            </optgroup>
            <optgroup label="Other">
              <option value={NotificationType.MESSAGE_RECEIVED}>
                {getNotificationTypeLabel(NotificationType.MESSAGE_RECEIVED)}
              </option>
              <option value={NotificationType.REVIEW_RECEIVED}>
                {getNotificationTypeLabel(NotificationType.REVIEW_RECEIVED)}
              </option>
              <option value={NotificationType.DISPUTE_CREATED}>
                {getNotificationTypeLabel(NotificationType.DISPUTE_CREATED)}
              </option>
              <option value={NotificationType.DISPUTE_RESOLVED}>
                {getNotificationTypeLabel(NotificationType.DISPUTE_RESOLVED)}
              </option>
            </optgroup>
          </select>
        </div>

        {/* Items Per Page */}
        <div>
          <label htmlFor="limit-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Items per page
          </label>
          <select
            id="limit-filter"
            value={filters.limit || 10}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.isRead !== undefined || filters.type) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {filters.isRead !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {filters.isRead ? 'Read' : 'Unread'}
                <button
                  onClick={() => handleFilterChange('isRead', undefined)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                {getNotificationTypeLabel(filters.type as NotificationType)}
                <button
                  onClick={() => handleFilterChange('type', undefined)}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={() => onChange({ page: 1, limit: filters.limit || 10 })}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFiltersComponent;
