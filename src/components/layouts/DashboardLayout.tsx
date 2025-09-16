'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  CreditCard,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  FileText,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import Sidebar from '../common/Sidebar/Sidebar';
import Button from '../ui/Button';
import { authService } from '../../lib/api/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'freelancer' | 'client';
  userName?: string;
  userAvatar?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
  userName = 'User',
  userAvatar
}) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side
      router.push('/login');
    }
  };

  // Define sidebar items based on user role
  const getSidebarItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        href: `/${userRole}/dashboard`,
        isActive: true
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: <MessageSquare size={20} />,
        href: '/messages',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <User size={20} />,
        href: '/profile',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={20} />,
        href: '/settings',
      }
    ];

    if (userRole === 'client') {
      return [
        ...baseItems.slice(0, 1),
        {
          id: 'create-job',
          label: 'Post a Job',
          icon: <Plus size={20} />,
          href: '/jobs/create',
        },
        {
          id: 'jobs',
          label: 'My Jobs',
          icon: <Briefcase size={20} />,
          href: '/jobs/my-jobs',
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: <FileText size={20} />,
          href: '/contracts',
        },
        {
          id: 'proposals',
          label: 'Proposals',
          icon: <FileText size={20} />,
          href: '/proposals',
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: <CreditCard size={20} />,
          href: '/payments',
        },
        ...baseItems.slice(1)
      ];
    } else {
      // Freelancer
      return [
        ...baseItems.slice(0, 1),
        {
          id: 'browse-jobs',
          label: 'Browse Projects',
          icon: <Search size={20} />,
          href: '/browse-projects',
        },
        {
          id: 'proposals',
          label: 'My Proposals',
          icon: <FileText size={20} />,
          href: '/proposals',
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: <FileText size={20} />,
          href: '/contracts',
        },
        {
          id: 'earnings',
          label: 'Earnings',
          icon: <TrendingUp size={20} />,
          href: '/payments/earnings',
        },
        ...baseItems.slice(1)
      ];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-green-800 border-b border-green-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and role indicator */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-bold text-white">Frevo</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-green-200">|</span>
              <span className="text-sm font-medium text-green-100 capitalize">
                {userRole} Dashboard
              </span>
            </div>
          </div>

          {/* Right side - User menu and actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {userRole === 'client' ? (
                <Link href="/jobs/create">
                  <Button variant="primary" size="sm">
                    <Plus size={16} className="mr-2" />
                    Post Job
                  </Button>
                </Link>
              ) : (
                <Link href="/browse-projects">
                  <Button variant="primary" size="sm">
                    <Search size={16} className="mr-2" />
                    Find Work
                  </Button>
                </Link>
              )}
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell size={20} />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-green-200 capitalize">{userRole}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-green-200 hover:text-white rounded-lg hover:bg-green-700"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:block"
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;