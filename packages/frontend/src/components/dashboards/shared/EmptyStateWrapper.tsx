import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { EmptyStateConfig } from './types';

interface EmptyStateWrapperProps {
  children: React.ReactNode;
  hasData: boolean;
  config?: EmptyStateConfig;
  onDataRequest?: () => void;
}

export const EmptyStateWrapper: React.FC<EmptyStateWrapperProps> = ({
  children,
  hasData,
  config,
  onDataRequest
}) => {
  if (hasData) {
    return <>{children}</>;
  }

  const defaultConfig: EmptyStateConfig = {
    title: 'No Data Available',
    description: 'Please ingest data to view this visualization',
    icon: CloudArrowUpIcon,
    actionLabel: 'Go to Data Ingestion',
    onAction: onDataRequest
  };

  const finalConfig = { ...defaultConfig, ...config };
  const Icon = finalConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Grayed out placeholder */}
      <div className="opacity-20 pointer-events-none">
        {children}
      </div>

      {/* Empty state overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          {Icon && (
            <Icon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          )}
          <h3 className="text-lg font-semibold text-white mb-2">
            {finalConfig.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {finalConfig.description}
          </p>
          {finalConfig.onAction && (
            <Button
              variant="primary"
              size="small"
              onClick={finalConfig.onAction}
            >
              {finalConfig.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Higher-order component for easy wrapping
export function withEmptyState<P extends { hasData: boolean }>(
  Component: React.ComponentType<P>,
  config?: EmptyStateConfig
) {
  return (props: P & { onDataRequest?: () => void }) => {
    return (
      <EmptyStateWrapper
        hasData={props.hasData}
        config={config}
        onDataRequest={props.onDataRequest}
      >
        <Component {...props} />
      </EmptyStateWrapper>
    );
  };
}