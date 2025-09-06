'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import NotificationsPanel from '@/components/messaging/NotificationsPanel';

interface ClientHeaderProps {
  userProfile: any;
  notifications: number;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  userProfile,
  notifications,
  onLogout,
  onMobileMenuToggle
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center w-full">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </Button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>

            <NotificationsPanel
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNotificationClick={(notification) => {
                setShowNotifications(false);
                // Handle notification click - could navigate to relevant page
                console.log('Notification clicked:', notification);
              }}
            />
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img
                src={userProfile?.avatar || '/user.jpg'}
                alt={`${userProfile?.name}` || 'User'}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {`${userProfile?.name}` || 'Client'}
              </span>
            </Button>

            {/* Profile dropdown menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <Link
                    href="/client/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Company Profile
                  </Link>
                  <Link
                    href="/client/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/client/billing"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Billing
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showProfileDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};
