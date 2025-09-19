import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = ''
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'bg-gray-50 border-gray-200 text-[var(--color-text-body)]';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-[var(--color-accent)]" />;
      case 'info':
        return <Info size={20} className="text-[var(--color-primary)]" />;
      default:
        return <Info size={20} className="text-[var(--color-text-body)]" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getAlertStyles()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-body)]"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;