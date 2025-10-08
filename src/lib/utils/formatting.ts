export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateObj);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Job Status helpers
export type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';

export const getJobStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'draft': 'Draft',
    'open': 'Open',
    'awaiting-contract': 'Awaiting Contract',
    'contracted': 'Contracted',
    'in-progress': 'In Progress',
    'under-review': 'Under Review',
    'completed': 'Completed',
    'closed': 'Closed',
    'cancelled': 'Cancelled',
  };
  return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export const getJobStatusBadgeVariant = (status: string): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    'draft': 'secondary',
    'open': 'success',
    'awaiting-contract': 'primary',
    'contracted': 'primary',
    'in-progress': 'warning',
    'under-review': 'warning',
    'completed': 'success',
    'closed': 'secondary',
    'cancelled': 'error',
  };
  return variants[status] || 'secondary';
};

export const getJobStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-600',
    'open': 'bg-green-100 text-green-600',
    'awaiting-contract': 'bg-blue-100 text-blue-600',
    'contracted': 'bg-purple-100 text-purple-600',
    'in-progress': 'bg-orange-100 text-orange-600',
    'under-review': 'bg-yellow-100 text-yellow-600',
    'completed': 'bg-green-100 text-green-600',
    'closed': 'bg-gray-100 text-gray-600',
    'cancelled': 'bg-red-100 text-red-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

// Platform Fee Calculation
export const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee

export interface PaymentBreakdown {
  contractAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  totalClientCharge: number;
  currency: string;
}

export const calculatePlatformFee = (contractAmount: number): number => {
  return contractAmount * (PLATFORM_FEE_PERCENTAGE / 100);
};

export const calculateTotalClientCharge = (contractAmount: number): number => {
  return contractAmount + calculatePlatformFee(contractAmount);
};

export const getPaymentBreakdown = (contractAmount: number, currency = 'USD'): PaymentBreakdown => {
  const platformFeeAmount = calculatePlatformFee(contractAmount);
  const totalClientCharge = contractAmount + platformFeeAmount;

  return {
    contractAmount,
    platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
    platformFeeAmount,
    totalClientCharge,
    currency,
  };
};