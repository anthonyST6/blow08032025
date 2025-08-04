import React from 'react';
import { motion } from 'framer-motion';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

// Custom Security Icon - Shield with Plus
const SecurityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 3v6c0 5.5-3.5 10.5-8 11.8-4.5-1.3-8-6.3-8-11.8V5l8-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
  </svg>
);

// Custom Integrity Icon - Sword pointing down
const IntegrityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Pommel */}
    <circle cx="12" cy="3" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Handle */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5h3v3h-3z" />
    {/* Cross guard */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10" />
    {/* Blade */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v10" />
    {/* Blade edges */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8v9.5L12 20l1.5-2.5V8" />
  </svg>
);

export type SIAMetricType = 'security' | 'integrity' | 'accuracy';

export interface SIAMetricProps {
  metric: SIAMetricType;
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

const metricConfig = {
  security: {
    label: 'Security',
    icon: SecurityIcon,
    color: 'text-vanguard-security',
    bgColor: 'bg-vanguard-security',
    borderColor: 'border-vanguard-security',
    glowColor: 'shadow-glow-blue',
  },
  integrity: {
    label: 'Integrity',
    icon: IntegrityIcon,
    color: 'text-vanguard-integrity',
    bgColor: 'bg-vanguard-integrity',
    borderColor: 'border-vanguard-integrity',
    glowColor: 'shadow-glow-red',
  },
  accuracy: {
    label: 'Accuracy',
    icon: ScaleIcon,
    color: 'text-vanguard-accuracy',
    bgColor: 'bg-vanguard-accuracy',
    borderColor: 'border-vanguard-accuracy',
    glowColor: 'shadow-glow-green',
  },
};

export const SIAMetric: React.FC<SIAMetricProps> = ({
  metric,
  value,
  label,
  size = 'md',
  showIcon = true,
  showLabel = true,
  animate = true,
  onClick,
}) => {
  const config = metricConfig[metric];
  const Icon = config.icon;

  const sizeStyles = {
    sm: {
      container: 'w-24 h-24',
      icon: 'h-4 w-4',
      value: 'text-lg',
      label: 'text-xs',
    },
    md: {
      container: 'w-32 h-32',
      icon: 'h-5 w-5',
      value: 'text-2xl',
      label: 'text-sm',
    },
    lg: {
      container: 'w-40 h-40',
      icon: 'h-6 w-6',
      value: 'text-3xl',
      label: 'text-base',
    },
  };

  const styles = sizeStyles[size];

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex flex-col items-center',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className={clsx(
        'relative flex items-center justify-center rounded-full',
        `${config.bgColor}/10`,
        styles.container,
        onClick && 'hover:scale-105 transition-transform duration-200'
      )}>
        {/* Progress Circle */}
        <svg className="absolute inset-0 -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`${config.color} opacity-20`}
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={config.color}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: value / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: '1 1',
              pathLength: value / 100,
            }}
          />
        </svg>

        {/* Content */}
        <div className="relative flex flex-col items-center">
          {showIcon && (
            <Icon className={clsx(styles.icon, config.color, 'mb-1')} />
          )}
          <span className={clsx(styles.value, 'font-bold text-white')}>
            {Math.round(value)}%
          </span>
        </div>
      </div>

      {showLabel && (
        <p className={clsx(styles.label, 'mt-2 text-seraphim-text-dim')}>
          {label || config.label}
        </p>
      )}
    </motion.div>
  );
};

export interface SIAMetricsProps {
  security: number;
  integrity: number;
  accuracy: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'card';
  layout?: 'horizontal' | 'grid';
  animate?: boolean;
  onMetricClick?: (metric: SIAMetricType) => void;
}

export const SIAMetrics: React.FC<SIAMetricsProps> = ({
  security,
  integrity,
  accuracy,
  size = 'md',
  variant = 'inline',
  layout = 'horizontal',
  animate = true,
  onMetricClick,
}) => {
  const metrics = [
    { metric: 'security' as SIAMetricType, value: security },
    { metric: 'integrity' as SIAMetricType, value: integrity },
    { metric: 'accuracy' as SIAMetricType, value: accuracy },
  ];

  const layoutStyles = {
    horizontal: 'flex flex-row space-x-6',
    grid: 'grid grid-cols-3 gap-6',
  };

  if (variant === 'card') {
    return (
      <div className={layoutStyles[layout]}>
        {metrics.map(({ metric, value }) => (
          <motion.div
            key={metric}
            whileHover={{ scale: 1.05 }}
            className={clsx(
              "bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300",
              onMetricClick && "cursor-pointer"
            )}
            onClick={() => onMetricClick?.(metric)}
          >
            <SIAMetric
              metric={metric}
              value={value}
              size={size}
              animate={animate}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={layoutStyles[layout]}>
      {metrics.map(({ metric, value }) => (
        <SIAMetric
          key={metric}
          metric={metric}
          value={value}
          size={size}
          animate={animate}
          onClick={() => onMetricClick?.(metric)}
        />
      ))}
    </div>
  );
};

export interface SIAIndicatorProps {
  metric: SIAMetricType;
  value: number;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
}

export const SIAIndicator: React.FC<SIAIndicatorProps> = ({
  metric,
  value,
  size = 'sm',
  pulse = false,
}) => {
  const config = metricConfig[metric];

  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
  };

  const getStatusColor = (value: number) => {
    if (value >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (value >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        sizeStyles[size],
        getStatusColor(value),
        pulse && 'animate-pulse'
      )}
    >
      {Math.round(value)}%
    </span>
  );
};

export default SIAMetric;