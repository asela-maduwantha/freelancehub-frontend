'use client';

import { useState, useEffect, createContext, useContext } from 'react';
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
  FileText,
  Users,
  CreditCard,
  Target,
  PlusCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastProvider } from '@/components/ui/Toast';
import { authService } from '@/lib/api';

interface ClientLayoutProps {
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
  isNew?: boolean;
}

const ClientLayoutContext = createContext<LayoutContextType | null>(null);

export const useClientLayout = () => {
  const context = useContext(ClientLayoutContext);
  if (!context) {
    throw new Error('useClientLayout must be used within ClientLayout');
  }
  return context;
};

const clientNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/client/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & insights'
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/client/projects',
    icon: Briefcase,
    description: 'Manage your projects'
  },
  {
    id: 'freelancers',
    label: 'Find Talent',
    href: '/client/freelancers',
    icon: Users,
    description: 'Browse freelancers',
    isNew: true
  },
  {
    id: 'proposals',
    label: 'Proposals',
    href: '/client/proposals',
    icon: FileText,
    badge: 5,
    description: 'Review submissions'
  },
  {
    id: 'contracts',
    label: 'Contracts',
    href: '/client/contracts',
    icon: Target,
    description: 'Active agreements'
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/client/messages',
    icon: MessageSquare,
    badge: 8,
    description: 'Team communications'
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/client/payments',
    icon: CreditCard,
    description: 'Billing & invoices'
  },
  {
    id: 'profile',
    label: 'Company Profile',
    href: '/client/profile',
    icon: User,
    description: 'Edit company details'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/client/settings',
    icon: Settings,
    description: 'Account preferences'
  }
];

const ClientSidebar: React.FC<{
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
                {`${userProfile.firstName} ${userProfile.lastName}` || 'Client'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.companyName || 'Business Owner'}
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

const ClientHeader: React.FC<{
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

  const mockNotifications = [
    {
      id: 1,
      title: "New proposal received",
      message: "John Doe submitted a proposal for your project",
      time: "5 min ago",
      unread: true
    },
    {
      id: 2,
      title: "Project milestone completed",
      message: "Web Design project reached 75% completion",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 3,
      title: "Payment processed",
      message: "Payment of $500 has been processed successfully",
      time: "1 day ago",
      unread: false
    }
  ];

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

        {/* Search bar - enhanced for client needs */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, freelancers, messages..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link href="/client/projects/new">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </Link>
          </div>

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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <span className="text-sm text-green-600 cursor-pointer hover:underline">
                        Mark all read
                      </span>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <Link
                      href="/client/notifications"
                      className="block text-center text-sm text-green-600 hover:underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
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
                alt={`${userProfile?.firstName} ${userProfile?.lastName}` || 'User'}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {`${userProfile?.firstName} ${userProfile?.lastName}` || 'Client'}
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

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('ClientLayout: Checking authentication...');
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        console.log('ClientLayout: userData exists:', !!userData);
        console.log('ClientLayout: token exists:', !!token);
        
        if (userData && token) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('ClientLayout: User authenticated:', parsedUser.firstName || 'Unknown');
            
            // Verify the user has client role
            if (parsedUser.role && parsedUser.role.includes('client')) {
              setUser(parsedUser);
              setNotifications(8); // Mock data - clients typically have more notifications
            } else {
              console.log('ClientLayout: User does not have client role');
              router.push('/login');
              return;
            }
          } catch (parseError) {
            console.error('ClientLayout: Failed to parse user data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
        } else {
          console.log('ClientLayout: No valid authentication found, redirecting to login');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('ClientLayout: Authentication check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
      <ClientLayoutContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-50">
          {/* Desktop Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'} hidden lg:block`}>
            <ClientSidebar
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
                  <ClientSidebar
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
            <ClientHeader
              userProfile={user}
              notifications={notifications}
              onLogout={handleLogout}
              onMobileMenuToggle={() => setMobileMenuOpen(true)}
            />

            {/* Page Content */}
            <main className="min-h-[calc(100vh-4rem)]">
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
      </ClientLayoutContext.Provider>
    </ToastProvider>
  );
}
