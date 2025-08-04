import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'glass' | 'glass-dark' | 'gradient' | 'security' | 'integrity' | 'accuracy';
  effect?: 'none' | 'glow' | 'shimmer' | 'float';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  effect = 'none',
  padding = 'md',
  onClick
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    primary: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
    secondary: 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600',
    danger: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    'glass-dark': 'bg-black/20 backdrop-blur-md border-white/10',
    gradient: 'bg-gradient-to-br from-seraphim-black via-gray-900 to-seraphim-black border-white/10',
    security: 'bg-vanguard-security/10 border-vanguard-security/30',
    integrity: 'bg-vanguard-integrity/10 border-vanguard-integrity/30',
    accuracy: 'bg-vanguard-accuracy/10 border-vanguard-accuracy/30'
  };

  const effectStyles = {
    none: '',
    glow: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
    shimmer: 'relative overflow-hidden',
    float: 'hover:-translate-y-1 transition-transform duration-300'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const cardContent = (
    <div 
      className={clsx(
        'rounded-lg border',
        variantStyles[variant],
        effectStyles[effect],
        paddingStyles[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {effect === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      {children}
    </div>
  );

  if (effect === 'float') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '',
  border = false 
}) => {
  return (
    <div className={clsx(
      border && 'border-b border-white/10 pb-4 mb-4',
      className
    )}>
      {children}
    </div>
  );
};

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-seraphim-text', className)}>
      {children}
    </h3>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Export StatCard and CardGrid from the same file for convenience
export { StatCard, CardGrid } from './StatCard';

export default Card;