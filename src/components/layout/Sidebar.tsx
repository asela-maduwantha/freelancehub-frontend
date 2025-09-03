'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  CreditCard,
  Star,
  Scale,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userProfile: any;
  notifications: number;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: number;
  subItems?: NavItem[];
}

const freelancerNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/freelancer/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'projects',
    label: 'Find Work',
    href: '/freelancer/projects',
    icon: Search,
  },
  {
    id: 'proposals',
    label: 'My Proposals',
    href: '/freelancer/proposals',
    icon: FileText,
  },
  {
    id: 'contracts',
    label: 'Contracts',
    href: '/freelancer/contracts',
    icon: Briefcase,
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/freelancer/payments',
    icon: CreditCard,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    href: '/freelancer/reviews',
    icon: Star,
  },
  {
    id: 'disputes',
    label: 'Disputes',
    href: '/freelancer/disputes',
    icon: Scale,
  },
  {
    id: 'network',
    label: 'Network',
    href: '/freelancer/freelancers',
    icon: Users,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/freelancer/profile',
    icon: Settings,
  },
];

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  userProfile,
  notifications,
  onLogout
}: SidebarProps) {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === '/freelancer/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white border-r border-gray-200 shadow-sm flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex justify-center">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      {userProfile && (
        <div className="p-4 border-b border-gray-200">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <img 
                src="/user.jpg" 
                alt={userProfile.firstName} 
                className="h-10 w-10 rounded-full ring-2 ring-green-100" 
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.firstName} {userProfile.lastName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {userProfile.profile?.title || 'Freelancer'}
                </div>
                {userProfile.profile?.hourlyRate && (
                  <div className="text-xs text-green-600 font-semibold">
                    ${userProfile.profile.hourlyRate}/hr
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <img 
                src="/user.jpg" 
                alt={userProfile.firstName} 
                className="h-10 w-10 rounded-full ring-2 ring-green-100" 
              />
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {!isCollapsed && userProfile && (
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-green-600 font-medium">Active</div>
                  <div className="text-lg font-bold text-green-700">
                    {userProfile.stats?.activeProjects || 0}
                  </div>
                </div>
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-green-600 font-medium">Earned</div>
                  <div className="text-lg font-bold text-green-700">
                    ${(userProfile.stats?.totalEarnings || 0).toLocaleString()}
                  </div>
                </div>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {freelancerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-green-100 text-green-700 border-l-4 border-green-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : ''}`} />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/freelancer/notifications">
          <motion.div
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            className={`
              flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
              text-gray-600 hover:bg-gray-50 hover:text-gray-900
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium">Notifications</span>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`
            w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50
            ${isCollapsed ? 'px-0 justify-center' : ''}
          `}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </motion.div>
  );
}
