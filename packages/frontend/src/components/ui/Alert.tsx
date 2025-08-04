import React from 'react';
import { clsx } from 'clsx';

interface AlertProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export const Alert: React.FC<AlertProps> = ({
  className,
  children,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-gray-800 border-gray-700 text-gray-300',
    destructive: 'bg-red-900/20 border-red-500/50 text-red-400',
    warning: 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400',
    success: 'bg-green-900/20 border-green-500/50 text-green-400'
  };

  return (
    <div
      role="alert"
      className={clsx(
        'relative w-full rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
};

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  className,
  children
}) => {
  return (
    <div className={clsx('text-sm [&_p]:leading-relaxed', className)}>
      {children}
    </div>
  );
};

interface AlertTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({
  className,
  children
}) => {
  return (
    <h5 className={clsx('mb-1 font-medium leading-none tracking-tight', className)}>
      {children}
    </h5>
  );
};