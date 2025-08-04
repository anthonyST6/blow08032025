import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { SIAScoreDisplayProps } from '../types';

export const SIAScoreDisplay: React.FC<SIAScoreDisplayProps> = ({
  scores,
  size = 'md',
  showLabels = true,
  animated = true,
  showTrend = false,
  previousScores,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'space-x-4',
          scoreContainer: 'w-20 h-20',
          scoreText: 'text-lg',
          labelText: 'text-xs',
          iconSize: 'w-4 h-4',
        };
      case 'md':
        return {
          container: 'space-x-6',
          scoreContainer: 'w-28 h-28',
          scoreText: 'text-2xl',
          labelText: 'text-sm',
          iconSize: 'w-5 h-5',
        };
      case 'lg':
        return {
          container: 'space-x-8',
          scoreContainer: 'w-36 h-36',
          scoreText: 'text-3xl',
          labelText: 'text-base',
          iconSize: 'w-6 h-6',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const scoreData = [
    {
      label: 'Security',
      value: scores.security,
      previousValue: previousScores?.security,
      icon: Shield,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-300',
    },
    {
      label: 'Integrity',
      value: scores.integrity,
      previousValue: previousScores?.integrity,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
    },
    {
      label: 'Accuracy',
      value: scores.accuracy,
      previousValue: previousScores?.accuracy,
      icon: Target,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
    },
  ];

  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || !showTrend) return null;
    const diff = current - previous;
    return {
      value: diff,
      percentage: ((diff / previous) * 100).toFixed(1),
      isPositive: diff > 0,
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses.container}`}>
      {scoreData.map((item, index) => {
        const Icon = item.icon;
        const trend = calculateTrend(item.value, item.previousValue);
        
        return (
          <motion.div
            key={item.label}
            initial={animated ? { opacity: 0, scale: 0.8 } : {}}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            transition={animated ? { delay: index * 0.1, duration: 0.3 } : {}}
            className="text-center"
          >
            <div
              className={`
                ${sizeClasses.scoreContainer}
                ${item.bgColor}
                ${item.borderColor}
                border-2
                rounded-full
                flex
                flex-col
                items-center
                justify-center
                relative
                shadow-lg
              `}
            >
              <Icon className={`${sizeClasses.iconSize} ${item.textColor} mb-1`} />
              <div className={`${sizeClasses.scoreText} font-bold ${getScoreColor(item.value)}`}>
                {item.value}
              </div>
              
              {/* Progress ring */}
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={animated ? `${2 * Math.PI * 45 * (1 - item.value / 100)}` : 0}
                  className={item.textColor}
                  initial={animated ? { strokeDashoffset: 2 * Math.PI * 45 } : {}}
                  animate={animated ? { strokeDashoffset: 2 * Math.PI * 45 * (1 - item.value / 100) } : {}}
                  transition={animated ? { duration: 1, delay: index * 0.1 } : {}}
                />
              </svg>
            </div>
            
            {showLabels && (
              <div className="mt-2">
                <p className={`${sizeClasses.labelText} font-medium text-gray-700`}>
                  {item.label}
                </p>
                {trend && (
                  <div className={`flex items-center justify-center mt-1 ${sizeClasses.labelText}`}>
                    {trend.isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {trend.isPositive ? '+' : ''}{trend.percentage}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};