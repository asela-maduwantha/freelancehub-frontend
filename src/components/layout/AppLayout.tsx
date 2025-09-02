'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ToastProvider } from '@/components/ui/Toast';
import { authAPI } from '@/lib/api';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'freelancer' | 'client';
  showSidebar?: boolean;
}

interface LayoutContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  user: any;
  notifications: number;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within AppLayout');
  }
  return context;
};

export default function AppLayout({ 
  children, 
  userRole = 'freelancer', 
  showSidebar = true 
}: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check if we're on a public page (landing, auth pages)
  const isPublicPage = [
    '/',
    '/login',
    '/register',
    '/register/verify-otp',
    '/register/client',
    '/register/freelancer',
    '/register/almost-there',
    '/register/verify-email',
    '/onboarding'
  ].some(path => pathname.startsWith(path));

  useEffect(() => {
    // Load user data and check authentication
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        
        if (userData && token && !isPublicPage) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Load notifications count (you can implement this API)
          // const notifResponse = await notificationAPI.getCount();
          // setNotifications(notifResponse.count);
          setNotifications(3); // Mock data for now
        } else if (!isPublicPage) {
          // Redirect to login if not authenticated and trying to access protected page
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        if (!isPublicPage) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [pathname, router, isPublicPage]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.clear();
      router.push('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show loading spinner while checking authentication
  if (isLoading && !isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // For public pages, render without layout
  if (isPublicPage || !showSidebar) {
    return <>{children}</>;
  }

  const contextValue: LayoutContextType = {
    sidebarCollapsed,
    toggleSidebar,
    user,
    notifications
  };

  return (
    <ToastProvider>
      <LayoutContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
            <Sidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebar}
              userProfile={user}
              notifications={notifications}
              onLogout={handleLogout}
            />
          </div>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
            {/* Top Bar */}
            <TopBar />

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {children}
              </motion.div>
            </main>
          </div>

          {/* Mobile Sidebar Overlay */}
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}
        </div>
      </LayoutContext.Provider>
    </ToastProvider>
  );
}
