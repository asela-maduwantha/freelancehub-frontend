'use client';

import { createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from '@/components/ui/Toast';
import { authService } from '@/lib/api';
import { ClientLayoutProps, LayoutContextType } from '@/lib/types';
import { useClientAuth } from './hooks/useClientAuth';
import { useClientLayoutState } from './hooks/useClientLayoutState';
import { ClientSidebar } from './components/ClientSidebar';
import { ClientHeader } from './components/ClientHeader';

const ClientLayoutContext = createContext<LayoutContextType | null>(null);

export const useClientLayout = () => {
  const context = useContext(ClientLayoutContext);
  if (!context) {
    throw new Error('useClientLayout must be used within ClientLayout');
  }
  return context;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user, isLoading } = useClientAuth();
  const {
    sidebarCollapsed,
    isMobileMenuOpen,
    notifications,
    setMobileMenuOpen,
    toggleSidebar,
    setNotifications
  } = useClientLayoutState();

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.href = '/login';
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
              onNotificationsCountChange={setNotifications}
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
