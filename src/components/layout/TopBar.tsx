'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLayout } from './AppLayout';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const getPageTitle = (pathname: string): { title: string; breadcrumbs: BreadcrumbItem[] } => {
  const segments = pathname.split('/').filter(Boolean);
  
  const pageMap: Record<string, { title: string; breadcrumbs: BreadcrumbItem[] }> = {
    '/freelancer/dashboard': {
      title: 'Dashboard',
      breadcrumbs: [{ label: 'Dashboard' }]
    },
    '/freelancer/projects': {
      title: 'Find Work',
      breadcrumbs: [{ label: 'Find Work' }]
    },
    '/freelancer/proposals': {
      title: 'My Proposals',
      breadcrumbs: [{ label: 'My Proposals' }]
    },
    '/freelancer/contracts': {
      title: 'Contracts',
      breadcrumbs: [{ label: 'Contracts' }]
    },
    '/freelancer/payments': {
      title: 'Payments',
      breadcrumbs: [{ label: 'Payments' }]
    },
    '/freelancer/reviews': {
      title: 'Reviews',
      breadcrumbs: [{ label: 'Reviews' }]
    },
    '/freelancer/disputes': {
      title: 'Disputes',
      breadcrumbs: [{ label: 'Disputes' }]
    },
    '/freelancer/freelancers': {
      title: 'Network',
      breadcrumbs: [{ label: 'Network' }]
    },
    '/freelancer/profile': {
      title: 'Profile Settings',
      breadcrumbs: [{ label: 'Settings', href: '/freelancer/profile' }, { label: 'Profile' }]
    }
  };

  // Handle dynamic routes
  if (segments.length >= 3) {
    const basePath = `/${segments[0]}/${segments[1]}`;
    const baseInfo = pageMap[basePath];
    
    if (baseInfo) {
      if (segments[2] === 'new') {
        return {
          title: `New ${baseInfo.title.slice(0, -1)}`,
          breadcrumbs: [
            ...baseInfo.breadcrumbs,
            { label: 'New' }
          ]
        };
      } else if (segments.length === 3) {
        return {
          title: `${baseInfo.title.slice(0, -1)} Details`,
          breadcrumbs: [
            ...baseInfo.breadcrumbs,
            { label: 'Details' }
          ]
        };
      }
    }
  }

  return pageMap[pathname] || { title: 'FreelanceHub', breadcrumbs: [] };
};

export default function TopBar() {
  const pathname = usePathname();
  const { user, notifications } = useLayout();
  const { title, breadcrumbs } = getPageTitle(pathname);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Page Title & Breadcrumbs */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-900 font-poppins">
            {title}
          </h1>
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                    {crumb.label}
                  </span>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Search - only show on certain pages */}
          {(pathname.includes('/projects') || pathname.includes('/freelancers')) && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Help */}
            <Button variant="ghost" size="icon" className="relative">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.profile?.title || 'Freelancer'}
                </div>
              </div>
              <img 
                src="/user.jpg" 
                alt={user.firstName} 
                className="h-8 w-8 rounded-full ring-2 ring-green-100" 
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
