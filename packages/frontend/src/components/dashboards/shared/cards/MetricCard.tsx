import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon 
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../../../ui/Card';
import { Badge } from '../../../Badge';
import { DashboardComponentProps, MetricCardData } from '../types';
import { EmptyStateWrapper } from '../EmptyStateWrapper';

interface MetricCardProps extends DashboardComponentProps {
  data: MetricCardData;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  showBadge?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  data,
  isLiveData,
  hasData,
  onDataRequest,
  className = '',
  size = 'medium',
  showTrend = true,
  showBadge = true,
  loading = false,
  error = null
}) => {
  const Icon = data.icon;
  const isPositive = (data.change || 0) >= 0;
  
  const getTrendIcon = () => {
    if (!data.trend || !showTrend) return null;
    
    switch (data.trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4" />;
      case 'stable':
        return <MinusIcon className="w-4 h-4" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-4';
      case 'large':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getValueSize = () => {
    switch (size) {
      case 'small':
        return 'text-xl';
      case 'large':
        return 'text-4xl';
      default:
        return 'text-2xl';
    }
  };

  const cardContent = (
    <Card 
      variant="gradient" 
      effect="shimmer"
      className={`metric-card ${className}`}
    >
      <CardContent className={getSizeClasses()}>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {Icon && (
                  <div className={`p-2 rounded-lg bg-${data.color || 'blue'}-500/20 mr-3`}>
                    <Icon className={`w-6 h-6 text-${data.color || 'blue'}-500`} />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">{data.title}</p>
                  <p className={`${getValueSize()} font-bold text-white`}>
                    {hasData ? data.value : '—'}
                    {data.unit && <span className="text-lg ml-1">{data.unit}</span>}
                  </p>
                </div>
              </div>
              
              {showBadge && isLiveData && (
                <Badge variant="info" size="small">
                  LIVE
                </Badge>
              )}
            </div>

            {showTrend && data.change !== undefined && hasData && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center text-sm ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {getTrendIcon()}
                  <span className="ml-1">
                    {isPositive ? '+' : ''}{data.change}%
                  </span>
                </div>
                {data.trend && (
                  <span className="text-xs text-gray-500 capitalize">
                    {data.trend} trend
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <EmptyStateWrapper
      hasData={hasData}
      onDataRequest={onDataRequest}
      config={{
        title: 'No Metric Data',
        description: `Ingest data to view ${data.title}`,
      }}
    >
      {cardContent}
    </EmptyStateWrapper>
  );
};

// Compound component for multiple metrics
interface MetricCardsGridProps {
  metrics: MetricCardData[];
  isLiveData: boolean;
  hasData: boolean;
  onDataRequest?: () => void;
  columns?: 2 | 3 | 4;
  size?: 'small' | 'medium' | 'large';
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  metrics,
  isLiveData,
  hasData,
  onDataRequest,
  columns = 4,
  size = 'medium'
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`grid ${getGridCols()} gap-4`}
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MetricCard
            data={metric}
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
            size={size}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};