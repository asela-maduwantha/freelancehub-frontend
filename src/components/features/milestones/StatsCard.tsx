'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-gradient-to-br',
    green: 'from-green-500 to-green-600 bg-gradient-to-br',
    yellow: 'from-yellow-500 to-yellow-600 bg-gradient-to-br',
    purple: 'from-purple-500 to-purple-600 bg-gradient-to-br',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
          </div>
          <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
