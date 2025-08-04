import React from 'react';
import { motion } from 'framer-motion';
import { TaskSummary } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  CheckCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface TaskSummaryBoxProps {
  summary: TaskSummary;
  onTaskTypeClick?: (type: 'completed' | 'ongoing' | 'pending') => void;
}

interface TaskStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  onClick?: () => void;
  index: number;
}

const TaskStat: React.FC<TaskStatProps> = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  onClick,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center p-4 rounded-lg ${bgColor}/10 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-lg ${bgColor}/20 ${color} mb-2 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        className="text-2xl font-bold text-seraphim-text"
      >
        {value.toLocaleString()}
      </motion.div>
      <p className="text-xs text-seraphim-text-dim mt-1">{label}</p>
    </motion.div>
  );
};

export const TaskSummaryBox: React.FC<TaskSummaryBoxProps> = ({
  summary,
  onTaskTypeClick,
}) => {
  const taskStats = [
    {
      icon: CheckCircleIcon,
      label: 'Completed',
      value: summary.completed,
      color: 'text-green-400',
      bgColor: 'bg-green-400',
      type: 'completed' as const,
    },
    {
      icon: ArrowPathIcon,
      label: 'Ongoing',
      value: summary.ongoing,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400',
      type: 'ongoing' as const,
    },
    {
      icon: ClockIcon,
      label: 'Pending',
      value: summary.pending,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400',
      type: 'pending' as const,
    },
  ];

  const totalTasks = summary.completed + summary.ongoing + summary.pending;
  const completionRate = totalTasks > 0 ? (summary.completed / totalTasks) * 100 : 0;

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-seraphim-gold mr-2" />
          Task Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {taskStats.map((stat, index) => (
            <TaskStat
              key={stat.type}
              {...stat}
              onClick={() => onTaskTypeClick?.(stat.type)}
              index={index}
            />
          ))}
        </div>
        
        <div className="space-y-3 pt-3 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
              <span className="text-sm text-seraphim-text-dim">Failure Rate</span>
            </div>
            <span className={`text-sm font-medium ${
              summary.failureRate > 5 ? 'text-red-400' : 'text-green-400'
            }`}>
              {summary.failureRate.toFixed(1)}%
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-seraphim-text-dim">Avg. Completion</span>
            </div>
            <span className="text-sm font-medium text-seraphim-text">
              {summary.averageCompletionTime} min
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-seraphim-text-dim">Overall Progress</span>
              <span className="text-xs text-seraphim-text">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-seraphim-gold to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>
      </CardContent>
    </>
  );
};

export default TaskSummaryBox;