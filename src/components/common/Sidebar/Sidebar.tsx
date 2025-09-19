import React from 'react';
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
    <div className={`nav-emerald border-r border-emerald transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-text-white">Menu</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md bg-primary hover:bg-primary-hover text-text-white transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={item.onClick}
                className={`w-full flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  item.isActive
                    ? 'text-text-white bg-primary font-medium'
                    : 'text-text-white hover:text-accent hover:bg-primary-hover'
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
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;