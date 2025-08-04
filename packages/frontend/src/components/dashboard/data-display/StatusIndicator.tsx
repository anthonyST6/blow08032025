import React from 'react';
import { motion } from 'framer-motion';
import { StatusIndicatorProps } from '../types';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  description,
  pulse = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'inactive':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'active':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      case 'inactive':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'inactive':
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`flex items-start p-4 rounded-lg ${getStatusBgColor()}`}>
      <div className="flex-shrink-0">
        <div className="relative">
          <div
            className={`h-3 w-3 rounded-full ${getStatusColor()}`}
            aria-hidden="true"
          />
          {pulse && status === 'active' && (
            <motion.div
              className={`absolute inset-0 h-3 w-3 rounded-full ${getStatusColor()}`}
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [1, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </div>
      </div>
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${getStatusTextColor()}`}>
          {label}
        </p>
        {description && (
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};