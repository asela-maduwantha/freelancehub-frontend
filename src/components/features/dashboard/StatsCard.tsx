import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeType }) => {
  const isPositive = changeType === 'increase';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-blue-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{change}</p>
      </div>
    </div>
  );
};

export default StatsCard;