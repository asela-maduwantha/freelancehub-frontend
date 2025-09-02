'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'indigo' | 'orange';
  change?: {
    value: number;
    period: string;
  };
  onClick?: () => void;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    text: 'text-green-700'
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    text: 'text-blue-700'
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    text: 'text-purple-700'
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    text: 'text-yellow-700'
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    text: 'text-red-700'
  },
  indigo: {
    bg: 'bg-indigo-100',
    icon: 'text-indigo-600',
    text: 'text-indigo-700'
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
    text: 'text-orange-700'
  }
};

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  onClick 
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg
        ${onClick ? 'hover:shadow-md' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span 
                className={`text-xs font-medium ${
                  change.value >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.value >= 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {change.period}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
