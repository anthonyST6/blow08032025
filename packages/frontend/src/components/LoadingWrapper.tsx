import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';

interface LoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  delay?: number;
  minHeight?: string;
  loadingText?: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  isLoading = false,
  delay = 300,
  minHeight = '200px',
  loadingText = 'Loading...'
}) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      // Show loading after delay to prevent flash for quick loads
      timeout = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, delay]);

  if (showLoading || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center p-8"
        style={{ minHeight }}
      >
        <LoadingSpinner size="large" />
        {loadingText && (
          <p className="mt-4 text-sm text-gray-400">{loadingText}</p>
        )}
      </motion.div>
    );
  }

  return <>{children}</>;
};

// Skeleton loader for sections
export const SectionSkeleton: React.FC<{ height?: string }> = ({ height = '400px' }) => {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-12 bg-gray-800 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-800 rounded-lg"></div>
        <div className="h-32 bg-gray-800 rounded-lg"></div>
        <div className="h-32 bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  );
};

export default LoadingWrapper;