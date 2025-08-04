import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CircularSIAMetricsProps {
  security: number;
  integrity: number;
  accuracy: number;
  onMetricClick?: (metric: 'security' | 'integrity' | 'accuracy') => void;
}

export const CircularSIAMetrics: React.FC<CircularSIAMetricsProps> = ({
  security,
  integrity,
  accuracy,
  onMetricClick,
}) => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const metrics = [
    { name: 'Security', value: security, color: '#3A88F5', key: 'security' as const },
    { name: 'Integrity', value: integrity, color: '#DC3E40', key: 'integrity' as const },
    { name: 'Accuracy', value: accuracy, color: '#3BD16F', key: 'accuracy' as const },
  ];

  const radius = 45;
  const strokeWidth = 3;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="flex items-center space-x-8">
      {metrics.map((metric) => {
        const strokeDashoffset = circumference - (metric.value / 100) * circumference;
        const isHovered = hoveredMetric === metric.key;

        return (
          <motion.div
            key={metric.key}
            className="relative cursor-pointer"
            onMouseEnter={() => setHoveredMetric(metric.key)}
            onMouseLeave={() => setHoveredMetric(null)}
            onClick={() => onMetricClick?.(metric.key)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* Metric value and label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-400 mb-1">{metric.name}</div>
              <div className="text-2xl font-bold text-white">{metric.value}%</div>
            </div>

            {/* SVG Circle */}
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                stroke={metric.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeOpacity: 0.2 }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Progress circle */}
              <motion.circle
                stroke={metric.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${metric.color})` : undefined,
                }}
              />
            </svg>

            {/* Hover effect glow */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: `radial-gradient(circle, ${metric.color}20 0%, transparent 70%)`,
                  filter: `blur(20px)`,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default CircularSIAMetrics;