import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const variantStyles = {
  default: 'bg-vanguard-blue',
  success: 'bg-vanguard-green',
  warning: 'bg-yellow-500',
  error: 'bg-vanguard-red',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = 'default',
  size = 'md',
  animated = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx('relative', className)}>
      <div
        className={clsx(
          'w-full bg-gray-800 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <motion.div
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            variantStyles[variant],
            animated && 'animate-pulse-subtle'
          )}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default Progress;