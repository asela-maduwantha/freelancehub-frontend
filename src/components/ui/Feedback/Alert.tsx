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
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-[var(--color-success)]" />;
      case 'error':
        return <XCircle size={20} className="text-[var(--color-error)]" />;
      case 'warning':
        return <AlertCircle size={20} className="text-[var(--accent)]" />;
      case 'info':
        return <Info size={20} className="text-[var(--color-primary)]" />;
      default:
        return <Info size={20} className="text-[var(--color-text-secondary)]" />;
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