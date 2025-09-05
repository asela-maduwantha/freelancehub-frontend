import { useState } from 'react';

export const useClientLayoutState = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return {
    sidebarCollapsed,
    isMobileMenuOpen,
    notifications,
    setMobileMenuOpen,
    toggleSidebar,
    setNotifications
  };
};
