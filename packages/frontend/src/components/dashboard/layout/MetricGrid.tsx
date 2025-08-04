import React from 'react';
import { MetricGridProps } from '../types';

export const MetricGrid: React.FC<MetricGridProps> = ({
  columns = 4,
  gap = 'md',
  children,
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  const getGap = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4';
      case 'md':
        return 'gap-6';
      case 'lg':
        return 'gap-8';
      default:
        return 'gap-6';
    }
  };

  return (
    <div className={`grid ${getGridCols()} ${getGap()}`}>
      {children}
    </div>
  );
};