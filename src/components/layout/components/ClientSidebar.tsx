'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clientNavItems } from '../navigation/client-navigation';

interface ClientSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userProfile: any;
  notifications: number;
  onLogout: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  userProfile,
  notifications,
  onLogout,
  isMobile = false,
  onClose
}) => {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === '/client/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white border-r border-gray-200 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-indigo-50">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <Link href="/client/dashboard" className="flex items-center space-x-3" onClick={handleNavClick}>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-green-800 font-poppins">
                  FreelanceHub
                </span>
                <span className="text-xs text-green-600 font-medium">
                  Client Portal
                </span>
              </div>
            </Link>
          )}

          {isCollapsed && !isMobile && (
            <Link href="/client/dashboard" className="flex flex-col items-center">
              <span className="text-lg text-green-800 font-poppins font-bold">
                F
              </span>
              <span className="text-xs text-green-600 font-medium">
                C
              </span>
            </Link>
          )}

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          )}

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      {(!isCollapsed || isMobile) && userProfile && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={userProfile.avatar || '/user.jpg'}
                alt={`${userProfile.firstName} ${userProfile.lastName}` || 'User'}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500"
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {`${userProfile.name}` || 'Client'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.role || 'Business Owner'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-gray-100">
          <Link
            href="/client/projects/new"
            onClick={handleNavClick}
            className="w-full bg-gradient-to-r from-green-500 to-indigo-500 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200 group"
          >
            <PlusCircle className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
            <span className="font-medium">Post New Project</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {clientNavItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Link
                href={item.href}
                onClick={handleNavClick}
                className={`
                  group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative
                  ${isActive
                    ? 'bg-gradient-to-r from-green-500 to-indigo-500 text-white shadow-lg shadow-green-500/25'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }
                `}
              >
                <Icon className={`
                  ${isCollapsed ? 'mx-auto' : 'mr-4'} h-5 w-5 transition-colors
                  ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-green-500'}
                `} />

                {(!isCollapsed || isMobile) && (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{item.label}</span>
                        {item.isNew && (
                          <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      {item.description && !isActive && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    {item.badge && (
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold leading-none rounded-full ${
                        isActive
                          ? 'bg-white text-green-600'
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {isCollapsed && !isMobile && item.badge && (
                  <span className="absolute left-8 top-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}

                {isCollapsed && !isMobile && item.isNew && (
                  <span className="absolute left-8 top-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-orange-500 rounded-full">
                    !
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-3 border-t border-gray-100">
        <Button
          onClick={onLogout}
          variant="ghost"
          className={`
            w-full flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-start px-3 py-3'}
          `}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {(!isCollapsed || isMobile) && (
            <span className="font-medium">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
};
