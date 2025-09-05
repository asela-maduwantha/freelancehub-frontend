// Client Layout Types
export interface ClientLayoutProps {
  children: React.ReactNode;
}

export interface LayoutContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  user: any;
  notifications: number;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: number;
  description?: string;
  isNew?: boolean;
}

export interface DashboardStats {
  totalProjects: number;
  projectsByStatus: {
    open: number;
    'in-progress': number;
    completed: number;
    cancelled: number;
    disputed: number;
  };
  totalProposals: number;
}
