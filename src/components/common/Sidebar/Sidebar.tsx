'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  isCollapsed = false,
  onToggle,
  className = ''
}) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Helper function to check if a route is active
  const isRouteActive = (href?: string) => {
    if (!href || !pathname) return false;
    
    // Normalize paths by removing trailing slashes
    const normalizedHref = href.replace(/\/$/, '');
    const normalizedPathname = pathname.replace(/\/$/, '');
    
    // Exact match for dashboard
    if (normalizedHref.endsWith('/dashboard')) {
      return normalizedPathname === normalizedHref;
    }
    
    // For other routes, check if pathname starts with href
    // Make sure we don't match partial segments (e.g., /jobs shouldn't match /jobs-archive)
    return normalizedPathname === normalizedHref || 
           normalizedPathname.startsWith(normalizedHref + '/');
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen ${isCollapsed ? 'w-16' : 'w-64'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-gray-700">Navigation</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors duration-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = item.isActive || isRouteActive(item.href);
            const hasActiveChild = item.children?.some(child => isRouteActive(child.href));
            
            return (
              <li key={item.id}>
                <div>
                  {item.children ? (
                    // Parent item with children
                    <>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
                          isActive || hasActiveChild
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                      >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                          {item.icon && (
                            <span className="flex-shrink-0">
                              {item.icon}
                            </span>
                          )}
                          {!isCollapsed && (
                            <span className="ml-3 text-sm font-medium">
                              {item.label}
                            </span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <span className="flex-shrink-0">
                            {expandedItems.has(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </button>
                      {/* Render children if expanded */}
                      {item.children && expandedItems.has(item.id) && !isCollapsed && (
                        <ul className="ml-3 mt-1 space-y-0.5 pl-6 border-l border-gray-200">
                          {item.children.map((child) => {
                            const isChildActive = isRouteActive(child.href);
                            return (
                              <li key={child.id}>
                                {child.href ? (
                                  <Link href={child.href}>
                                    <div
                                      className={`w-full flex items-center px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                                        isChildActive
                                          ? 'bg-blue-50 text-blue-700 font-medium'
                                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                      }`}
                                    >
                                      <span className="text-sm">
                                        {child.label}
                                      </span>
                                    </div>
                                  </Link>
                                ) : (
                                  <button
                                    onClick={child.onClick}
                                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-primary`}
                                  >
                                    <span className="text-sm">
                                      {child.label}
                                    </span>
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : item.href ? (
                    <Link href={item.href}>
                      <div
                        className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                      >
                        {item.icon && (
                          <span className="flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        {!isCollapsed && (
                          <span className="ml-3 text-sm font-medium">
                            {item.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                    >
                      {item.icon && (
                        <span className="flex-shrink-0">
                          {item.icon}
                        </span>
                      )}
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;