import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'create';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: IconComponent = FileText,
  action,
  variant = 'default',
  className = ''
}) => {
  const getVariantConfig = (variant: string) => {
    switch (variant) {
      case 'search':
        return {
          icon: Search,
          gradient: 'from-blue-400 to-purple-500',
          animation: 'bounce'
        };
      case 'create':
        return {
          icon: Plus,
          gradient: 'from-green-400 to-blue-500',
          animation: 'pulse'
        };
      default:
        return {
          icon: IconComponent,
          gradient: 'from-gray-400 to-gray-500',
          animation: 'float'
        };
    }
  };

  const config = getVariantConfig(variant);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`text-center py-16 px-6 ${className}`}
    >
      {/* Animated Icon Container */}
      <motion.div
        className={`relative mx-auto w-24 h-24 mb-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
        animate={
          config.animation === 'bounce'
            ? { y: [0, -10, 0] }
            : config.animation === 'pulse'
            ? { scale: [1, 1.1, 1] }
            : { y: [0, -5, 0] }
        }
        transition={{
          duration: config.animation === 'bounce' ? 2 : config.animation === 'pulse' ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-4 w-4 text-yellow-300" />
        </motion.div>

        <Icon className="h-10 w-10 text-white" />
      </motion.div>

      {/* Content */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl font-semibold text-gray-900 mb-3"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed"
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            variant="primary"
            onClick={action.onClick}
            className="px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {action.label}
          </Button>
        </motion.div>
      )}

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-2 h-2 bg-blue-200 rounded-full opacity-60"
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-20 right-16 w-1 h-1 bg-purple-200 rounded-full opacity-40"
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-green-200 rounded-full opacity-50"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
      />
    </motion.div>
  );
};

export default EmptyState;