'use client';

import { useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  Briefcase,
  MessageSquare,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Star,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastProvider } from '@/components/ui/Toast';
import { authService } from '@/lib/api';
import { useFreelancerAuth } from './hooks/useFreelancerAuth';
import { useFreelancerLayoutState } from './hooks/useFreelancerLayoutState';

interface FreelancerLayoutProps {
  children: React.ReactNode;
}

interface LayoutContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  user: any;
  notifications: number;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: number;
  description?: string;
}

const FreelancerLayoutContext = createContext<LayoutContextType | null>(null);

export const useFreelancerLayout = () => {
  const context = useContext(FreelancerLayoutContext);
  if (!context) {
    throw new Error('useFreelancerLayout must be used within FreelancerLayout');
  }
  return context;
};

const freelancerNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/freelancer/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & quick stats'
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/freelancer/profile',
    icon: User,
    description: 'Edit details & portfolio'
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/freelancer/projects',
    icon: Briefcase,
    description: 'Active & available gigs'
  },
  {
    id: 'proposals',
    label: 'Proposals',
    href: '/freelancer/proposals',
    icon: FileText,
    description: 'Track sent proposals'
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/freelancer/messages',
    icon: MessageSquare,
    badge: 3,
    description: 'Client communications'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    href: '/freelancer/payments',
    icon: DollarSign,
    description: 'Payments & reports'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    href: '/freelancer/reviews',
    icon: Star,
    description: 'Client feedback'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/freelancer/settings',
    icon: Settings,
    description: 'Account preferences'
  }
];

const FreelancerSidebar: React.FC<{
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userProfile: any;
  notifications: number;
  onLogout: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}> = ({ 
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
    if (href === '/freelancer/dashboard') {
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
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <Link href="/freelancer/dashboard" className="flex items-center space-x-3" onClick={handleNavClick}>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-green-800 font-poppins">
                  FreelanceHub
                </span>  
              </div>
            </Link>
          )}
          
          {isCollapsed && !isMobile && (
            <Link href="/freelancer/dashboard" className="flex flex-col items-center">
              <span className="text-lg text-green-800 font-poppins font-bold mt-1">
                F
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
                alt={`${userProfile.name}` || 'User'}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500"
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {`${userProfile.name}` || 'Freelancer'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.title || 'Professional Freelancer'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {freelancerNavItems.map((item) => {
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
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
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
                      <span className="font-semibold">{item.label}</span>
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

const FreelancerHeader: React.FC<{
  userProfile: any;
  notifications: number;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
}> = ({ 
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

        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, messages..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>
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

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                alt={`${userProfile.name}` || 'User'}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {`${userProfile.name}` || 'Freelancer'}
              </span>
            </Button>

            {/* Profile dropdown menu */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="py-2">
                    <Link
                      href="/freelancer/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/freelancer/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Settings
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
                </motion.div>
              )}
            </AnimatePresence>
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

export default function FreelancerLayout({ children }: FreelancerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useFreelancerAuth();
  const {
    sidebarCollapsed,
    isMobileMenuOpen,
    notifications,
    setMobileMenuOpen,
    toggleSidebar
  } = useFreelancerLayoutState();

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      router.push('/login');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const contextValue: LayoutContextType = {
    sidebarCollapsed,
    toggleSidebar,
    user,
    notifications,
    isMobileMenuOpen,
    setMobileMenuOpen
  };

  return (
    <ToastProvider>
      <FreelancerLayoutContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-50">
          {/* Desktop Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'} hidden lg:block`}>
            <FreelancerSidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebar}
              userProfile={user}
              notifications={notifications}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
                >
                  <FreelancerSidebar
                    isCollapsed={false}
                    onToggleCollapse={() => {}}
                    userProfile={user}
                    notifications={notifications}
                    onLogout={handleLogout}
                    isMobile={true}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
            {/* Header */}
            <FreelancerHeader
              userProfile={user}
              notifications={notifications}
              onLogout={handleLogout}
              onMobileMenuToggle={() => setMobileMenuOpen(true)}
            />

            {/* Page Content */}
            <main className="min-h-[calc(100vh-4rem)]"> {/* Adjusted for header height */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 lg:p-8"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </FreelancerLayoutContext.Provider>
    </ToastProvider>
  );
}
