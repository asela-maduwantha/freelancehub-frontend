import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
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
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen ${isCollapsed ? 'w-16' : 'w-64'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-primary">Menu</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link href={item.href}>
                  <div
                    className={`w-full flex items-center px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer ${
                      item.isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
                  className={`w-full flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                    item.isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;