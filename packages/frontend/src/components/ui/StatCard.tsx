import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'security' | 'integrity' | 'accuracy';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  trend,
  loading = false,
  className = '',
}) => {
  const variantStyles = {
    default: 'border-white/10',
    security: 'border-vanguard-security/30 hover:border-vanguard-security/50 hover:shadow-glow-blue',
    integrity: 'border-vanguard-integrity/30 hover:border-vanguard-integrity/50 hover:shadow-glow-red',
    accuracy: 'border-vanguard-accuracy/30 hover:border-vanguard-accuracy/50 hover:shadow-glow-green',
  };

  const iconColors = {
    default: 'text-seraphim-gold',
    security: 'text-vanguard-security',
    integrity: 'text-vanguard-integrity',
    accuracy: 'text-vanguard-accuracy',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const determineTrend = () => {
    if (trend) return trend;
    if (change === undefined || change === 0) return 'neutral';
    return change > 0 ? 'up' : 'down';
  };

  const currentTrend = determineTrend();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={className}
    >
      <Card
        variant="glass"
        className={`${variantStyles[variant]} transition-all duration-300`}
      >
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-seraphim-text-dim">{title}</p>
              
              {loading ? (
                <div className="mt-2 h-8 w-24 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-seraphim-text">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              )}

              {change !== undefined && (
                <div className="mt-2 flex items-center space-x-1">
                  {currentTrend === 'up' ? (
                    <ArrowUpIcon className={`h-4 w-4 ${trendColors[currentTrend]}`} />
                  ) : currentTrend === 'down' ? (
                    <ArrowDownIcon className={`h-4 w-4 ${trendColors[currentTrend]}`} />
                  ) : null}
                  
                  <span className={`text-sm ${trendColors[currentTrend]}`}>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                  
                  {changeLabel && (
                    <span className="text-sm text-seraphim-text-dim">
                      {changeLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {Icon && (
              <div className={`p-3 rounded-lg bg-white/5 ${iconColors[variant]}`}>
                <Icon className="h-6 w-6" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default StatCard;