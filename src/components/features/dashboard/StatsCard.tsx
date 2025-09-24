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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary">{title}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
        </div>
        <div className={`flex items-center ${isPositive ? 'text-orange-500' : 'text-error'}`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="ml-1 text-sm font-medium">{change}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;