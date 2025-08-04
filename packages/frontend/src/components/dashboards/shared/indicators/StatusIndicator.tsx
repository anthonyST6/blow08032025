import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { DashboardComponentProps, StatusIndicatorData } from '../types';
import { EmptyStateWrapper } from '../EmptyStateWrapper';

interface StatusIndicatorProps extends DashboardComponentProps {
  data: StatusIndicatorData | StatusIndicatorData[];
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  inline?: boolean;
}

const getStatusConfig = (status: StatusIndicatorData['status']) => {
  switch (status) {
    case 'success':
      return {
        icon: CheckCircleIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/50'
      };
    case 'warning':
      return {
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50'
      };
    case 'error':
      return {
        icon: XCircleIcon,
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50'
      };
    case 'info':
      return {
        icon: InformationCircleIcon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50'
      };
    case 'pending':
      return {
        icon: ClockIcon,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/50'
      };
  }
};

const SingleStatusIndicator: React.FC<{
  data: StatusIndicatorData;
  size: 'small' | 'medium' | 'large';
  showIcon: boolean;
  hasData: boolean;
}> = ({ data, size, showIcon, hasData }) => {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2',
          icon: 'w-4 h-4',
          text: 'text-xs',
          value: 'text-sm'
        };
      case 'large':
        return {
          container: 'p-4',
          icon: 'w-8 h-8',
          text: 'text-base',
          value: 'text-xl'
        };
      default:
        return {
          container: 'p-3',
          icon: 'w-6 h-6',
          text: 'text-sm',
          value: 'text-lg'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center space-x-3 ${sizeClasses.container} rounded-lg border ${config.borderColor} ${config.bgColor}`}
    >
      {showIcon && (
        <Icon className={`${sizeClasses.icon} ${config.color}`} />
      )}
      <div className="flex-1">
        <p className={`${sizeClasses.text} text-gray-400`}>{data.label}</p>
        {data.value !== undefined && hasData && (
          <p className={`${sizeClasses.value} font-semibold text-white`}>
            {data.value}
          </p>
        )}
        {data.description && hasData && (
          <p className={`${sizeClasses.text} text-gray-500 mt-1`}>
            {data.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  data,
  isLiveData,
  hasData,
  onDataRequest,
  className = '',
  size = 'medium',
  showIcon = true,
  inline = false,
  loading = false,
  error = null
}) => {
  const indicators = Array.isArray(data) ? data : [data];

  const content = (
    <div className={`status-indicators ${className} ${
      inline ? 'flex flex-wrap gap-2' : 'space-y-2'
    }`}>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-16 bg-gray-700 rounded-lg"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm p-3">{error}</div>
      ) : (
        indicators.map((indicator, index) => (
          <SingleStatusIndicator
            key={index}
            data={indicator}
            size={size}
            showIcon={showIcon}
            hasData={hasData}
          />
        ))
      )}
    </div>
  );

  return (
    <EmptyStateWrapper
      hasData={hasData}
      onDataRequest={onDataRequest}
      config={{
        title: 'No Status Data',
        description: 'Ingest data to view status indicators',
      }}
    >
      {content}
    </EmptyStateWrapper>
  );
};

// Compound component for compliance status
interface ComplianceStatusProps extends Omit<DashboardComponentProps, 'data'> {
  compliant: number;
  pendingReview: number;
  nonCompliant: number;
  requiresAction: number;
}

export const ComplianceStatus: React.FC<ComplianceStatusProps> = ({
  compliant,
  pendingReview,
  nonCompliant,
  requiresAction,
  isLiveData,
  hasData,
  onDataRequest,
  className = ''
}) => {
  const statusData: StatusIndicatorData[] = [
    {
      label: 'Compliant',
      status: 'success',
      value: hasData ? compliant : 0,
      description: 'Fully compliant leases'
    },
    {
      label: 'Pending Review',
      status: 'warning',
      value: hasData ? pendingReview : 0,
      description: 'Awaiting compliance review'
    },
    {
      label: 'Non-Compliant',
      status: 'error',
      value: hasData ? nonCompliant : 0,
      description: 'Requires immediate attention'
    },
    {
      label: 'Requires Action',
      status: 'info',
      value: hasData ? requiresAction : 0,
      description: 'Action needed soon'
    }
  ];

  return (
    <div className={`compliance-status ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Compliance Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {statusData.map((status, index) => (
          <StatusIndicator
            key={index}
            data={status}
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
            size="small"
          />
        ))}
      </div>
    </div>
  );
};

// Progress indicator for workflows or processes
interface ProgressIndicatorProps extends DashboardComponentProps {
  label: string;
  current: number;
  total: number;
  status?: 'active' | 'completed' | 'error';
  showPercentage?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  label,
  current,
  total,
  status = 'active',
  showPercentage = true,
  isLiveData,
  hasData,
  onDataRequest,
  className = ''
}) => {
  const percentage = hasData && total > 0 ? (current / total) * 100 : 0;
  
  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const content = (
    <div className={`progress-indicator ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center space-x-2">
          {showPercentage && hasData && (
            <span className="text-sm text-gray-400">{Math.round(percentage)}%</span>
          )}
          {hasData && (
            <span className="text-xs text-gray-500">
              {current} / {total}
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${getProgressColor()}`}
        />
      </div>
    </div>
  );

  return (
    <EmptyStateWrapper
      hasData={hasData}
      onDataRequest={onDataRequest}
      config={{
        title: 'No Progress Data',
        description: 'Ingest data to view progress',
      }}
    >
      {content}
    </EmptyStateWrapper>
  );
};