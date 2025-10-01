import React from 'react';
import { CreditCard, Trash2, Star, StarOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PaymentMethod } from '@/lib/api/payments';

// Simple Badge component
const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'secondary' | 'destructive';
  className?: string;
}> = ({ children, variant = 'secondary', className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantClasses = {
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isDefault?: boolean;
  onSetDefault?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isDefault = false,
  onSetDefault,
  onDelete,
  isLoading = false
}) => {
  const getBrandIcon = (brand: string) => {
    // You can add more brand icons as needed
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatCardNumber = (last4: string) => {
    return `•••• •••• •••• ${last4}`;
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const isExpired = () => {
    const now = new Date();
    const expiryDate = new Date(method.card.expYear, method.card.expMonth - 1);
    return expiryDate < now;
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isDefault
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    } ${isExpired() ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {getBrandIcon(method.card.brand)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)}
              </span>
              <span className="text-gray-600">
                {formatCardNumber(method.card.last4)}
              </span>
              {isDefault && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
              {isExpired() && (
                <Badge variant="destructive">
                  Expired
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Expires {formatExpiry(method.card.expMonth, method.card.expYear)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isDefault && onSetDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(method.id)}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <>
                  <StarOff className="w-3 h-3 mr-1" />
                  Set Default
                </>
              )}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(method.id)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Added {new Date(method.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export { PaymentMethodCard };