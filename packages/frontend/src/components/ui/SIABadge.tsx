import React from 'react';
import { motion } from 'framer-motion';
import { SIAMetric, getSIAClass, SIA_LABELS } from '../../utils/sia';

interface SIABadgeProps {
  metric: SIAMetric;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost' | 'glow';
  animated?: boolean;
  pulse?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const SIABadge: React.FC<SIABadgeProps> = ({
  metric,
  label,
  size = 'sm',
  variant = 'solid',
  animated = false,
  pulse = false,
  className = '',
}) => {
  const displayLabel = label || SIA_LABELS[metric];
  const sizeClass = sizeClasses[size];

  const variantClasses = {
    solid: `${getSIAClass(metric, 'bg')} text-white border ${getSIAClass(metric, 'border')}`,
    outline: `bg-transparent ${getSIAClass(metric, 'text')} border ${getSIAClass(metric, 'border')}`,
    ghost: `${getSIAClass(metric, 'bg')}/10 ${getSIAClass(metric, 'text')} border ${getSIAClass(metric, 'border')}/30`,
    glow: `${getSIAClass(metric, 'bg')} text-white border ${getSIAClass(metric, 'border')} shadow-lg ${getSIAClass(metric, 'glow')}`,
  };

  const badge = (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClass}
        ${variantClasses[variant]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {displayLabel}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
};

// Compound badge for showing all three SIA metrics
interface SIABadgeGroupProps {
  showSecurity?: boolean;
  showIntegrity?: boolean;
  showAccuracy?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost' | 'glow';
  animated?: boolean;
  className?: string;
}

export const SIABadgeGroup: React.FC<SIABadgeGroupProps> = ({
  showSecurity = true,
  showIntegrity = true,
  showAccuracy = true,
  size = 'sm',
  variant = 'ghost',
  animated = false,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {showSecurity && (
        <SIABadge
          metric="security"
          label="S"
          size={size}
          variant={variant}
          animated={animated}
        />
      )}
      {showIntegrity && (
        <SIABadge
          metric="integrity"
          label="I"
          size={size}
          variant={variant}
          animated={animated}
        />
      )}
      {showAccuracy && (
        <SIABadge
          metric="accuracy"
          label="A"
          size={size}
          variant={variant}
          animated={animated}
        />
      )}
    </div>
  );
};

// Status badge with SIA coloring
interface SIAStatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'failed' | 'warning';
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export const SIAStatusBadge: React.FC<SIAStatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const statusConfig = {
    active: { metric: 'accuracy' as SIAMetric, label: label || 'Active' },
    pending: { metric: 'security' as SIAMetric, label: label || 'Pending' },
    completed: { metric: 'accuracy' as SIAMetric, label: label || 'Completed' },
    failed: { metric: 'integrity' as SIAMetric, label: label || 'Failed' },
    warning: { metric: 'integrity' as SIAMetric, label: label || 'Warning' },
  };

  const config = statusConfig[status];

  return (
    <SIABadge
      metric={config.metric}
      label={config.label}
      size={size}
      variant="ghost"
      pulse={pulse && (status === 'active' || status === 'pending')}
      className={className}
    />
  );
};