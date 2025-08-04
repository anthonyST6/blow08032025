import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCardProps } from '../types';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  trend,
  icon,
  color = 'primary',
  sparkline,
  loading = false,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      case 'neutral':
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    
    if (trend === 'up') {
      return change.value >= 0 ? 'text-green-600' : 'text-red-600';
    } else if (trend === 'down') {
      return change.value >= 0 ? 'text-red-600' : 'text-green-600';
    }
    return 'text-gray-600';
  };

  const getColorClasses = () => {
    const colors = {
      primary: 'border-indigo-200 bg-indigo-50',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      danger: 'border-red-200 bg-red-50',
    };
    return colors[color];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow p-6 border ${getColorClasses()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">
          {formatValue(value)}
        </p>
        {unit && (
          <span className="ml-2 text-sm text-gray-500">{unit}</span>
        )}
      </div>

      {change && (
        <div className={`flex items-center mt-2 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1">
            {change.value > 0 ? '+' : ''}{change.value}%
          </span>
          <span className="ml-1 text-gray-500">
            {change.period}
          </span>
        </div>
      )}

      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 h-12">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${sparkline.length * 10} 48`}
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-indigo-500"
              points={sparkline
                .map((val, i) => {
                  const max = Math.max(...sparkline);
                  const min = Math.min(...sparkline);
                  const y = 48 - ((val - min) / (max - min)) * 48;
                  return `${i * 10},${y}`;
                })
                .join(' ')}
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};