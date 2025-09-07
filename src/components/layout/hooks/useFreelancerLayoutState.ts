import { useState } from 'react';

export const useFreelancerLayoutState = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Default to 3 for freelancer

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
