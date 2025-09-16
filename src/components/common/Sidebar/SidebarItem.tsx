import React from 'react';

interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  href,
  className = ''
}) => {
  const baseStyles = 'flex items-center w-full px-3 py-2 rounded-md transition-colors text-sm font-medium';
  const activeStyles = isActive
    ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
    : 'text-gray-700 hover:bg-gray-100';

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 mr-3">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${activeStyles} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${activeStyles} ${className}`}
    >
      {content}
    </button>
  );
};

export default SidebarItem;