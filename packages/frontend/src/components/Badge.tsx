import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const variantStyles = {
  primary: 'bg-seraphim-gold/20 text-seraphim-gold border-seraphim-gold/30',
  secondary: 'bg-gray-700/50 text-gray-300 border-gray-600',
  success: 'bg-vanguard-green/20 text-vanguard-green border-vanguard-green/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-vanguard-red/20 text-vanguard-red border-vanguard-red/30',
  info: 'bg-vanguard-blue/20 text-vanguard-blue border-vanguard-blue/30',
};

const sizeStyles = {
  small: 'text-xs px-2 py-0.5',
  medium: 'text-sm px-2.5 py-1',
  large: 'text-base px-3 py-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'medium',
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;