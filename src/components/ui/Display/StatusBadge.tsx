import React from 'react';
import Badge from './Badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          variant: 'warning' as const,
          icon: Clock,
          label: 'Pending'
        };
      case 'accepted':
        return {
          variant: 'success' as const,
          icon: CheckCircle,
          label: 'Accepted'
        };
      case 'rejected':
        return {
          variant: 'error' as const,
          icon: XCircle,
          label: 'Rejected'
        };
      case 'withdrawn':
        return {
          variant: 'outline' as const,
          icon: AlertCircle,
          label: 'Withdrawn'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1.5 ${className}`}>
      {showIcon && <IconComponent className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;