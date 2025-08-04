import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { ChartContainerProps } from '../types';

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  height = 400,
  loading = false,
  error,
  actions,
  children,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          {subtitle && <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>}
          <div className="bg-gray-100 rounded" style={{ height: `${height}px` }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div 
          className="flex flex-col items-center justify-center bg-red-50 rounded-lg"
          style={{ height: `${height}px` }}
        >
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-sm text-red-800 text-center max-w-md">
            {error.message || 'An error occurred while loading the chart'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
        <div style={{ height: `${height}px` }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};